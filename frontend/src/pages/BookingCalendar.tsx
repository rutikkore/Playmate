import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, Star, X, CheckCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { turfService } from "@/services/turf.service";
import { bookingService } from "@/services/booking.service";
import { getTurfImage } from "@/lib/utils";
import { toast } from "sonner";

const timeSlots = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM",
];

const BookingCalendar = () => {
  const [searchParams] = useSearchParams();
  const turfId = searchParams.get("turfId");
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingState, setBookingState] = useState<"idle" | "loading" | "success">("idle");

  // Fetch turf details
  const { data: turf, isLoading: isTurfLoading } = useQuery({
    queryKey: ["turf", turfId],
    queryFn: () => turfService.getTurfById(turfId!),
    enabled: !!turfId,
  });

  // Fetch slots availability for selectedDate
  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}T00:00:00.000Z`;
  const { data: dbSlots = [], isLoading: isSlotsLoading } = useQuery({
    queryKey: ["availability", turfId, selectedDate],
    queryFn: () => turfService.getAvailability(turfId!, dateStr),
    enabled: !!turfId,
  });

  const getSlotStatus = (time: string) => {
    const dbSlot = dbSlots.find((s: any) => s.startTime === time);
    const isBlocked = dbSlot?.status === "BLOCKED";
    const dbSlotAny = dbSlot as any;
    const hasBooking = dbSlotAny?.booking && dbSlotAny.booking.status !== "CANCELLED";
    const isUnavailable = isBlocked || hasBooking || !dbSlot; // Must exist in db to book

    return {
      isUnavailable,
      price: dbSlot?.price || turf?.pricePerHour || 1200,
      slotId: dbSlot?.id,
    };
  };

  const handleSlotClick = (time: string, date: Date) => {
    const status = getSlotStatus(time);
    if (status.isUnavailable) return;
    setSelectedSlot(time);
    setSelectedDate(date);
    setShowModal(true);
    setBookingState("idle");
  };

  const bookingMutation = useMutation({
    mutationFn: (slotId: string) => bookingService.createBooking(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      setBookingState("success");
      setTimeout(() => setShowModal(false), 1200);
      toast.success("Booking Confirmed!");
    },
    onError: (error: any) => {
      setBookingState("idle");
      const message = error.response?.data?.error || "Failed to book slot";
      toast.error(message);
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      setShowModal(false);
    }
  });

  const handleConfirmBooking = () => {
    if (!selectedSlot) return;
    const status = getSlotStatus(selectedSlot);
    if (!status.slotId) {
      toast.error("Slot not available for booking");
      return;
    }

    setBookingState("loading");
    bookingMutation.mutate(status.slotId);
  };

  if (isTurfLoading || isSlotsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedSlotStatus = selectedSlot ? getSlotStatus(selectedSlot) : null;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Book a Slot</h1>
        <p className="text-muted-foreground mt-1">Select your preferred time at {turf?.name || "Green Arena"}</p>
      </div>

      {/* Turf info */}
      <div className="glass-card p-4 mb-6 flex items-center gap-4">
        <img
          src={getTurfImage(turf?.images[0])}
          alt={turf?.name || "Green Arena"}
          className="h-16 w-24 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{turf?.name || "Green Arena 5-a-side"}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {turf?.location || "Koramangala"}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-warning fill-warning" /> 4.8
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> ₹{turf?.pricePerHour || "1,200"}/hr
            </span>
          </div>
        </div>
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-2 mb-6">
        <button className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex gap-2 flex-1 overflow-x-auto pb-1">
          {next7Days.map((date, i) => {
            const isSelected = selectedDate.getDate() === date.getDate() && selectedDate.getMonth() === date.getMonth();
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`flex-1 min-w-[60px] py-3 rounded-xl text-center transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground neon-glow"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                <p className="text-xs font-medium">{date.toLocaleDateString("en-US", { weekday: "short" })}</p>
                <p className="text-lg font-bold mt-0.5">{date.getDate()}</p>
              </button>
            );
          })}
        </div>
        <button className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Time slots grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {timeSlots.map((time) => {
          const status = getSlotStatus(time);
          return (
            <button
              key={time}
              onClick={() => handleSlotClick(time, selectedDate)}
              disabled={status.isUnavailable}
              className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all ${
                status.isUnavailable
                  ? "bg-destructive/10 border-destructive/20 text-destructive/60 cursor-not-allowed line-through"
                  : "border-border bg-secondary text-foreground slot-hover"
              }`}
            >
              {time}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-secondary border border-border" /> Available
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-destructive/10 border border-destructive/20" /> Unavailable
        </span>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
          onClick={() => bookingState === "idle" && setShowModal(false)}
        >
          <div className="glass-card p-6 w-full max-w-md animate-scale-in neon-border" onClick={(e) => e.stopPropagation()}>
            {bookingState === "success" ? (
              <div className="text-center py-6 animate-fade-in">
                <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground">Booking Confirmed!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedSlot} on {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at {turf?.name || "Green Arena"}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">Confirm Booking</h3>
                  <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Venue</span>
                    <span className="text-foreground font-medium">{turf?.name || "Green Arena 5-a-side"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Date</span>
                    <span className="text-foreground font-medium">{selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Time</span>
                    <span className="text-foreground font-medium">{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="text-foreground font-medium">1 hour</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-primary font-bold text-lg">
                      ₹{selectedSlotStatus?.price ? selectedSlotStatus.price.toLocaleString() : "1,200"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleConfirmBooking}
                  disabled={bookingState === "loading"}
                  className="w-full mt-6 h-11 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all neon-glow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {bookingState === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Confirm & Pay"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
