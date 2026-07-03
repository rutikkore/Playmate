import { useState } from "react";
import { CalendarDays, MapPin, Clock, Users, CheckCircle, AlertCircle } from "lucide-react";

const games = [
  { id: 1, sport: "Football", venue: "Green Arena", location: "Koramangala", date: "Feb 14, 2026", time: "6:00 PM", status: "upcoming", players: "8/10", result: null },
  { id: 2, sport: "Badminton", venue: "Shuttle Zone", location: "HSR Layout", date: "Feb 15, 2026", time: "7:30 AM", status: "upcoming", players: "3/4", result: null },
  { id: 3, sport: "Football", venue: "Goal Rush", location: "JP Nagar", date: "Feb 10, 2026", time: "8:00 PM", status: "completed", players: "10/10", result: "Won 4-2" },
  { id: 4, sport: "Cricket", venue: "Pitch Perfect", location: "Indiranagar", date: "Feb 8, 2026", time: "4:00 PM", status: "completed", players: "22/22", result: "Won by 15 runs" },
  { id: 5, sport: "Tennis", venue: "Ace Tennis", location: "Whitefield", date: "Feb 5, 2026", time: "6:00 AM", status: "cancelled", players: "1/2", result: null },
];

const statusStyles: Record<string, string> = {
  upcoming: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const MyGames = () => {
  const [tab, setTab] = useState<"all" | "upcoming" | "completed">("all");
  const filtered = tab === "all" ? games : games.filter((g) => g.status === tab);

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Games</h1>
        <p className="text-muted-foreground mt-1">Track your upcoming and past games</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "upcoming", "completed"] as const).map((t) => (
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
        {filtered.map((game) => (
          <div key={game.id} className="glass-card-hover p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{game.sport} at {game.venue}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${statusStyles[game.status]}`}>
                    {game.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {game.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {game.date}, {game.time}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {game.players}</span>
                </div>
                {game.result && (
                  <p className="text-sm font-medium text-primary mt-1.5 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> {game.result}
                  </p>
                )}
              </div>
            </div>
            {game.status === "upcoming" && (
              <button className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors">
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyGames;
