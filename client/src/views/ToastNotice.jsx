import { useEffect } from "react";
import { AlertCircle, CheckCircle2, HelpCircle, X } from "lucide-react";

export default function ToastNotice({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast || toast.type === "confirm") return undefined;
    const timer = window.setTimeout(onDismiss, 4500);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isError = toast.type === "error";
  const isConfirm = toast.type === "confirm";
  const Icon = isConfirm ? HelpCircle : isError ? AlertCircle : CheckCircle2;
  const confirm = () => {
    onDismiss();
    toast.onConfirm?.();
  };
  return (
    <div className={`toast-notice ${isConfirm ? "toast-confirm" : isError ? "toast-error" : "toast-success"}`} role={isConfirm || isError ? "alert" : "status"}>
      <Icon size={18} />
      <span>{toast.message}</span>
      {isConfirm && (
        <div className="toast-actions">
          <button type="button" className="toast-cancel" onClick={onDismiss}>Cancelar</button>
          <button type="button" className="toast-confirm-action" onClick={confirm}>Confirmar</button>
        </div>
      )}
      <button type="button" aria-label="Fechar notificação" onClick={onDismiss}><X size={16} /></button>
    </div>
  );
}
