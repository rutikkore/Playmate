import { useState } from "react";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { TurfCard } from "@/components/TurfCard";
import turf1 from "@/assets/turf-1.jpg";
import turf2 from "@/assets/turf-2.jpg";
import turf3 from "@/assets/turf-3.jpg";
import turf4 from "@/assets/turf-4.jpg";

const sports = ["All", "Football", "Cricket", "Badminton", "Tennis", "Basketball"];

const turfs = [
  { id: 1, name: "Green Arena 5-a-side", location: "Koramangala, Bangalore", sport: "Football", price: 1200, rating: 4.8, image: turf1, available: true },
  { id: 2, name: "Shuttle Zone Pro", location: "HSR Layout, Bangalore", sport: "Badminton", price: 800, rating: 4.6, image: turf2, available: true },
  { id: 3, name: "Pitch Perfect Nets", location: "Indiranagar, Bangalore", sport: "Cricket", price: 1500, rating: 4.9, image: turf3, available: false },
  { id: 4, name: "Ace Tennis Academy", location: "Whitefield, Bangalore", sport: "Tennis", price: 1000, rating: 4.7, image: turf4, available: true },
  { id: 5, name: "Goal Rush Arena", location: "JP Nagar, Bangalore", sport: "Football", price: 1100, rating: 4.5, image: turf1, available: true },
  { id: 6, name: "Smash Court", location: "Marathahalli, Bangalore", sport: "Badminton", price: 700, rating: 4.3, image: turf2, available: true },
];

const TurfDiscovery = () => {
  const [activeSport, setActiveSport] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = turfs.filter((t) => {
    const matchesSport = activeSport === "All" || t.sport === activeSport;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.location.toLowerCase().includes(search.toLowerCase());
    return matchesSport && matchesSearch;
  });

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
        {sports.map((sport) => (
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
      <p className="text-sm text-muted-foreground mb-4">{filtered.length} turfs found</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((turf) => (
          <TurfCard key={turf.id} {...turf} />
        ))}
      </div>
    </div>
  );
};

export default TurfDiscovery;
