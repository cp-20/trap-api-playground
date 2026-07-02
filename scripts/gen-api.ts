import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import openapiTS, { astToString } from "openapi-typescript";
import { parse } from "yaml";
import { OPENAPI_URL } from "../src/config";
import { extractOperations } from "../src/features/operations/catalog";

type SchemaObject = Record<string, unknown>;
type OpenApiDocument = {
  components?: {
    schemas?: Record<string, SchemaObject>;
    parameters?: Record<string, SchemaObject>;
  };
  paths?: Record<string, Record<string, unknown>>;
};

const operationsOutput = resolve("src/generated/traq-operations.json");
const openApiTypesOutput = resolve("src/generated/traq-openapi.ts");
const dtsOutput = resolve("src/generated/traq-api-types.d.ts");
const textOutput = resolve("src/generated/traq-api-types.ts");
const methods = new Set(["get", "post", "put", "patch", "delete", "head", "options"]);

const typeName = (name: string): string => {
  const cleaned = name.replace(/[^A-Za-z0-9_$]/g, "_");
  return /^[A-Za-z_$]/.test(cleaned) ? cleaned : `_${cleaned}`;
};

const propertyName = (name: string): string => {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : JSON.stringify(name);
};

const literal = (value: unknown): string => {
  return JSON.stringify(value);
};

const cleanDoc = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const text = value.replace(/\r\n?/g, "\n").replace(/\*\//g, "* /").trim();
  return text || null;
};

const docBlock = (indent: string, parts: Array<string | null | undefined>): string => {
  const lines = parts
    .filter((part): part is string => !!part)
    .flatMap((part, index) => {
      const textLines = part.split("\n");
      return index === 0 ? textLines : ["", ...textLines];
    });
  if (!lines.length) return "";

  return [
    `${indent}/**`,
    ...lines.map((line) => (line ? `${indent} * ${line}` : `${indent} *`)),
    `${indent} */`,
  ].join("\n");
};

const schemaDoc = (schema: unknown): string | null => {
  if (!schema || typeof schema !== "object") return null;
  const object = schema as SchemaObject;
  return cleanDoc(object.description) ?? cleanDoc(object.title);
};

const resolveRef = (ref: string, document: OpenApiDocument): SchemaObject | undefined => {
  const schemaPrefix = "#/components/schemas/";
  const parameterPrefix = "#/components/parameters/";
  if (ref.startsWith(schemaPrefix))
    return document.components?.schemas?.[ref.slice(schemaPrefix.length)];
  if (ref.startsWith(parameterPrefix)) {
    return document.components?.parameters?.[ref.slice(parameterPrefix.length)];
  }
  return undefined;
};

/**
 * Converts the subset of OpenAPI schema shapes used by traQ into ambient
 * TypeScript. Recursive refs are intentionally collapsed to unknown to keep the
 * generated playground declarations finite.
 */
const schemaToTs = (
  schema: unknown,
  document: OpenApiDocument,
  seen = new Set<unknown>(),
): string => {
  if (!schema || typeof schema !== "object") return "unknown";
  if (seen.has(schema)) return "unknown";
  seen.add(schema);

  const object = schema as SchemaObject;
  if (typeof object.$ref === "string") {
    return `Traq.${typeName(object.$ref.split("/").at(-1) ?? "Unknown")}`;
  }

  const nullable = object.nullable === true ? " | null" : "";
  if (Array.isArray(object.enum)) {
    return `${object.enum.map(literal).join(" | ") || "unknown"}${nullable}`;
  }

  for (const key of ["oneOf", "anyOf"] as const) {
    if (Array.isArray(object[key])) {
      return `${object[key].map((item) => schemaToTs(item, document, seen)).join(" | ")}${nullable}`;
    }
  }

  if (Array.isArray(object.allOf)) {
    return `${object.allOf.map((item) => schemaToTs(item, document, seen)).join(" & ")}${nullable}`;
  }

  const type = object.type;
  if (type === "array") return `${schemaToTs(object.items, document, seen)}[]${nullable}`;
  if (type === "integer" || type === "number") return `number${nullable}`;
  if (type === "boolean") return `boolean${nullable}`;
  if (type === "string") {
    if (object.format === "binary") return `Blob${nullable}`;
    return `string${nullable}`;
  }

  if (type === "object" || object.properties) {
    const properties = object.properties as Record<string, unknown> | undefined;
    const required = new Set(Array.isArray(object.required) ? object.required.map(String) : []);
    const lines = Object.entries(properties ?? {}).map(([key, value]) => {
      const doc = docBlock("  ", [schemaDoc(value)]);
      const property = `  ${propertyName(key)}${required.has(key) ? "" : "?"}: ${schemaToTs(
        value,
        document,
        new Set(seen),
      )};`;
      return doc ? `${doc}\n${property}` : property;
    });

    if (object.additionalProperties && typeof object.additionalProperties === "object") {
      lines.push(
        `  [key: string]: ${schemaToTs(object.additionalProperties, document, new Set(seen))};`,
      );
    } else if (!properties) {
      lines.push("  [key: string]: unknown;");
    }

    return `{\n${lines.join("\n")}\n}${nullable}`;
  }

  const resolved = typeof object.$ref === "string" ? resolveRef(object.$ref, document) : undefined;
  return resolved ? schemaToTs(resolved, document, seen) : `unknown${nullable}`;
};

const refOrSchemaToTs = (value: unknown, document: OpenApiDocument): string => {
  return schemaToTs(value, document);
};

const contentSchema = (content: unknown): unknown => {
  if (!content || typeof content !== "object") return undefined;
  const record = content as Record<string, { schema?: unknown }>;
  return (
    record["application/json"]?.schema ??
    record["multipart/form-data"]?.schema ??
    record["application/x-www-form-urlencoded"]?.schema ??
    Object.values(record)[0]?.schema
  );
};

const parameterList = (...groups: unknown[]): SchemaObject[] => {
  return groups
    .flatMap((group) => (Array.isArray(group) ? group : []))
    .filter((item): item is SchemaObject => !!item && typeof item === "object");
};

const resolveParameter = (parameter: SchemaObject, document: OpenApiDocument): SchemaObject => {
  if (typeof parameter.$ref === "string") {
    return resolveRef(parameter.$ref, document) ?? parameter;
  }
  return parameter;
};

/**
 * Adds missing path parameters inferred from `/foo/{id}` templates. Some specs
 * omit explicit parameter objects, but the notebook API still needs a typed
 * `input.path.id`.
 */
const pathParametersFromTemplate = (path: string, parameters: SchemaObject[]): SchemaObject[] => {
  const existing = new Set(
    parameters
      .filter((parameter) => parameter.in === "path")
      .map((parameter) => String(parameter.name)),
  );
  const matches = [...path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
  return matches
    .filter((name) => !existing.has(name))
    .map((name) => ({
      name,
      in: "path",
      required: true,
      schema: { type: "string" },
    }));
};

/**
 * Groups OpenAPI parameters by location into the object passed to api methods,
 * marking the whole object required when any contained parameter is required.
 */
const objectTypeFromParameters = (
  parameters: SchemaObject[],
  location: "path" | "query",
  document: OpenApiDocument,
): { type: string; required: boolean } | null => {
  const selected = parameters.filter((parameter) => parameter.in === location);
  if (!selected.length) return null;
  const lines = selected.map((parameter) => {
    const name = String(parameter.name);
    const schema = parameter.schema ?? { type: "string" };
    const description = cleanDoc(parameter.description) ?? schemaDoc(schema);
    const doc = docBlock("    ", [description]);
    const property = `    ${propertyName(name)}${parameter.required ? "" : "?"}: ${refOrSchemaToTs(
      schema,
      document,
    )};`;
    return doc ? `${doc}\n${property}` : property;
  });
  return {
    type: `{\n${lines.join("\n")}\n  }`,
    required: selected.some((parameter) => parameter.required === true),
  };
};

const responseType = (operation: SchemaObject, document: OpenApiDocument): string => {
  const responses = operation.responses as Record<string, SchemaObject> | undefined;
  if (!responses) return "unknown";
  const entry =
    responses["200"] ??
    responses["201"] ??
    responses["204"] ??
    responses.default ??
    Object.entries(responses).find(([status]) => status.startsWith("2"))?.[1] ??
    Object.values(responses)[0];
  const schema = contentSchema(entry?.content);
  return entry && !schema ? "null" : refOrSchemaToTs(schema, document);
};

const requestBodyType = (
  operation: SchemaObject,
  document: OpenApiDocument,
): {
  type: string;
  required: boolean;
  contentTypes: string[];
  description: string | null;
} | null => {
  const requestBody = operation.requestBody as SchemaObject | undefined;
  if (!requestBody) return null;
  const schema = contentSchema(requestBody.content);
  if (!schema) return null;
  return {
    type: refOrSchemaToTs(schema, document),
    required: requestBody.required === true,
    contentTypes:
      requestBody.content && typeof requestBody.content === "object"
        ? Object.keys(requestBody.content)
        : [],
    description: cleanDoc(requestBody.description) ?? schemaDoc(schema),
  };
};

/**
 * Builds the ambient declaration consumed by Monaco. It includes Traq schema
 * aliases, the generated `api` surface, notebook `util`, and the runtime globals.
 */
const buildApiDeclaration = (document: OpenApiDocument): string => {
  const schemaLines = Object.entries(document.components?.schemas ?? {}).map(([name, schema]) => {
    const doc = docBlock("  ", [schemaDoc(schema)]);
    const type = `  export type ${typeName(name)} = ${schemaToTs(schema, document)};`;
    return doc ? `${doc}\n${type}` : type;
  });

  const apiLines: string[] = [];
  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    const commonParameters = pathItem.parameters;
    for (const [method, value] of Object.entries(pathItem)) {
      if (!methods.has(method)) continue;
      const operation = value as SchemaObject;
      const operationId = operation.operationId;
      if (typeof operationId !== "string") continue;

      const parameters = parameterList(commonParameters, operation.parameters).map((parameter) =>
        resolveParameter(parameter, document),
      );
      parameters.push(...pathParametersFromTemplate(path, parameters));
      const pathType = objectTypeFromParameters(parameters, "path", document);
      const queryType = objectTypeFromParameters(parameters, "query", document);
      const bodyType = requestBodyType(operation, document);
      const inputLines: string[] = [];
      if (pathType) {
        inputLines.push(
          `${docBlock("  ", ["エンドポイント URL に埋め込む path パラメータです。"])}\n  path${
            pathType.required ? "" : "?"
          }: ${pathType.type};`,
        );
      }
      if (queryType) {
        inputLines.push(
          `${docBlock("  ", ["URL の query string として送るパラメータです。"])}\n  query${
            queryType.required ? "" : "?"
          }: ${queryType.type};`,
        );
      }
      if (bodyType) {
        inputLines.push(
          `${docBlock("  ", [
            bodyType.description,
            bodyType.contentTypes.length
              ? `リクエスト body です。Content-Type: ${bodyType.contentTypes.join(", ")}.`
              : "リクエスト body です。",
          ])}\n  body${bodyType.required ? "" : "?"}: ${bodyType.type};`,
        );
      }
      inputLines.push(
        `${docBlock("  ", [
          "multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。",
        ])}\n  form?: Record<string, string | Blob>;`,
      );
      const inputType = `{\n${inputLines.join("\n")}\n}`;
      const inputOptional =
        !pathType?.required && !queryType?.required && !bodyType?.required ? "?" : "";
      const summary = cleanDoc(operation.summary);
      const description = cleanDoc(operation.description);
      const operationDoc = docBlock("  ", [
        summary ?? description ?? `${method.toUpperCase()} ${path}`,
        description && description !== summary ? description : null,
        `Endpoint: ${method.toUpperCase()} ${path}`,
        Array.isArray(operation.tags) && operation.tags.length
          ? `Tags: ${operation.tags.map(String).join(", ")}`
          : null,
      ]);
      apiLines.push(
        `${operationDoc}\n  ${operationId}(input${inputOptional}: ${inputType}): Promise<${responseType(
          operation,
          document,
        )}>;`,
      );
    }
  }

  return (
    `declare namespace Traq {\n${schemaLines.join("\n\n")}\n}\n\n` +
    `${docBlock("", [
      "ノートブックのセル内で使える traQ API メソッドです。",
      "現在の OAuth token でリクエストし、結果を Network Log に記録します。",
    ])}\n` +
    `declare const api: {\n${apiLines.join("\n\n")}\n};\n\n` +
    `${docBlock("", ["ノートブックのセル内で使える小さな補助関数です。"])}\n` +
    `declare const util: {\n` +
    `${docBlock("  ", ["指定したミリ秒だけ待機します。"])}\n` +
    `  sleep(ms: number): Promise<void>;\n` +
    `${docBlock("  ", [
      "limit/offset 形式の API を、短いページが返るまで全ページ取得します。",
      "callback は `{ limit, offset }` を受け取り、1ページ分の配列を返してください。",
    ])}\n` +
    `  pageAll<T>(fetchPage: (params: { limit: number; offset: number }) => Promise<T[]>, pageSize?: number): Promise<T[]>;\n` +
    `${docBlock("  ", ["値が UUID 文字列なら true を返します。"])}\n` +
    `  isUuid(value: unknown): boolean;\n` +
    `${docBlock("  ", ["現在時刻を ISO 8601 文字列で返します。"])}\n` +
    `  now(): string;\n` +
    `};\n` +
    `${docBlock("", ["スラッシュ区切りの fullPath を付与した traQ チャンネルです。"])}\n` +
    `type TraqChannelWithFullPath = Traq.Channel & { fullPath: string };\n` +
    `${docBlock("", ["現在ログインしている traQ ユーザーです。"])}\n` +
    `declare const me: Traq.MyUserDetail;\n` +
    `${docBlock("", ["ノートブック開始時に読み込んだ全ユーザーです。ユーザー名順に並んでいます。"])}\n` +
    `declare const users: Traq.User[];\n` +
    `${docBlock("", ["ノートブック開始時に読み込んだ全公開チャンネルです。各要素に `fullPath` が付きます。"])}\n` +
    `declare const channels: TraqChannelWithFullPath[];\n` +
    `${docBlock("", ["ノートブック開始時に読み込んだ全ユーザーグループです。名前順に並んでいます。"])}\n` +
    `declare const groups: Traq.UserGroup[];\n`
  );
};

const asTsStringModule = (value: string): string => {
  return `export const traqApiTypes = ${JSON.stringify(minifyDeclaration(value))};\n`;
};

const minifyDeclaration = (source: string): string => {
  return source
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const response = await fetch(OPENAPI_URL);
if (!response.ok) {
  throw new Error(`Failed to fetch OpenAPI: HTTP ${response.status}`);
}

const document = parse(await response.text()) as OpenApiDocument;
const operations = extractOperations(document);
const declaration = buildApiDeclaration(document);
const openApiTypes = astToString(
  await openapiTS(document as never, {
    exportType: true,
    rootTypes: false,
  }),
);

await mkdir(dirname(operationsOutput), { recursive: true });
await writeFile(operationsOutput, `${JSON.stringify(operations, null, 2)}\n`);
await writeFile(openApiTypesOutput, openApiTypes);
await writeFile(dtsOutput, declaration);
await writeFile(textOutput, asTsStringModule(declaration));

console.log(`Generated ${operations.length} operations -> ${operationsOutput}`);
console.log(`Generated OpenAPI types -> ${openApiTypesOutput}`);
console.log(`Generated API types -> ${dtsOutput}`);
