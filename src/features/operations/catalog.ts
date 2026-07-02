import generatedOperations from "../../generated/traq-operations.json";
import {
  HTTP_METHODS,
  PARAMETER_LOCATIONS,
  type HttpMethod,
  type OperationMeta,
  type OperationParameter,
  type ParameterLocation,
} from "./types";

const METHOD_NAMES = new Set(HTTP_METHODS.map((method) => method.toLowerCase()));
const PARAMETER_LOCATION_NAMES = new Set<string>(PARAMETER_LOCATIONS);

type OpenApiOperation = {
  operationId?: unknown;
  summary?: unknown;
  description?: unknown;
  tags?: unknown;
  parameters?: unknown;
  requestBody?: unknown;
  responses?: unknown;
};

type OpenApiPathItem = Record<string, unknown> & {
  parameters?: unknown;
};

type OpenApiDocument = {
  paths?: Record<string, OpenApiPathItem>;
};

const costOf = (method: HttpMethod, path: string): number => {
  if (method === "GET") return path.includes("/messages") ? 2 : 1;
  if (method === "DELETE") return 3;
  return 2;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object";

const isParameterLocation = (value: unknown): value is ParameterLocation =>
  typeof value === "string" && PARAMETER_LOCATION_NAMES.has(value);

const asOperationParameter = (parameter: unknown): OperationParameter | null => {
  if (!isRecord(parameter) || "$ref" in parameter) return null;
  if (typeof parameter.name !== "string" || !isParameterLocation(parameter.in)) return null;
  return {
    name: parameter.name,
    in: parameter.in,
    required: parameter.required === true,
    description: typeof parameter.description === "string" ? parameter.description : undefined,
    schema: parameter.schema,
  };
};

const mergeParameters = (...groups: unknown[]): OperationParameter[] => {
  return groups
    .flatMap((group) => (Array.isArray(group) ? group : []))
    .map(asOperationParameter)
    .filter((parameter): parameter is OperationParameter => parameter !== null);
};

const contentTypesOf = (content: unknown): string[] => {
  return isRecord(content) ? Object.keys(content) : [];
};

const responseStatusesOf = (responses: unknown): string[] => {
  return isRecord(responses) ? Object.keys(responses) : [];
};

const toHttpMethod = (methodName: string): HttpMethod | null => {
  if (!METHOD_NAMES.has(methodName)) return null;
  return methodName.toUpperCase() as HttpMethod;
};

export const extractOperations = (document: OpenApiDocument): OperationMeta[] => {
  const operations: OperationMeta[] = [];

  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    for (const [methodName, value] of Object.entries(pathItem)) {
      const method = toHttpMethod(methodName);
      if (!method || !isRecord(value)) continue;

      const operation = value as OpenApiOperation;
      if (typeof operation.operationId !== "string") continue;
      const requestBody = isRecord(operation.requestBody) ? operation.requestBody : null;

      operations.push({
        operationId: operation.operationId,
        method,
        path,
        summary: typeof operation.summary === "string" ? operation.summary : undefined,
        description: typeof operation.description === "string" ? operation.description : undefined,
        tags: Array.isArray(operation.tags) ? operation.tags.map(String) : [],
        parameters: mergeParameters(pathItem.parameters, operation.parameters),
        requestBody: requestBody
          ? {
              required: requestBody.required === true,
              contentTypes: contentTypesOf(requestBody.content),
            }
          : undefined,
        responseStatus: responseStatusesOf(operation.responses),
        cost: costOf(method, path),
      });
    }
  }

  return operations.sort((a, b) => a.operationId.localeCompare(b.operationId));
};

export const loadOperations = async (): Promise<OperationMeta[]> => {
  return generatedOperations as OperationMeta[];
};
