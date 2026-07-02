import { describe, expect, it } from "vitest";
import { buildRequest } from "./request";
import type { OperationMeta } from "./types";

const operation: OperationMeta = {
  operationId: "postMessage",
  method: "POST",
  path: "/channels/{channelId}/messages",
  tags: [],
  parameters: [],
  requestBody: { required: true, contentTypes: ["application/json"] },
  responseStatus: ["201"],
  cost: 2,
};

describe("buildRequest", () => {
  it("builds path, query, and JSON body requests", () => {
    const request = buildRequest(operation, "https://q.example/api/v3", {
      path: { channelId: "abc def" },
      query: { embed: true, values: [1, 2] },
      body: { content: "hello" },
    });

    expect(request.method).toBe("POST");
    expect(request.url).toBe(
      "https://q.example/api/v3/channels/abc%20def/messages?embed=true&values=1&values=2",
    );
    expect(request.headers["Content-Type"]).toBe("application/json");
    expect(request.body).toBe(JSON.stringify({ content: "hello" }));
  });
});
