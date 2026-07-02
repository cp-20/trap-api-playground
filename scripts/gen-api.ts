import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parse } from "yaml";
import { OPENAPI_URL } from "../src/config";
import { extractOperations } from "../src/api/openapi";

type SchemaObject = Record<string, unknown>;
type OpenApiDocument = {
  components?: {
    schemas?: Record<string, SchemaObject>;
    parameters?: Record<string, SchemaObject>;
  };
  paths?: Record<string, Record<string, unknown>>;
};

const operationsOutput = resolve("src/generated/traq-operations.json");
const dtsOutput = resolve("src/generated/traq-api-types.d.ts");
const textOutput = resolve("src/generated/traq-api-types.ts");
const methods = new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
]);

function typeName(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9_$]/g, "_");
  return /^[A-Za-z_$]/.test(cleaned) ? cleaned : `_${cleaned}`;
}

function propertyName(name: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : JSON.stringify(name);
}

function literal(value: unknown): string {
  return JSON.stringify(value);
}

function resolveRef(
  ref: string,
  document: OpenApiDocument,
): SchemaObject | undefined {
  const schemaPrefix = "#/components/schemas/";
  const parameterPrefix = "#/components/parameters/";
  if (ref.startsWith(schemaPrefix))
    return document.components?.schemas?.[ref.slice(schemaPrefix.length)];
  if (ref.startsWith(parameterPrefix)) {
    return document.components?.parameters?.[ref.slice(parameterPrefix.length)];
  }
  return undefined;
}

function schemaToTs(
  schema: unknown,
  document: OpenApiDocument,
  seen = new Set<unknown>(),
): string {
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
  if (type === "array")
    return `${schemaToTs(object.items, document, seen)}[]${nullable}`;
  if (type === "integer" || type === "number") return `number${nullable}`;
  if (type === "boolean") return `boolean${nullable}`;
  if (type === "string") {
    if (object.format === "binary") return `Blob${nullable}`;
    return `string${nullable}`;
  }

  if (type === "object" || object.properties) {
    const properties = object.properties as Record<string, unknown> | undefined;
    const required = new Set(
      Array.isArray(object.required) ? object.required.map(String) : [],
    );
    const lines = Object.entries(properties ?? {}).map(([key, value]) => {
      return `  ${propertyName(key)}${required.has(key) ? "" : "?"}: ${schemaToTs(
        value,
        document,
        new Set(seen),
      )};`;
    });

    if (
      object.additionalProperties &&
      typeof object.additionalProperties === "object"
    ) {
      lines.push(
        `  [key: string]: ${schemaToTs(object.additionalProperties, document, new Set(seen))};`,
      );
    } else if (!properties) {
      lines.push("  [key: string]: unknown;");
    }

    return `{\n${lines.join("\n")}\n}${nullable}`;
  }

  const resolved =
    typeof object.$ref === "string"
      ? resolveRef(object.$ref, document)
      : undefined;
  return resolved ? schemaToTs(resolved, document, seen) : `unknown${nullable}`;
}

function refOrSchemaToTs(value: unknown, document: OpenApiDocument): string {
  return schemaToTs(value, document);
}

function contentSchema(content: unknown): unknown {
  if (!content || typeof content !== "object") return undefined;
  const record = content as Record<string, { schema?: unknown }>;
  return (
    record["application/json"]?.schema ??
    record["multipart/form-data"]?.schema ??
    record["application/x-www-form-urlencoded"]?.schema ??
    Object.values(record)[0]?.schema
  );
}

function parameterList(...groups: unknown[]): SchemaObject[] {
  return groups
    .flatMap((group) => (Array.isArray(group) ? group : []))
    .filter((item): item is SchemaObject => !!item && typeof item === "object");
}

function resolveParameter(
  parameter: SchemaObject,
  document: OpenApiDocument,
): SchemaObject {
  if (typeof parameter.$ref === "string") {
    return resolveRef(parameter.$ref, document) ?? parameter;
  }
  return parameter;
}

function pathParametersFromTemplate(
  path: string,
  parameters: SchemaObject[],
): SchemaObject[] {
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
}

function objectTypeFromParameters(
  parameters: SchemaObject[],
  location: "path" | "query",
  document: OpenApiDocument,
): { type: string; required: boolean } | null {
  const selected = parameters.filter((parameter) => parameter.in === location);
  if (!selected.length) return null;
  const lines = selected.map((parameter) => {
    const name = String(parameter.name);
    const schema = parameter.schema ?? { type: "string" };
    return `    ${propertyName(name)}${parameter.required ? "" : "?"}: ${refOrSchemaToTs(
      schema,
      document,
    )};`;
  });
  return {
    type: `{\n${lines.join("\n")}\n  }`,
    required: selected.some((parameter) => parameter.required === true),
  };
}

function responseType(
  operation: SchemaObject,
  document: OpenApiDocument,
): string {
  const responses = operation.responses as
    Record<string, SchemaObject> | undefined;
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
}

function requestBodyType(
  operation: SchemaObject,
  document: OpenApiDocument,
): {
  type: string;
  required: boolean;
} | null {
  const requestBody = operation.requestBody as SchemaObject | undefined;
  if (!requestBody) return null;
  const schema = contentSchema(requestBody.content);
  if (!schema) return null;
  return {
    type: refOrSchemaToTs(schema, document),
    required: requestBody.required === true,
  };
}

function buildApiDeclaration(document: OpenApiDocument): string {
  const schemaLines = Object.entries(document.components?.schemas ?? {}).map(
    ([name, schema]) => {
      return `  export type ${typeName(name)} = ${schemaToTs(schema, document)};`;
    },
  );

  const apiLines: string[] = [];
  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    const commonParameters = pathItem.parameters;
    for (const [method, value] of Object.entries(pathItem)) {
      if (!methods.has(method)) continue;
      const operation = value as SchemaObject;
      const operationId = operation.operationId;
      if (typeof operationId !== "string") continue;

      const parameters = parameterList(
        commonParameters,
        operation.parameters,
      ).map((parameter) => resolveParameter(parameter, document));
      parameters.push(...pathParametersFromTemplate(path, parameters));
      const pathType = objectTypeFromParameters(parameters, "path", document);
      const queryType = objectTypeFromParameters(parameters, "query", document);
      const bodyType = requestBodyType(operation, document);
      const inputLines: string[] = [];
      if (pathType)
        inputLines.push(
          `  path${pathType.required ? "" : "?"}: ${pathType.type};`,
        );
      if (queryType)
        inputLines.push(
          `  query${queryType.required ? "" : "?"}: ${queryType.type};`,
        );
      if (bodyType)
        inputLines.push(
          `  body${bodyType.required ? "" : "?"}: ${bodyType.type};`,
        );
      inputLines.push("  form?: Record<string, string | Blob>;");
      const inputType = `{\n${inputLines.join("\n")}\n}`;
      const inputOptional =
        !pathType?.required && !queryType?.required && !bodyType?.required
          ? "?"
          : "";
      const doc = String(
        operation.summary ??
          operation.description ??
          `${method.toUpperCase()} ${path}`,
      )
        .replace(/\*\//g, "* /")
        .replace(/\n/g, " ");
      apiLines.push(
        `  /** ${doc} */\n  ${operationId}(input${inputOptional}: ${inputType}): Promise<${responseType(
          operation,
          document,
        )}>;`,
      );
    }
  }

  return (
    `declare namespace Traq {\n${schemaLines.join("\n\n")}\n}\n\n` +
    `declare const api: {\n${apiLines.join("\n\n")}\n};\n\n` +
    `declare const util: {\n` +
    `  sleep(ms: number): Promise<void>;\n` +
    `  pageAll<T>(fetchPage: (params: { limit: number; offset: number }) => Promise<T[]>, pageSize?: number): Promise<T[]>;\n` +
    `  isUuid(value: unknown): boolean;\n` +
    `  now(): string;\n` +
    `};\n` +
    `declare const ctx: { state: Record<string, unknown> };\n` +
    `type TraqChannelWithFullPath = Traq.Channel & { fullPath: string };\n` +
    `declare const me: Traq.MyUserDetail | null;\n` +
    `declare const users: Traq.User[];\n` +
    `declare const channels: TraqChannelWithFullPath[];\n` +
    `declare const groups: Traq.UserGroup[];\n`
  );
}

function asTsStringModule(value: string): string {
  return `export const traqApiTypes = ${JSON.stringify(value)};\n`;
}

const response = await fetch(OPENAPI_URL);
if (!response.ok) {
  throw new Error(`Failed to fetch OpenAPI: HTTP ${response.status}`);
}

const document = parse(await response.text()) as OpenApiDocument;
const operations = extractOperations(document);
const declaration = buildApiDeclaration(document);

await mkdir(dirname(operationsOutput), { recursive: true });
await writeFile(operationsOutput, `${JSON.stringify(operations, null, 2)}\n`);
await writeFile(dtsOutput, declaration);
await writeFile(textOutput, asTsStringModule(declaration));

console.log(`Generated ${operations.length} operations -> ${operationsOutput}`);
console.log(`Generated API types -> ${dtsOutput}`);
