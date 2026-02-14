import { useState } from "react";
import { CalendarDays, Clock, User, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Booking {
  id: number;
  player: string;
  sport: string;
  date: string;
  time: string;
  court: string;
  amount: number;
  status: "confirmed" | "pending" | "cancelled";
}

const allBookings: Booking[] = [
  { id: 1, player: "Arjun M.", sport: "Football", date: "Feb 14", time: "6:00 PM", court: "Court A", amount: 1200, status: "confirmed" },
  { id: 2, player: "Priya S.", sport: "Badminton", date: "Feb 15", time: "7:30 AM", court: "Court B", amount: 800, status: "confirmed" },
  { id: 3, player: "Vikram R.", sport: "Cricket", date: "Feb 16", time: "4:00 PM", court: "Court A", amount: 1500, status: "pending" },
  { id: 4, player: "Meera D.", sport: "Tennis", date: "Feb 15", time: "6:00 AM", court: "Court C", amount: 1000, status: "confirmed" },
  { id: 5, player: "Rahul K.", sport: "Football", date: "Feb 14", time: "8:00 PM", court: "Court A", amount: 1200, status: "cancelled" },
  { id: 6, player: "Ananya T.", sport: "Badminton", date: "Feb 17", time: "9:00 AM", court: "Court B", amount: 800, status: "pending" },
];

const statusIcon: Record<string, typeof CheckCircle> = {
  confirmed: CheckCircle,
  pending: AlertCircle,
  cancelled: XCircle,
};

const statusStyle: Record<string, string> = {
  confirmed: "text-primary bg-primary/10 border-primary/20",
  pending: "text-warning bg-warning/10 border-warning/20",
  cancelled: "text-destructive bg-destructive/10 border-destructive/20",
};

const ProviderBookings = () => {
  const [tab, setTab] = useState<"all" | "confirmed" | "pending" | "cancelled">("all");
  const [search, setSearch] = useState("");

  const filtered = allBookings.filter((b) => {
    const matchesTab = tab === "all" || b.status === tab;
    const matchesSearch = b.player.toLowerCase().includes(search.toLowerCase()) || b.sport.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalRevenue = allBookings.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Bookings</h1>
        <p className="text-muted-foreground mt-1">View and manage all bookings for your venues</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{allBookings.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{allBookings.filter((b) => b.status === "confirmed").length}</p>
          <p className="text-xs text-muted-foreground">Confirmed</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-warning">{allBookings.filter((b) => b.status === "pending").length}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
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
        <div className="flex gap-2">
          {(["all", "confirmed", "pending", "cancelled"] as const).map((t) => (
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
            const Icon = statusIcon[booking.status];
            return (
              <div key={booking.id} className="glass-card-hover p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{booking.player}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                      <span>{booking.sport}</span>
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {booking.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.time}</span>
                      <span>{booking.court}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-primary">₹{booking.amount}</span>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${statusStyle[booking.status]}`}>
                    <Icon className="h-3 w-3" /> {booking.status}
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
