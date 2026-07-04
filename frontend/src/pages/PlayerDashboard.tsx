import { CalendarDays, Gamepad2, MapPin, Users, Trophy, TrendingUp } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { StatCard } from "@/components/StatCard";
import { TurfCard } from "@/components/TurfCard";
import { useQuery } from "@tanstack/react-query";
import { turfService } from "@/services/turf.service";
import { getTurfImage } from "@/lib/utils";

const upcomingGames = [
  { id: 1, sport: "Football", venue: "Green Arena", time: "Today, 6:00 PM", players: "8/10" },
  { id: 2, sport: "Badminton", venue: "Shuttle Zone", time: "Tomorrow, 7:30 AM", players: "3/4" },
  { id: 3, sport: "Cricket", venue: "Pitch Perfect", time: "Feb 16, 4:00 PM", players: "16/22" },
];

const PlayerDashboard = () => {
  const { userName } = useRole();

  const { data: dbTurfs = [] } = useQuery({
    queryKey: ["recommended-turfs"],
    queryFn: () => turfService.getTurfs(),
  });

  const recommendedTurfs = dbTurfs.slice(0, 3).map((t) => ({
    id: t.id,
    name: t.name,
    location: t.location,
    sport: t.sports[0]?.sport.name || "Football",
    price: t.pricePerHour,
    rating: 4.8,
    image: getTurfImage(t.images[0]),
    available: t.status === "active",
  }));
  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Good evening, <span className="neon-text">{userName}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-1">Ready for your next game?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Games Played" value={42} icon={Gamepad2} trend={{ value: "+3 this week", positive: true }} />
        <StatCard title="Upcoming" value={3} icon={CalendarDays} subtitle="Next: Today 6PM" />
        <StatCard title="Win Rate" value="67%" icon={Trophy} trend={{ value: "+5%", positive: true }} />
        <StatCard title="PlayMate Score" value={850} icon={TrendingUp} trend={{ value: "+12", positive: true }} />
      </div>

      {/* Upcoming Games */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Games</h2>
        <div className="space-y-3">
          {upcomingGames.map((game) => (
            <div key={game.id} className="glass-card-hover p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{game.sport} at {game.venue}</p>
                  <p className="text-sm text-muted-foreground">{game.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{game.players}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recommended Turfs</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendedTurfs.map((turf) => (
            <TurfCard key={turf.id} {...turf} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
