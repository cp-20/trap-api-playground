function base64Url(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const chars = String.fromCharCode(...bytes);
  return btoa(chars).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function randomBase64Url(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

export async function createPkcePair(): Promise<{
  verifier: string;
  challenge: string;
}> {
  const verifier = randomBase64Url(48);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return {
    verifier,
    challenge: base64Url(digest),
  };
}
