export const DEFAULT_API_BASE = "https://q-dev.trapti.tech/api/v3";
export const DEFAULT_SCOPE = "openid profile read write";
export const OPENAPI_URL =
  "https://raw.githubusercontent.com/traPtitech/traQ/master/docs/v3-api.yaml";

export function getApiBase(): string {
  return (
    import.meta.env.VITE_TRAQ_API_BASE?.replace(/\/$/, "") ?? DEFAULT_API_BASE
  );
}

export function getClientId(): string {
  return import.meta.env.VITE_TRAQ_CLIENT_ID ?? "";
}

export function getRedirectUri(): string {
  return (
    import.meta.env.VITE_TRAQ_REDIRECT_URI ??
      `${window.location.origin}${window.location.pathname}`
  );
}

export function getOAuthUrl(path: "authorize" | "token" | "revoke"): URL {
  return new URL(`oauth2/${path}`, `${getApiBase()}/`);
}
