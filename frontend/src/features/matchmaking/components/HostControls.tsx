import { useState } from "react";
import { Loader2, Play, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMatchMutations } from "../hooks/useMatchMutations";
import LifecycleDialog from "./LifecycleDialog";
import { Match } from "@/services/match.service";

interface HostControlsProps {
  match: Match;
}

export default function HostControls({ match }: HostControlsProps) {
  const [dialogType, setDialogType] = useState<"start" | "cancel" | "complete" | null>(null);

  const {
    startMatch,
    cancelMatch,
    completeMatch,
    isStarting,
    isCancelling,
    isCompleting,
  } = useMatchMutations();

  const isPending = isStarting || isCancelling || isCompleting;

  // Lifecycle visibility rules
  const showStart = match.status === "OPEN" || match.status === "FULL";
  const showCancel = match.status === "OPEN" || match.status === "FULL" || match.status === "IN_PROGRESS";
  const showComplete = match.status === "IN_PROGRESS";
  const hasControls = showStart || showCancel || showComplete;

  if (!hasControls) {
    return (
      <div className="p-3 bg-secondary/30 border border-border/50 rounded-lg text-center">
        <p className="text-xs text-muted-foreground">Match is finalized. No host controls available.</p>
      </div>
    );
  }

  const handleConfirmAction = async (reason?: string) => {
    try {
      if (dialogType === "start") {
        await startMatch(match.id);
      } else if (dialogType === "complete") {
        await completeMatch(match.id);
      } else if (dialogType === "cancel") {
        await cancelMatch({ matchId: match.id, reason });
      }
      setDialogType(null);
    } catch (err) {
      // Error is caught and displayed by the hook's onError callback
      console.error(`Host action ${dialogType} failed:`, err);
    }
  };

  return (
    <div className="space-y-3 text-left">
      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2 text-center">
        Host Controls
      </span>

      <div className="space-y-2">
        {/* Start Match Button */}
        {showStart && (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => setDialogType("start")}
            variant="default"
            className="w-full neon-glow font-semibold flex items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 h-10 text-xs"
          >
            {isStarting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting Match...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                Start Match
              </>
            )}
          </Button>
        )}

        {/* Complete Match Button */}
        {showComplete && (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => setDialogType("complete")}
            variant="default"
            className="w-full neon-glow font-semibold flex items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 h-10 text-xs"
          >
            {isCompleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Completing Match...
              </>
            ) : (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                Complete Match
              </>
            )}
          </Button>
        )}

        {/* Cancel Match Button */}
        {showCancel && (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => setDialogType("cancel")}
            variant="destructive"
            className="w-full font-semibold flex items-center justify-center gap-1.5 h-10 text-xs"
          >
            {isCancelling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cancelling Match...
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5" />
                Cancel Match
              </>
            )}
          </Button>
        )}
      </div>

      {/* Reusable lifecycle confirmation dialog */}
      <LifecycleDialog
        type={dialogType}
        isOpen={!!dialogType}
        onClose={() => setDialogType(null)}
        onConfirm={handleConfirmAction}
        isPending={isPending}
      />
    </div>
  );
}
