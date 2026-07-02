export type ToastMessage = {
  id: string;
  message: string;
  tone?: "info" | "success" | "error";
};

type Props = {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
};

export function ToastViewport({ toasts, onDismiss }: Props) {
  return (
    <div className="toast-viewport" aria-live="polite">
      {toasts.map((toast) => (
        <button
          className={`toast toast--${toast.tone ?? "info"}`}
          key={toast.id}
          type="button"
          onClick={() => onDismiss(toast.id)}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
