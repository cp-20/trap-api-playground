import { describe, expect, it } from "vitest";
import { parseOAuthCallback } from "./oauth";

describe("parseOAuthCallback", () => {
  it("parses an authorization code callback", () => {
    expect(parseOAuthCallback("?code=abc&state=xyz")).toEqual({
      kind: "code",
      code: "abc",
      state: "xyz",
    });
  });

  it("parses an OAuth error callback", () => {
    expect(parseOAuthCallback("?error=access_denied&error_description=nope")).toEqual({
      kind: "error",
      error: "access_denied",
      description: "nope",
    });
  });
});
