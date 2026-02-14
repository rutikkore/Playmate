import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, Star, X, CheckCircle, Loader2 } from "lucide-react";
import turf1 from "@/assets/turf-1.jpg";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = [10, 11, 12, 13, 14, 15, 16];
const timeSlots = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM",
];

const initialBooked = new Set(["6:00 AM-10", "9:00 AM-11", "6:00 PM-14", "7:00 PM-14", "8:00 PM-14", "3:00 PM-12", "10:00 AM-15"]);

const BookingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(14);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [bookedSlots, setBookedSlots] = useState(initialBooked);
  const [bookingState, setBookingState] = useState<"idle" | "loading" | "success">("idle");

  const handleSlotClick = (time: string, date: number) => {
    const key = `${time}-${date}`;
    if (bookedSlots.has(key)) return;
    setSelectedSlot(time);
    setSelectedDate(date);
    setShowModal(true);
    setBookingState("idle");
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) return;
    setBookingState("loading");

    // Optimistic update
    const key = `${selectedSlot}-${selectedDate}`;
    setBookedSlots((prev) => new Set([...prev, key]));

    setTimeout(() => {
      setBookingState("success");
      setTimeout(() => setShowModal(false), 1200);
    }, 800);
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Book a Slot</h1>
        <p className="text-muted-foreground mt-1">Select your preferred time at Green Arena</p>
      </div>

      {/* Turf info */}
      <div className="glass-card p-4 mb-6 flex items-center gap-4">
        <img src={turf1} alt="Green Arena" className="h-16 w-24 rounded-lg object-cover" />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Green Arena 5-a-side</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Koramangala</span>
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-warning" /> 4.8</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ₹1,200/hr</span>
          </div>
        </div>
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-2 mb-6">
        <button className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex gap-2 flex-1 overflow-x-auto pb-1">
          {days.map((day, i) => (
            <button
              key={i}
              onClick={() => setSelectedDate(dates[i])}
              className={`flex-1 min-w-[60px] py-3 rounded-xl text-center transition-all ${
                selectedDate === dates[i]
                  ? "bg-primary text-primary-foreground neon-glow"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              <p className="text-xs font-medium">{day}</p>
              <p className="text-lg font-bold mt-0.5">{dates[i]}</p>
            </button>
          ))}
        </div>
        <button className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Time slots grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {timeSlots.map((time) => {
          const key = `${time}-${selectedDate}`;
          const isBooked = bookedSlots.has(key);
          return (
            <button
              key={time}
              onClick={() => handleSlotClick(time, selectedDate)}
              disabled={isBooked}
              className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all ${
                isBooked
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
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-secondary border border-border" /> Available</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-destructive/10 border border-destructive/20" /> Booked</span>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in" onClick={() => bookingState === "idle" && setShowModal(false)}>
          <div className="glass-card p-6 w-full max-w-md animate-scale-in neon-border" onClick={(e) => e.stopPropagation()}>
            {bookingState === "success" ? (
              <div className="text-center py-6 animate-fade-in">
                <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground">Booking Confirmed!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedSlot} on Feb {selectedDate} at Green Arena
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
                    <span className="text-foreground font-medium">Green Arena 5-a-side</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Date</span>
                    <span className="text-foreground font-medium">Feb {selectedDate}, 2026</span>
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
                    <span className="text-primary font-bold text-lg">₹1,200</span>
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
