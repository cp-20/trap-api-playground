import { describe, expect, it, vi } from "vitest";
import { createPkcePair } from "./pkce";

describe("createPkcePair", () => {
  it("creates a verifier and SHA-256 challenge", async () => {
    vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
      const bytes = array as Uint8Array;
      bytes.fill(7);
      return array;
    });

    const pair = await createPkcePair();

    expect(pair.verifier).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(pair.challenge).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(pair.challenge).not.toContain("=");
    expect(pair.challenge).not.toBe(pair.verifier);
  });
});
