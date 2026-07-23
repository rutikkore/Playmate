import { useQuery } from "@tanstack/react-query";
import { matchService, MatchFilters } from "../services/match.service";

/**
 * Hook to fetch matches list with caching, pagination and filters
 */
export function useMatches(filters: MatchFilters) {
  return useQuery({
    queryKey: ["matches", filters],
    queryFn: () => matchService.getMatches(filters),
    staleTime: 60000, // 1 minute stale time for the list
    refetchOnWindowFocus: false, // avoid unexpected refreshes of the listing view
  });
}

/**
 * Hook to fetch details of a specific match by ID
 */
export function useMatchDetails(id: string) {
  return useQuery({
    queryKey: ["matches", "detail", id],
    queryFn: () => matchService.getMatchById(id),
    enabled: !!id,
    staleTime: 30000, // 30 seconds stale time for details
    refetchOnWindowFocus: true, // ensure details are fresh when returning to the tab
  });
}
