import { useMutation, useQueryClient } from "@tanstack/react-query";
import { matchService } from "@/services/match.service";
import { matchKeys } from "../utils/matchKeys";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { auth } from "@/config/firebase";

// Centralized toast messages constant
const TOAST_MESSAGES = {
  START_SUCCESS: "Match Started",
  CANCEL_SUCCESS: "Match Cancelled",
  COMPLETE_SUCCESS: "Match Completed",
};

export function useMatchMutations() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Unified E2E error mapping logic
  const handleMutationError = (error: any, matchId: string) => {
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message || "An unexpected error occurred";

    if (status === 401) {
      toast.error("Session expired. Please log in again.");
      auth.signOut();
      navigate("/login");
    } else if (status === 403) {
      toast.error(`Access Denied: ${message}`);
    } else if (status === 409) {
      toast.error(`Conflict: ${message}. Refreshing match details...`);
      // Re-fetch stale match details
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(matchId) });
    } else {
      toast.error(message);
    }
  };

  const invalidateMatchQueries = (matchId: string) => {
    queryClient.invalidateQueries({ queryKey: matchKeys.detail(matchId) });
    queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    queryClient.invalidateQueries({ queryKey: matchKeys.hosted() });
    queryClient.invalidateQueries({ queryKey: matchKeys.joined() });
    queryClient.invalidateQueries({ queryKey: ["myBookings"] });
  };

  const startMutation = useMutation({
    mutationFn: (matchId: string) => matchService.startMatch(matchId),
    onSuccess: (data, matchId) => {
      toast.success(TOAST_MESSAGES.START_SUCCESS);
      invalidateMatchQueries(matchId);
    },
    onError: (error, matchId) => {
      handleMutationError(error, matchId);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ matchId, reason }: { matchId: string; reason?: string }) =>
      matchService.cancelMatch(matchId, reason),
    onSuccess: (data, { matchId }) => {
      toast.success(TOAST_MESSAGES.CANCEL_SUCCESS);
      invalidateMatchQueries(matchId);
    },
    onError: (error, { matchId }) => {
      handleMutationError(error, matchId);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (matchId: string) => matchService.completeMatch(matchId),
    onSuccess: (data, matchId) => {
      toast.success(TOAST_MESSAGES.COMPLETE_SUCCESS);
      invalidateMatchQueries(matchId);
    },
    onError: (error, matchId) => {
      handleMutationError(error, matchId);
    },
  });

  return {
    startMatch: startMutation.mutateAsync,
    cancelMatch: cancelMutation.mutateAsync,
    completeMatch: completeMutation.mutateAsync,
    isStarting: startMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isCompleting: completeMutation.isPending,
  };
}
