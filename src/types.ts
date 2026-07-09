export interface AssertRule {
  type: "exists" | "status200" | "hasKey" | "notEmpty" | "isArray" | "isObject";
  path: string;
  label: string;
}

export interface AssertResult {
  pass: boolean;
  label: string;
  detail: string;
  index: number;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  contentType: string;
  contentLength: number;
  data: unknown;
  time: string;
}

export interface HistoryItem {
  url: string;
  status: number;
  time: string;
  method: string;
  response: ApiResponse;
}