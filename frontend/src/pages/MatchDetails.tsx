import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Clock, Users, User, Shield, AlertTriangle, Loader2, Sparkles, Trophy } from "lucide-react";
import { useMatchDetails } from "../hooks/useMatches";
import { turfService } from "../services/turf.service";
import { useAuth } from "../contexts/AuthContext";
import { matchService, SkillLevel, MatchStatus } from "../services/match.service";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";

const skillColors: Record<SkillLevel, string> = {
  BEGINNER: "bg-info/15 text-info border-info/30",
  INTERMEDIATE: "bg-warning/15 text-warning border-warning/30",
  ADVANCED: "bg-destructive/15 text-destructive border-destructive/30",
  MIXED: "bg-secondary text-muted-foreground border-border",
};

const statusColors: Record<MatchStatus, string> = {
  OPEN: "bg-primary/15 text-primary border-primary/30",
  FULL: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  IN_PROGRESS: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  CANCELLED: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function MatchDetails() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch match details using React Query
  const { data: match, isLoading, isError, isFetching, refetch } = useMatchDetails(id || "");

  // Join match mutation
  const joinMutation = useMutation({
    mutationFn: () => matchService.joinMatch(id || ""),
    onSuccess: () => {
      toast.success("Joined match successfully!");
      // Invalidate queries to refresh lists and detail views
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["myJoinedMatches"] });
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || "Failed to join match";
      toast.error(message);
    },
  });

  // Leave match mutation
  const leaveMutation = useMutation({
    mutationFn: () => matchService.leaveMatch(id || ""),
    onSuccess: () => {
      toast.success("Left match successfully!");
      // Invalidate queries to refresh lists and detail views
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["myJoinedMatches"] });
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || "Failed to leave match";
      toast.error(message);
    },
  });

  // Fetch sports for client-side resolution (cached)
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

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ["matches", "detail", id] });
    refetch();
  };

  const sportName = match ? sportsMap[match.sportId] || "Sport" : "Sport";

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 animate-fade-in max-w-5xl mx-auto">
        {/* Back navigation skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-32" />
        </div>

        {/* Header Section skeleton */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-9 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Content columns skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 space-y-3">
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="glass-card p-6 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="glass-card p-6 space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !match) {
    return (
      <div className="p-6 lg:p-8 animate-fade-in max-w-lg mx-auto text-center my-16">
        <div className="glass-card p-8 flex flex-col items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Match not found</h3>
          <p className="text-muted-foreground mb-6">
            The match you are looking for does not exist, has been deleted, or there was a server connectivity issue.
          </p>
          <div className="flex gap-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/matches">Back to Matches</Link>
            </Button>
            <Button onClick={handleRetry} variant="default" size="sm" className="neon-glow font-semibold flex items-center gap-1.5">
              <Loader2 className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const gameDate = new Date(match.booking.slot.date);
  const formattedDate = format(gameDate, "EEEE, MMMM d, yyyy");
  const timeStr = `${match.booking.slot.startTime} - ${match.booking.slot.endTime}`;
  const occupancyPercent = Math.min(100, Math.max(0, (match.participantCount / match.maxPlayers) * 100));

  const isAuthenticated = !!user;
  const isParticipant = match.participants.some((p) => p.userId === user?.id);
  const isHost = match.hostId === user?.id;
  const isMatchOpen = match.status === "OPEN";
  const hasSlots = match.participantCount < match.maxPlayers;

  return (
    <div className="p-6 lg:p-8 animate-fade-in max-w-5xl mx-auto flex flex-col min-h-screen">
      {/* Back Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/matches" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Matches
        </Link>
        {isFetching && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            Refreshing...
          </div>
        )}
      </div>

      {/* Main Title Banner */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize">
            {sportName}
          </Badge>
          <Badge className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${skillColors[match.skillLevel]}`}>
            {match.skillLevel.toLowerCase()} Level
          </Badge>
          <Badge className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[match.status]}`}>
            {match.status}
          </Badge>
          {match.visibility === "PRIVATE" && (
            <Badge variant="outline" className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 border-zinc-700 text-zinc-400 flex items-center gap-1">
              <Shield className="h-3 w-3" /> PRIVATE
            </Badge>
          )}
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
          Match at {match.booking.turf.name}
        </h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>Hosted by <strong className="text-foreground font-semibold">{match.host.name || "Anonymous"}</strong></span>
        </div>
      </div>

      {/* Grid Layout columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description / Info */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Match Description
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {match.description || "The host did not provide an explicit description for this match. Join in to have fun playing sports!"}
            </p>
          </div>

          {/* Booking / Location Details */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Venue & Timing
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Facility</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">{match.booking.turf.name}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Location</span>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-tight">{match.booking.turf.location}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Date</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">{formattedDate}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Time Slot</span>
                  <div className="flex items-center gap-1.5 text-sm text-primary font-bold mt-0.5">
                    <Clock className="h-4 w-4" />
                    <span>{timeStr}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-glass-border">
              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                <Link to="/discover">Book Another Slot Here</Link>
              </Button>
            </div>
          </div>

          {/* Participant List */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Players list ({match.participants.length})
            </h2>
            <div className="divide-y divide-glass-border">
              {match.participants.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-secondary/80 flex items-center justify-center border border-border overflow-hidden shrink-0">
                      {p.user.photoUrl ? (
                        <img src={p.user.photoUrl} alt={p.user.name || "User"} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.user.name || "Anonymous Player"}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.user.role.toLowerCase()}</p>
                    </div>
                  </div>
                  <Badge variant={p.role === "HOST" ? "default" : "outline"} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    p.role === "HOST" ? "bg-primary text-primary-foreground" : "border-zinc-700 text-zinc-400"
                  }`}>
                    {p.role.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Action controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold text-md text-foreground mb-3 uppercase tracking-wider text-xs text-muted-foreground">Match Occupancy</h3>
            
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-extrabold text-foreground">
                {match.participantCount}
                <span className="text-lg font-medium text-muted-foreground"> / {match.maxPlayers}</span>
              </span>
              <span className="text-xs font-semibold text-primary">{match.maxPlayers - match.participantCount} slots left</span>
            </div>

            {/* Occupancy Progress Bar */}
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-primary transition-all duration-500 neon-glow" 
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>

            {/* ---------------------------------------------------- */}
            {/* AUTHENTICATED ACTIONS CONTAINER - PLACEHOLDERS       */}
            {/* Structure reserved for join/leave/host flow controls */}
            {/* ---------------------------------------------------- */}
            <div className="border border-dashed border-glass-border rounded-xl p-4 bg-secondary/20 text-center">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-3">
                Match Actions
              </span>
              
              <div className="space-y-2">
                {!isAuthenticated ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Sign in to join this match and play with others.</p>
                    <Button asChild variant="default" className="w-full neon-glow font-semibold">
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </div>
                ) : isHost ? (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm font-semibold text-primary">You are hosting this match</p>
                    <p className="text-xs text-muted-foreground mt-1">Host controls are managed separately.</p>
                  </div>
                ) : isParticipant ? (
                  <div className="space-y-2">
                    <p className="text-xs text-primary font-medium">✓ You have joined this match</p>
                    <Button
                      onClick={() => leaveMutation.mutate()}
                      disabled={leaveMutation.isPending}
                      variant="destructive"
                      className="w-full font-semibold"
                    >
                      {leaveMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                          Leaving Match...
                        </>
                      ) : (
                        "Leave Match"
                      )}
                    </Button>
                  </div>
                ) : isMatchOpen && hasSlots ? (
                  <Button
                    onClick={() => joinMutation.mutate()}
                    disabled={joinMutation.isPending}
                    variant="default"
                    className="w-full neon-glow font-semibold"
                  >
                    {joinMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        Joining Match...
                      </>
                    ) : (
                      "Join Match"
                    )}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button disabled variant="outline" className="w-full cursor-not-allowed opacity-50">
                      Join Match
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {!isMatchOpen
                        ? `This match is ${match.status.toLowerCase()}.`
                        : "This match is full."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
