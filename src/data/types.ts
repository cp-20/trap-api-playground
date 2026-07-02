export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type OperationParameter = {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required: boolean;
  description?: string;
  schema?: unknown;
};

export type OperationMeta = {
  operationId: string;
  method: HttpMethod;
  path: string;
  summary?: string;
  description?: string;
  tags: string[];
  parameters: OperationParameter[];
  requestBody?: {
    required: boolean;
    contentTypes: string[];
  };
  responseStatus: string[];
  cost: number;
};
