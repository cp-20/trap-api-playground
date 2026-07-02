import { LogIn, RotateCcw, Share2 } from "lucide-react";

type Props = {
  operationCount: number;
  loggedIn: boolean;
  clientConfigured: boolean;
  onLogin: () => void;
  onReset: () => void;
  onShare: () => void;
};

export function TopBar({
  operationCount,
  loggedIn,
  clientConfigured,
  onLogin,
  onReset,
  onShare,
}: Props) {
  return (
    <header className="topbar">
      <div className="brand">
        <strong>traQ API Playground</strong>
        <span>{operationCount ? `${operationCount} operations` : "Loading OpenAPI..."}</span>
      </div>
      {loggedIn ? (
        <>
          <button type="button" onClick={onReset} title="Reset runtime state">
            <RotateCcw size={16} />
            Reset
          </button>
          <button type="button" onClick={onShare} title="Share notebook">
            <Share2 size={16} />
            Share
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={!clientConfigured}
          onClick={onLogin}
          title="Login with OAuth PKCE"
        >
          <LogIn size={16} />
          Login
        </button>
      )}
    </header>
  );
}
