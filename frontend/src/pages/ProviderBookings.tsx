import { useState } from "react";
import { CalendarDays, Clock, User, Search, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { bookingService } from "@/services/booking.service";
import { format } from "date-fns";

const statusIcon: Record<string, typeof CheckCircle> = {
  CONFIRMED: CheckCircle,
  PENDING: AlertCircle,
  CANCELLED: XCircle,
  COMPLETED: CheckCircle,
};

const statusStyle: Record<string, string> = {
  CONFIRMED: "text-primary bg-primary/10 border-primary/20",
  COMPLETED: "text-success bg-success/10 border-success/20",
  PENDING: "text-warning bg-warning/10 border-warning/20",
  CANCELLED: "text-destructive bg-destructive/10 border-destructive/20",
};

const ProviderBookings = () => {
  const [tab, setTab] = useState<"all" | "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED">("all");
  const [search, setSearch] = useState("");

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["providerBookings"],
    queryFn: () => bookingService.getProviderBookings(),
  });

  const filtered = bookings.filter((b) => {
    const bStatus = b.derivedStatus || b.status;
    const matchesTab = tab === "all" || bStatus === tab;
    const playerName = b.user?.name || "Unknown Player";
    const turfName = b.turf?.name || "";
    const matchesSearch = playerName.toLowerCase().includes(search.toLowerCase()) || turfName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalRevenue = bookings.filter((b) => b.derivedStatus === "COMPLETED" || b.derivedStatus === "CONFIRMED").reduce((sum, b) => sum + Number(b.totalPrice), 0);

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
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Bookings</h1>
        <p className="text-muted-foreground mt-1">View and manage all bookings for your venues</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{bookings.filter((b) => b.derivedStatus === "CONFIRMED").length}</p>
          <p className="text-xs text-muted-foreground">Confirmed</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-success">{bookings.filter((b) => b.derivedStatus === "COMPLETED").length}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Revenue</p>
        </div>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by player or sport..."
            className="w-full h-11 pl-10 pr-4 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((t) => (
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
      </div>

      {/* Bookings list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No bookings found</p>
          </div>
        ) : (
          filtered.map((booking) => {
            const bStatus = booking.derivedStatus || booking.status;
            const Icon = statusIcon[bStatus] || CheckCircle;
            const gameDate = new Date(booking.slot!.date);
            
            return (
              <div key={booking.id} className="glass-card-hover p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{booking.user?.name || "Unknown Player"}</p>
                    <div className="flex items-center flex-wrap gap-3 text-sm text-muted-foreground mt-0.5">
                      <span>{booking.turf?.name}</span>
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {format(gameDate, "MMM d")}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.slot?.startTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-primary">₹{booking.totalPrice}</span>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${statusStyle[bStatus]}`}>
                    <Icon className="h-3 w-3" /> {bStatus}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProviderBookings;
