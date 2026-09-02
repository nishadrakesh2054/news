import { X } from "lucide-react";
import { adminPanel } from "@/constants/admin-layout";

type AdminFormModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
};

export function AdminFormModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "max-w-xl",
}: AdminFormModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`${adminPanel} flex w-full ${maxWidth} max-h-[90vh] flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-form-modal-title"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[#0C4EA0]/20 bg-[#0C4EA0] px-4 py-3">
          <div className="min-w-0 pr-3">
            <h2 id="admin-form-modal-title" className="text-sm font-semibold text-white">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-[11px] leading-relaxed text-white/80">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-sm p-1 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>

        {footer ? (
          <div className="shrink-0 border-t border-border/70 bg-muted/15 px-4 py-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
