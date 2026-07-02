import { getClientId, getOAuthUrl, getRedirectUri } from "../../config";
import { createLocalStorageValue } from "../../storage/localStorage";
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

const tokenStorage = createLocalStorageValue<OAuthToken>({
  key: TOKEN_KEY,
  serialize: (token) => JSON.stringify(token),
  deserialize: (raw) => {
    try {
      const token = JSON.parse(raw) as OAuthToken;
      if (token.expiresAt && token.expiresAt <= Date.now()) {
        return null;
      }
      return token;
    } catch {
      return null;
    }
  },
});

export const readToken = (): OAuthToken | null => {
  const token = tokenStorage.read();
  if (!token) tokenStorage.clear();
  return token;
};

export const writeToken = (token: OAuthToken): void => {
  tokenStorage.write(token);
};

export const clearToken = (): void => {
  tokenStorage.clear();
};

export const parseOAuthCallback = (search: string): OAuthCallbackResult => {
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
};

export const beginLogin = async (scope: string): Promise<void> => {
  const clientId = getClientId();

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
};

export const exchangeCode = async (code: string, state: string): Promise<OAuthToken> => {
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
  const expiresIn = typeof payload.expires_in === "number" ? payload.expires_in : undefined;
  const token: OAuthToken = {
    accessToken: String(payload.access_token),
    tokenType: String(payload.token_type ?? "Bearer"),
    scope: String(payload.scope ?? stored.scope),
    expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
  };
  writeToken(token);
  return token;
};
