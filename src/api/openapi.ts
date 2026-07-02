import type { HttpMethod, OperationMeta, OperationParameter } from "../types";
import generatedOperations from "../generated/traq-operations.json";

const METHODS = new Set(["get", "post", "put", "patch", "delete", "head", "options"]);

type OpenApiDocument = {
  paths?: Record<string, Record<string, unknown>>;
};

function costOf(method: HttpMethod, path: string): number {
  if (method === "GET") return path.includes("/messages") ? 2 : 1;
  if (method === "DELETE") return 3;
  return 2;
}

function mergeParameters(...groups: unknown[]): OperationParameter[] {
  return groups
    .flatMap((group) => (Array.isArray(group) ? group : []))
    .filter((parameter): parameter is Record<string, unknown> => {
      return !!parameter && typeof parameter === "object" && !("$ref" in parameter);
    })
    .map((parameter) => ({
      name: String(parameter.name),
      in: parameter.in as OperationParameter["in"],
      required: Boolean(parameter.required),
      description:
        typeof parameter.description === "string" ? parameter.description : undefined,
      schema: parameter.schema,
    }));
}

export function extractOperations(document: OpenApiDocument): OperationMeta[] {
  const operations: OperationMeta[] = [];

  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    const commonParameters = (pathItem as Record<string, unknown>).parameters;
    for (const [methodName, operation] of Object.entries(pathItem)) {
      if (!METHODS.has(methodName)) continue;
      const op = operation as Record<string, unknown>;
      if (typeof op.operationId !== "string") continue;

      const method = methodName.toUpperCase() as HttpMethod;
      const requestBody = op.requestBody as
        | { required?: boolean; content?: Record<string, unknown> }
        | undefined;
      const responses = op.responses as Record<string, unknown> | undefined;

      operations.push({
        operationId: op.operationId,
        method,
        path,
        summary: typeof op.summary === "string" ? op.summary : undefined,
        description: typeof op.description === "string" ? op.description : undefined,
        tags: Array.isArray(op.tags) ? op.tags.map(String) : [],
        parameters: mergeParameters(commonParameters, op.parameters),
        requestBody: requestBody
          ? {
              required: Boolean(requestBody.required),
              contentTypes: Object.keys(requestBody.content ?? {}),
            }
          : undefined,
        responseStatus: Object.keys(responses ?? {}),
        cost: costOf(method, path),
      });
    }
  }

  return operations.sort((a, b) => a.operationId.localeCompare(b.operationId));
}

export async function loadOperations(): Promise<OperationMeta[]> {
  return generatedOperations as OperationMeta[];
}
