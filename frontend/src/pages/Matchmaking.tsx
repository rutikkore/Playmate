import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Filter, ArrowLeft, ArrowRight, Loader2, AlertCircle, CalendarDays, Plus } from "lucide-react";
import { useMatches } from "../hooks/useMatches";
import { turfService } from "../services/turf.service";
import { MatchCard } from "../components/MatchCard";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { SkillLevel, MatchStatus } from "../services/match.service";

const skillLevels: Array<{ value: string; label: string }> = [
  { value: "All", label: "All Skill Levels" },
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "MIXED", label: "Mixed" },
];

const statuses: Array<{ value: string; label: string }> = [
  { value: "All", label: "Active Matches" },
  { value: "OPEN", label: "Open" },
  { value: "FULL", label: "Full" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const Matchmaking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Extract parameters from URL search queries
  const sportId = searchParams.get("sportId") || "All";
  const skillLevel = (searchParams.get("skillLevel") || "All") as SkillLevel | "All";
  const status = (searchParams.get("status") || "All") as MatchStatus | "All";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 9; // Show 9 items per page (nice 3x3 grid)

  // Fetch sports (cached indefinitely with React Query)
  const { data: dbSports = [] } = useQuery({
    queryKey: ["sports"],
    queryFn: () => turfService.getSports(),
    staleTime: Infinity,
  });

  const sportsMap = useMemo(() => {
    const map: Record<string, string> = {};
    dbSports.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [dbSports]);

  // Build query filters based on URL state
  const queryFilters = useMemo(() => {
    return {
      sportId: sportId === "All" ? undefined : sportId,
      skillLevel: skillLevel === "All" ? undefined : skillLevel,
      status: status === "All" ? undefined : status,
      page,
      limit,
    };
  }, [sportId, skillLevel, status, page]);

  // Fetch matches from server
  const { data, isLoading, isError, isFetching, refetch } = useMatches(queryFilters);

  // Helper updates for Search Params
  const updateParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      if (value === "All" || !value) {
        prev.delete(key);
      } else {
        prev.set(key, value);
      }
      prev.set("page", "1"); // Reset pagination back to page 1 on filter changes
      return prev;
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (data && newPage > data.totalPages)) return;
    setSearchParams((prev) => {
      prev.set("page", newPage.toString());
      return prev;
    });
  };

  const handleRetry = () => {
    // Invalidate react query cache for matches instead of reloading the page
    queryClient.invalidateQueries({ queryKey: ["matches"] });
    refetch();
  };

  const activeSportName = sportId === "All" ? "All" : sportsMap[sportId] || "All";

  return (
    <div className="p-6 lg:p-8 animate-fade-in flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Discover Matches</h1>
          <p className="text-muted-foreground mt-1">Find open matches and play with other members in your area</p>
        </div>
        <Button asChild variant="default" className="neon-glow font-semibold self-start sm:self-auto flex items-center gap-2">
          <Link to="/matches/create">
            <Plus className="h-4 w-4" /> Host a Match
          </Link>
        </Button>
      </div>

      {/* Filters Section */}
      <div className="glass-card p-5 mb-8 space-y-5">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Filter className="h-4 w-4 text-primary" />
          <span>Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Skill Level Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skill Level</label>
            <select
              value={skillLevel}
              onChange={(e) => updateParam("skillLevel", e.target.value)}
              className="w-full h-11 px-3 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all cursor-pointer"
            >
              {skillLevels.map((l) => (
                <option key={l.value} value={l.value} className="bg-card">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select
              value={status}
              onChange={(e) => updateParam("status", e.target.value)}
              className="w-full h-11 px-3 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value} className="bg-card">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Sport Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sport</label>
            <select
              value={sportId}
              onChange={(e) => updateParam("sportId", e.target.value)}
              className="w-full h-11 px-3 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all cursor-pointer"
            >
              <option value="All" className="bg-card">All Sports</option>
              {dbSports.map((s) => (
                <option key={s.id} value={s.id} className="bg-card">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sport Quick Tabs */}
        <div className="border-t border-glass-border pt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => updateParam("sportId", "All")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              sportId === "All"
                ? "bg-primary text-primary-foreground neon-glow"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            All Sports
          </button>
          {dbSports.map((sport) => (
            <button
              key={sport.id}
              onClick={() => updateParam("sportId", sport.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                sportId === sport.id
                  ? "bg-primary text-primary-foreground neon-glow"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {sport.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-between">
        {isLoading ? (
          /* Loading Skeletons - 9 Items styled identically to match cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="glass-card p-5 flex flex-col justify-between h-[280px]">
                <div>
                  <div className="flex gap-2 mb-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-7 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
                <div className="pt-4 border-t border-glass-border flex items-center justify-between mt-4">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-9 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="glass-card p-8 flex flex-col items-center justify-center text-center my-12 py-16 animate-scale-in">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Failed to load matches</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              There was an error communicating with the Matchmaking server. Please check your connection and try again.
            </p>
            <Button onClick={handleRetry} variant="default" className="neon-glow font-semibold flex items-center gap-2">
              <Loader2 className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Retry Connection
            </Button>
          </div>
        ) : !data || data.matches.length === 0 ? (
          /* Empty State */
          <div className="glass-card p-8 flex flex-col items-center justify-center text-center my-12 py-16 animate-scale-in">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No matches found</h3>
            <p className="text-muted-foreground mb-8 max-w-md">
              We couldn't find any public matches matching your selected filters. Try broadening your criteria or create a new game yourself!
            </p>
            <Button asChild variant="default" className="neon-glow font-semibold">
              <a href="/discover">Book Turf & Host Match</a>
            </Button>
          </div>
        ) : (
          /* Matches Grid */
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {data.matches.length} of {data.total} matches
              </p>
              {isFetching && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  Refreshing...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  sportName={sportsMap[match.sportId] || "Sport"}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10 pt-4 border-t border-glass-border">
                <Button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-sm text-muted-foreground font-medium">
                  Page <strong className="text-foreground font-semibold">{page}</strong> of <strong className="text-foreground font-semibold">{data.totalPages}</strong>
                </span>
                <Button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= data.totalPages}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Matchmaking;
