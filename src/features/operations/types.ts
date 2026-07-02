export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;
export const PARAMETER_LOCATIONS = ["path", "query", "header", "cookie"] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];
export type ParameterLocation = (typeof PARAMETER_LOCATIONS)[number];

export type OperationParameter = {
  name: string;
  in: ParameterLocation;
  required: boolean;
  description?: string;
  schema?: unknown;
};

export type OperationRequestBody = {
  required: boolean;
  contentTypes: string[];
};

export type OperationMeta = {
  operationId: string;
  method: HttpMethod;
  path: string;
  summary?: string;
  description?: string;
  tags: string[];
  parameters: OperationParameter[];
  requestBody?: OperationRequestBody;
  responseStatus: string[];
  cost: number;
};
