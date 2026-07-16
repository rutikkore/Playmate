import { useState } from "react";
import { CalendarDays, MapPin, Clock, Users, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/services/booking.service";
import { toast } from "sonner";
import { format } from "date-fns";

const statusStyles: Record<string, string> = {
  CONFIRMED: "bg-primary/10 text-primary border-primary/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

const MyGames = () => {
  const [tab, setTab] = useState<"all" | "CONFIRMED" | "COMPLETED">("all");
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["myBookings"],
    queryFn: () => bookingService.getMyBookings(),
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => bookingService.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      toast.success("Booking cancelled successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || "Failed to cancel booking";
      toast.error(message);
    }
  });

  const filtered = tab === "all" ? bookings : bookings.filter((b) => b.derivedStatus === tab);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Games</h1>
        <p className="text-muted-foreground mt-1">Track your upcoming and past games</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "CONFIRMED", "COMPLETED"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((booking) => {
          const gameDate = new Date(booking.slot!.date);
          return (
          <div key={booking.id} className="glass-card-hover p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">Booking at {booking.turf?.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${statusStyles[booking.derivedStatus || booking.status]}`}>
                    {booking.derivedStatus || booking.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {booking.turf?.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {format(gameDate, "MMM d, yyyy")}, {booking.slot?.startTime}</span>
                </div>
              </div>
            </div>
            {booking.derivedStatus === "CONFIRMED" && (
              <button 
                onClick={() => cancelMutation.mutate(booking.id)}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors disabled:opacity-50"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
              </button>
            )}
          </div>
        )})}
      </div>
    </div>
  );
};

export default MyGames;
