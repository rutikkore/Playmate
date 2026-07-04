import { useState } from "react";
import { Search, SlidersHorizontal, MapPin, Loader2 } from "lucide-react";
import { TurfCard } from "@/components/TurfCard";
import { useQuery } from "@tanstack/react-query";
import { turfService } from "@/services/turf.service";
import { getTurfImage } from "@/lib/utils";

const TurfDiscovery = () => {
  const [activeSport, setActiveSport] = useState("All");
  const [search, setSearch] = useState("");

  // Fetch sports
  const { data: dbSports = [] } = useQuery({
    queryKey: ["sports"],
    queryFn: () => turfService.getSports(),
  });

  const sportsList = ["All", ...dbSports.map((s) => s.name)];

  // Fetch turfs
  const { data: dbTurfs = [], isLoading } = useQuery({
    queryKey: ["turfs", activeSport, search],
    queryFn: () =>
      turfService.getTurfs({
        sport: activeSport === "All" ? undefined : activeSport,
        search: search || undefined,
      }),
  });

  const filtered = dbTurfs.map((t) => ({
    id: t.id,
    name: t.name,
    location: t.location,
    sport: t.sports[0]?.sport.name || "Football",
    price: t.pricePerHour,
    rating: 4.8, // static rating since reviews are a placeholder
    image: getTurfImage(t.images[0]),
    available: t.status === "active",
  }));

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Discover Turfs</h1>
        <p className="text-muted-foreground mt-1">Find and book the best sports venues near you</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search turfs, locations..."
            className="w-full h-11 pl-10 pr-4 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground glass-card px-4 py-2 cursor-pointer hover:border-primary/30 transition-colors">
          <MapPin className="h-4 w-4" />
          <span>Bangalore</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground glass-card px-4 py-2 cursor-pointer hover:border-primary/30 transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
        </div>
      </div>

      {/* Sport tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {sportsList.map((sport) => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeSport === sport
                ? "bg-primary text-primary-foreground neon-glow"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">{filtered.length} turfs found</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((turf) => (
              <TurfCard key={turf.id} {...turf} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TurfDiscovery;
