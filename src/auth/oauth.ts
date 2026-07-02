import { getClientId, getOAuthUrl, getRedirectUri } from "../config";
import { createPkcePair, randomBase64Url } from "./pkce";

const PKCE_KEY = "trap-playground:pkce";
const TOKEN_KEY = "trap-playground:token";

export type OAuthToken = {
  accessToken: string;
  tokenType: string;
  scope: string;
  expiresAt?: number;
};

export type OAuthCallbackResult =
  | { kind: "none" }
  | { kind: "error"; error: string; description?: string }
  | { kind: "code"; code: string; state: string };

type StoredPkce = {
  state: string;
  verifier: string;
  scope: string;
  createdAt: number;
};

export function readToken(): OAuthToken | null {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    const token = JSON.parse(raw) as OAuthToken;
    if (token.expiresAt && token.expiresAt <= Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return token;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function writeToken(token: OAuthToken): void {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function parseOAuthCallback(search: string): OAuthCallbackResult {
  const params = new URLSearchParams(search);
  const error = params.get("error");
  if (error) {
    return {
      kind: "error",
      error,
      description: params.get("error_description") ?? undefined,
    };
  }

  const code = params.get("code");
  const state = params.get("state");
  if (code && state) return { kind: "code", code, state };
  return { kind: "none" };
}

export async function beginLogin(scope: string): Promise<void> {
  const clientId = getClientId();
  if (!clientId) {
    throw new Error("VITE_TRAQ_CLIENT_ID is required to start OAuth login.");
  }

  const { verifier, challenge } = await createPkcePair();
  const state = randomBase64Url(24);
  const stored: StoredPkce = {
    state,
    verifier,
    scope,
    createdAt: Date.now(),
  };
  sessionStorage.setItem(PKCE_KEY, JSON.stringify(stored));

  const url = getOAuthUrl("authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", getRedirectUri());
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");

  window.location.assign(url.toString());
}

export async function exchangeCode(code: string, state: string): Promise<OAuthToken> {
  const raw = sessionStorage.getItem(PKCE_KEY);
  if (!raw) throw new Error("Missing OAuth PKCE state. Please start login again.");

  const stored = JSON.parse(raw) as StoredPkce;
  if (stored.state !== state) {
    throw new Error("OAuth state mismatch. Please start login again.");
  }

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", code);
  body.set("redirect_uri", getRedirectUri());
  body.set("client_id", getClientId());
  body.set("code_verifier", stored.verifier);

  const response = await fetch(getOAuthUrl("token"), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof payload.error_description === "string"
        ? payload.error_description
        : `Token request failed with HTTP ${response.status}`,
    );
  }

  sessionStorage.removeItem(PKCE_KEY);
  const expiresIn =
    typeof payload.expires_in === "number" ? payload.expires_in : undefined;
  const token: OAuthToken = {
    accessToken: String(payload.access_token),
    tokenType: String(payload.token_type ?? "Bearer"),
    scope: String(payload.scope ?? stored.scope),
    expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
  };
  writeToken(token);
  return token;
}
