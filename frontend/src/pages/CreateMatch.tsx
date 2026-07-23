import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, CalendarDays, Clock, MapPin, Users, Loader2, 
  AlertCircle, Shield, Globe, Trophy, Info, Sparkles 
} from "lucide-react";
import { bookingService } from "@/services/booking.service";
import { matchService, SkillLevel, MatchVisibility } from "@/services/match.service";
import { turfService } from "@/services/turf.service";
import { toast } from "sonner";
import { format, parse, isAfter } from "date-fns";
import { Button } from "@/components/ui/button";

// Date utilities mapping the backend's logic to check if a booking slot is in the future
const combineDateAndTime = (dateStr: string | Date, timeString: string): Date => {
  const dateObj = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return parse(timeString, "hh:mm a", dateObj);
};

const isFutureSlot = (dateStr: string | Date, startTimeString: string): boolean => {
  const slotStart = combineDateAndTime(dateStr, startTimeString);
  return isAfter(slotStart, new Date());
};

export default function CreateMatch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Read bookingId from query parameter if pre-selected
  const preSelectedBookingId = searchParams.get("bookingId");

  // Form states
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedSportId, setSelectedSportId] = useState<string>("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("MIXED");
  const [maxPlayers, setMaxPlayers] = useState<number>(10);
  const [description, setDescription] = useState<string>("");
  const [visibility, setVisibility] = useState<MatchVisibility>("PUBLIC");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Queries
  const { data: bookings = [], isLoading: isBookingsLoading, error: bookingsError } = useQuery({
    queryKey: ["myBookings"],
    queryFn: () => bookingService.getMyBookings(),
  });

  const { data: hostedMatches = [], isLoading: isHostedLoading } = useQuery({
    queryKey: ["myHostedMatches"],
    queryFn: () => matchService.getMyHostedMatches(),
  });

  const { data: turfs = [], isLoading: isTurfsLoading } = useQuery({
    queryKey: ["turfs"],
    queryFn: () => turfService.getTurfs(),
  });

  // If a pre-selected booking ID is provided in URL, automatically select it when bookings load
  useEffect(() => {
    if (preSelectedBookingId && bookings.length > 0) {
      const exists = bookings.some((b) => b.id === preSelectedBookingId);
      if (exists) {
        setSelectedBookingId(preSelectedBookingId);
      }
    }
  }, [preSelectedBookingId, bookings]);

  // Compute eligible bookings: confirmed, in the future, and does not already have a match
  const eligibleBookings = bookings.filter((booking) => {
    // 1. Must be CONFIRMED (status or derivedStatus)
    const isConfirmed = booking.derivedStatus === "CONFIRMED" || booking.status === "CONFIRMED";
    if (!isConfirmed) return false;

    // 2. Must be in the future
    if (!booking.slot || !isFutureSlot(booking.slot.date, booking.slot.startTime)) {
      return false;
    }

    // 3. Must not already have a match
    const alreadyHasMatch = hostedMatches.some((m) => m.bookingId === booking.id);
    if (alreadyHasMatch) return false;

    return true;
  });

  // Find the selected booking details
  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  // Look up the selected booking's turf in the complete turfs list (which includes the sports relation)
  const selectedTurfWithSports = selectedBooking
    ? turfs.find((t) => t.id === selectedBooking.turfId)
    : null;

  // Retrieve sports supported by the selected booking's turf
  const supportedSports = selectedTurfWithSports?.sports.map((ts) => ts.sport) || [];

  // Reset selected sport if it is not supported by the newly selected booking's turf
  useEffect(() => {
    if (supportedSports.length > 0) {
      // Default to the first supported sport
      const isCurrentSportSupported = supportedSports.some((s) => s.id === selectedSportId);
      if (!isCurrentSportSupported) {
        setSelectedSportId(supportedSports[0].id);
      }
    } else {
      setSelectedSportId("");
    }
  }, [selectedBookingId, selectedTurfWithSports, supportedSports]);

  // Create match mutation
  const createMatchMutation = useMutation({
    mutationFn: (data: {
      bookingId: string;
      sportId: string;
      skillLevel: SkillLevel;
      maxPlayers: number;
      description?: string;
      visibility: MatchVisibility;
    }) => matchService.createMatch(data),
    onSuccess: (newMatch) => {
      toast.success("Match created successfully!");
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["myHostedMatches"] });
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      // Navigate to the newly created match details page
      navigate(`/matches/${newMatch.id}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || "Failed to create match";
      toast.error(message);
      setValidationError(message);
    },
  });

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!selectedBookingId) {
      setValidationError("Please select an eligible booking.");
      return;
    }

    if (!selectedSportId) {
      setValidationError("Please select a sport.");
      return;
    }

    if (maxPlayers < 2) {
      setValidationError("Match must support at least 2 players.");
      return;
    }

    createMatchMutation.mutate({
      bookingId: selectedBookingId,
      sportId: selectedSportId,
      skillLevel,
      maxPlayers,
      description,
      visibility,
    });
  };

  const isLoading = isBookingsLoading || isHostedLoading || isTurfsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm">Loading eligible bookings...</p>
      </div>
    );
  }

  if (bookingsError) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-bold text-foreground">Error loading page</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          There was a problem retrieving your bookings. Please try again.
        </p>
        <Button onClick={() => window.location.reload()} className="mt-6">
          Reload Page
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in max-w-4xl mx-auto flex flex-col min-h-screen">
      {/* Back link */}
      <div className="mb-6">
        <Link to="/matchmaking" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Matches</span>
        </Link>
      </div>

      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Create a Game</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Host a New Match</h1>
        <p className="text-muted-foreground mt-1">Host a public or private game using one of your confirmed bookings</p>
      </div>

      {validationError && (
        <div className="glass-card border-destructive/30 bg-destructive/10 p-4 mb-6 flex items-start gap-3 animate-scale-in">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">Match Creation Failed</h4>
            <p className="text-sm text-muted-foreground mt-0.5">{validationError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* STEP 1: SELECT BOOKING */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
            <h2 className="text-lg font-bold text-foreground">Select Booking</h2>
          </div>

          {preSelectedBookingId && selectedBooking && (
            <div className="p-3 bg-secondary/40 border border-border rounded-lg text-xs text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4 text-primary shrink-0" />
              <span>Pre-selected booking is locked. Clear bookingId parameter in URL to choose another slot.</span>
            </div>
          )}

          {eligibleBookings.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border rounded-xl">
              <CalendarDays className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground">No eligible bookings found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                You must have a confirmed future booking that doesn't already have a match to host a game.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4 border-primary/20 hover:bg-primary/10 hover:text-primary">
                <Link to="/discover">Book a Turf Now</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eligibleBookings.map((booking) => {
                const bookingDate = booking.slot ? new Date(booking.slot.date) : new Date();
                const isSelected = selectedBookingId === booking.id;
                const isDisabled = !!preSelectedBookingId && preSelectedBookingId !== booking.id;
                
                // Get sports supported by this booking's turf
                const bTurf = turfs.find((t) => t.id === booking.turfId);
                const turfSportsList = bTurf?.sports.map((ts) => ts.sport.name).join(", ") || "";

                return (
                  <button
                    key={booking.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setSelectedBookingId(booking.id)}
                    className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between h-[150px] ${
                      isSelected
                        ? "bg-primary/10 border-primary neon-border"
                        : isDisabled
                        ? "opacity-40 cursor-not-allowed border-border"
                        : "bg-secondary/40 border-border hover:bg-secondary/80 hover:border-primary/30 cursor-pointer"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-foreground truncate">{booking.turf?.name}</h4>
                        {isSelected && (
                          <span className="px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-bold">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{booking.turf?.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3 w-3 shrink-0" />
                          <span>{format(bookingDate, "EEE, MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{booking.slot?.startTime}</span>
                        </div>
                      </div>
                    </div>
                    {turfSportsList && (
                      <div className="mt-2 pt-2 border-t border-border/50 text-[10px] font-semibold text-primary/80 truncate w-full">
                        Sports: {turfSportsList}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* STEP 2: FILL MATCH DETAILS */}
        <div className={`glass-card p-6 space-y-5 transition-opacity duration-300 ${!selectedBookingId ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
            <h2 className="text-lg font-bold text-foreground">Match Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sport Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Sport</label>
              <select
                disabled={!selectedBookingId}
                value={selectedSportId}
                onChange={(e) => setSelectedSportId(e.target.value)}
                className="w-full h-11 px-3 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all cursor-pointer disabled:opacity-50"
              >
                {supportedSports.length === 0 ? (
                  <option value="" className="bg-card">No sports available</option>
                ) : (
                  supportedSports.map((sport) => (
                    <option key={sport.id} value={sport.id} className="bg-card">
                      {sport.name}
                    </option>
                  ))
                )}
              </select>
              <p className="text-[11px] text-muted-foreground">Only sports supported by this turf are available.</p>
            </div>

            {/* Skill Level Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skill Level</label>
              <select
                disabled={!selectedBookingId}
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                className="w-full h-11 px-3 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="MIXED" className="bg-card">Mixed (All Welcome)</option>
                <option value="BEGINNER" className="bg-card">Beginner</option>
                <option value="INTERMEDIATE" className="bg-card">Intermediate</option>
                <option value="ADVANCED" className="bg-card">Advanced</option>
              </select>
            </div>

            {/* Max Players Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Maximum Players</label>
              <div className="flex items-center">
                <button
                  type="button"
                  disabled={!selectedBookingId || maxPlayers <= 2}
                  onClick={() => setMaxPlayers(prev => Math.max(2, prev - 1))}
                  className="h-11 w-11 bg-secondary border border-border border-r-0 rounded-l-lg flex items-center justify-center font-bold text-foreground hover:bg-secondary/80 disabled:opacity-50"
                >
                  -
                </button>
                <input
                  type="number"
                  disabled={!selectedBookingId}
                  min={2}
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Math.max(2, parseInt(e.target.value, 10) || 2))}
                  className="flex-1 h-11 text-center bg-secondary border border-border text-sm text-foreground focus:outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  disabled={!selectedBookingId}
                  onClick={() => setMaxPlayers(prev => prev + 1)}
                  className="h-11 w-11 bg-secondary border border-border border-l-0 rounded-r-lg flex items-center justify-center font-bold text-foreground hover:bg-secondary/80 disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">Must support at least 2 players (including yourself).</p>
            </div>

            {/* Visibility Options */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visibility</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!selectedBookingId}
                  onClick={() => setVisibility("PUBLIC")}
                  className={`h-11 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    visibility === "PUBLIC"
                      ? "bg-primary/10 border-primary text-primary neon-border"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  <span>Public</span>
                </button>
                <button
                  type="button"
                  disabled={!selectedBookingId}
                  onClick={() => setVisibility("PRIVATE")}
                  className={`h-11 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    visibility === "PRIVATE"
                      ? "bg-primary/10 border-primary text-primary neon-border"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Private</span>
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {visibility === "PUBLIC"
                  ? "Public matches are visible to everyone on the Matchmaking board."
                  : "Private matches are only accessible via direct link."}
              </p>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description / Rules (Optional)</label>
            <textarea
              disabled={!selectedBookingId}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., friendly game, 5v5 futsal. White shirt / bibs will be provided. Friendly players only!"
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50 resize-none"
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            asChild
            variant="outline"
            className="border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
          >
            <Link to="/matchmaking">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={!selectedBookingId || createMatchMutation.isPending}
            className="neon-glow font-bold px-6 h-11 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {createMatchMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Match...
              </>
            ) : (
              "Create Match & Host"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
