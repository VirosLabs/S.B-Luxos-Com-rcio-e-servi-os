import { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export default function ToastNotice({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onDismiss, 4500);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isError = toast.type === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <div className={`toast-notice ${isError ? "toast-error" : "toast-success"}`} role={isError ? "alert" : "status"}>
      <Icon size={18} />
      <span>{toast.message}</span>
      <button type="button" aria-label="Fechar notificação" onClick={onDismiss}><X size={16} /></button>
    </div>
  );
}
