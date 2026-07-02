import styles from "./ToastViewport.module.css";

export type ToastMessage = {
  id: string;
  message: string;
  tone?: "info" | "success" | "error";
};

const toastClass = (tone: ToastMessage["tone"]): string => {
  if (tone === "success") return `${styles.toast} ${styles.toastSuccess}`;
  if (tone === "error") return `${styles.toast} ${styles.toastError}`;
  return styles.toast;
};

type Props = {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
};

export const ToastViewport = ({ toasts, onDismiss }: Props) => {
  return (
    <div className={styles.toastViewport} aria-live="polite">
      {toasts.map((toast) => (
        <button
          className={toastClass(toast.tone)}
          key={toast.id}
          type="button"
          onClick={() => onDismiss(toast.id)}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
};
