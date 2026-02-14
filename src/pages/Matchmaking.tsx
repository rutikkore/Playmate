import { useState } from "react";
import { Users, MapPin, Clock, Zap, Filter } from "lucide-react";

const matches = [
  { id: 1, sport: "Football", title: "5v5 Friendly Match", venue: "Green Arena", location: "Koramangala", time: "Today, 6:00 PM", players: 7, needed: 10, skill: "Intermediate", host: "Rahul K." },
  { id: 2, sport: "Badminton", title: "Doubles Game", venue: "Shuttle Zone", location: "HSR Layout", time: "Tomorrow, 7:30 AM", players: 3, needed: 4, skill: "Beginner", host: "Priya S." },
  { id: 3, sport: "Cricket", title: "Weekend Cricket League", venue: "Pitch Perfect", location: "Indiranagar", time: "Feb 16, 4:00 PM", players: 16, needed: 22, skill: "Advanced", host: "Vikram R." },
  { id: 4, sport: "Football", title: "Late Night Turf", venue: "Goal Rush Arena", location: "JP Nagar", time: "Today, 9:00 PM", players: 9, needed: 10, skill: "Intermediate", host: "Arjun M." },
  { id: 5, sport: "Tennis", title: "Singles Practice", venue: "Ace Tennis", location: "Whitefield", time: "Feb 15, 6:00 AM", players: 1, needed: 2, skill: "Beginner", host: "Meera D." },
];

const skillColors: Record<string, string> = {
  Beginner: "bg-info/15 text-info border-info/30",
  Intermediate: "bg-warning/15 text-warning border-warning/30",
  Advanced: "bg-destructive/15 text-destructive border-destructive/30",
};

const Matchmaking = () => {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? matches : matches.filter((m) => m.sport === filter);

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Matchmaking</h1>
          <p className="text-muted-foreground mt-1">Find players and join games near you</p>
        </div>
        <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all neon-glow">
          + Create Match
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["All", "Football", "Cricket", "Badminton", "Tennis"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Match cards */}
      <div className="space-y-4">
        {filtered.map((match) => (
          <div key={match.id} className="glass-card-hover p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/20">
                    {match.sport}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${skillColors[match.skill]}`}>
                    {match.skill}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{match.title}</h3>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {match.venue}, {match.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {match.time}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {match.players}/{match.needed} players</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Hosted by {match.host}</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Progress */}
                <div className="w-24">
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(match.players / match.needed) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-center">{match.needed - match.players} spots left</p>
                </div>
                <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Join
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matchmaking;
