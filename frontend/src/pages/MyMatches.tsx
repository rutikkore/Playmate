import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Trophy, CalendarDays, Loader2, AlertCircle, ArrowLeft, ArrowRight, Gamepad2, Plus 
} from "lucide-react";
import { matchService } from "@/services/match.service";
import { turfService } from "@/services/turf.service";
import { MatchCard } from "@/components/MatchCard";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 6;

export default function MyMatches() {
  const [activeTab, setActiveTab] = useState<"hosted" | "joined">("hosted");
  const [hostedPage, setHostedPage] = useState(1);
  const [joinedPage, setJoinedPage] = useState(1);

  // Queries
  const { 
    data: hostedMatches = [], 
    isLoading: isHostedLoading, 
    isError: isHostedError, 
    refetch: refetchHosted 
  } = useQuery({
    queryKey: ["myHostedMatches"],
    queryFn: () => matchService.getMyHostedMatches(),
  });

  const { 
    data: joinedMatches = [], 
    isLoading: isJoinedLoading, 
    isError: isJoinedError, 
    refetch: refetchJoined 
  } = useQuery({
    queryKey: ["myJoinedMatches"],
    queryFn: () => matchService.getMyJoinedMatches(),
  });

  // Sports lookup map
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

  // Client-side pagination calculations
  const totalHostedPages = Math.ceil(hostedMatches.length / ITEMS_PER_PAGE);
  const paginatedHosted = useMemo(() => {
    const start = (hostedPage - 1) * ITEMS_PER_PAGE;
    return hostedMatches.slice(start, start + ITEMS_PER_PAGE);
  }, [hostedMatches, hostedPage]);

  const totalJoinedPages = Math.ceil(joinedMatches.length / ITEMS_PER_PAGE);
  const paginatedJoined = useMemo(() => {
    const start = (joinedPage - 1) * ITEMS_PER_PAGE;
    return joinedMatches.slice(start, start + ITEMS_PER_PAGE);
  }, [joinedMatches, joinedPage]);

  const handleTabChange = (tab: "hosted" | "joined") => {
    setActiveTab(tab);
  };

  const isLoading = isHostedLoading || isJoinedLoading;
  const isError = isHostedError || isJoinedError;

  const handleRetry = () => {
    refetchHosted();
    refetchJoined();
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in flex flex-col min-h-screen max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Matches</h1>
          <p className="text-muted-foreground mt-1">Manage games you are hosting or have joined as a player</p>
        </div>
        <Button asChild variant="default" className="neon-glow font-semibold self-start sm:self-auto flex items-center gap-2">
          <Link to="/matches/create">
            <Plus className="h-4 w-4" /> Host a Match
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-glass-border mb-6">
        <button
          onClick={() => handleTabChange("hosted")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "hosted"
              ? "border-primary text-primary neon-text"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Trophy className="h-4 w-4" />
          Hosted Matches ({hostedMatches.length})
        </button>
        <button
          onClick={() => handleTabChange("joined")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "joined"
              ? "border-primary text-primary neon-text"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Gamepad2 className="h-4 w-4" />
          Joined Matches ({joinedMatches.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        {isLoading ? (
          /* Loading states */
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading matches...</p>
          </div>
        ) : isError ? (
          /* Error state */
          <div className="glass-card p-8 flex flex-col items-center justify-center text-center my-12 py-16">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Failed to load matches</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              There was an error communicating with the server. Please try again.
            </p>
            <Button onClick={handleRetry} className="neon-glow font-semibold">
              Retry Connection
            </Button>
          </div>
        ) : activeTab === "hosted" ? (
          /* Hosted Matches Tab */
          hostedMatches.length === 0 ? (
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center my-12 py-16">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No hosted matches</h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                You are not hosting any matches yet. Choose an active booking to host a new game.
              </p>
              <Button asChild className="neon-glow font-semibold">
                <Link to="/my-games">Go to My Bookings</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedHosted.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    sportName={sportsMap[match.sportId] || "Sport"}
                    roleBadge="HOST"
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalHostedPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-10 pt-4 border-t border-glass-border">
                  <Button
                    onClick={() => setHostedPage((p) => Math.max(1, p - 1))}
                    disabled={hostedPage <= 1}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" /> Previous
                  </Button>
                  <span className="text-sm text-muted-foreground font-medium">
                    Page <strong className="text-foreground font-semibold">{hostedPage}</strong> of <strong className="text-foreground font-semibold">{totalHostedPages}</strong>
                  </span>
                  <Button
                    onClick={() => setHostedPage((p) => Math.min(totalHostedPages, p + 1))}
                    disabled={hostedPage >= totalHostedPages}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )
        ) : (
          /* Joined Matches Tab */
          joinedMatches.length === 0 ? (
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center my-12 py-16">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Gamepad2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No joined matches</h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                You haven't joined any public games yet. Browse matches on the matchmaking board and sign up!
              </p>
              <Button asChild className="neon-glow font-semibold">
                <Link to="/matchmaking">Browse Matchmaking</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedJoined.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    sportName={sportsMap[match.sportId] || "Sport"}
                    roleBadge="PLAYER"
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalJoinedPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-10 pt-4 border-t border-glass-border">
                  <Button
                    onClick={() => setJoinedPage((p) => Math.max(1, p - 1))}
                    disabled={joinedPage <= 1}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" /> Previous
                  </Button>
                  <span className="text-sm text-muted-foreground font-medium">
                    Page <strong className="text-foreground font-semibold">{joinedPage}</strong> of <strong className="text-foreground font-semibold">{totalJoinedPages}</strong>
                  </span>
                  <Button
                    onClick={() => setJoinedPage((p) => Math.min(totalJoinedPages, p + 1))}
                    disabled={joinedPage >= totalJoinedPages}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}
