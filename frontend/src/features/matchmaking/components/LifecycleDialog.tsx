import { useState, useEffect } from "react";
import { X, Loader2, AlertTriangle, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LifecycleDialogProps {
  type: "start" | "cancel" | "complete" | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  isPending: boolean;
}

export default function LifecycleDialog({
  type,
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: LifecycleDialogProps) {
  const [reason, setReason] = useState("");

  // Reset local reason input state when opening or closing
  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  if (!isOpen || !type) return null;

  // Resolve dialog textual configurations dynamically
  const config = {
    start: {
      title: "Start Match",
      description: "Start this match? This will change the match status to IN_PROGRESS.",
      confirmText: "Yes, Start Match",
      variant: "default" as const,
      icon: Play,
      iconColor: "text-primary bg-primary/10",
    },
    cancel: {
      title: "Cancel Match",
      description: "Cancel this match? This action is irreversible. Regular players will be notified.",
      confirmText: "Yes, Cancel Match",
      variant: "destructive" as const,
      icon: AlertTriangle,
      iconColor: "text-destructive bg-destructive/10",
    },
    complete: {
      title: "Complete Match",
      description: "Mark this match as completed? This will lock the player list and finish the game.",
      confirmText: "Yes, Complete",
      variant: "default" as const,
      icon: CheckCircle,
      iconColor: "text-primary bg-primary/10",
    },
  }[type];

  const IconComponent = config.icon;

  const handleConfirmClick = () => {
    if (type === "cancel") {
      onConfirm(reason.trim() || undefined);
    } else {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="glass-card p-6 w-full max-w-md animate-scale-in neon-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${config.iconColor}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{config.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Please confirm your host action</p>
            </div>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground leading-normal">
            {config.description}
          </p>

          {/* Cancellation Reason TextArea */}
          {type === "cancel" && (
            <div className="flex flex-col gap-1.5 pt-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cancellation Reason (Optional)
              </label>
              <textarea
                disabled={isPending}
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="E.g., Court maintenance issue, Host unavailable today, Rain forecasted..."
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50 resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-glass-border">
          <Button
            type="button"
            disabled={isPending}
            onClick={onClose}
            variant="outline"
            className="border-border hover:bg-secondary text-muted-foreground hover:text-foreground h-10 px-4 text-xs font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={handleConfirmClick}
            variant={config.variant}
            className={`h-10 px-4 text-xs font-bold flex items-center gap-1.5 ${
              config.variant === "default" ? "neon-glow bg-primary text-primary-foreground hover:bg-primary/90" : ""
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              config.confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
