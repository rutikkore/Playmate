import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Edit3, Trash2, MapPin, Star, X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { turfService } from "@/services/turf.service";
import { getTurfImage } from "@/lib/utils";
import { toast } from "sonner";

interface Turf {
  id: string;
  name: string;
  location: string;
  sport: string;
  price: number;
  rating: number;
  image: string;
  courts: number;
  status: "active" | "inactive";
}

const ProviderTurfs = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingTurf, setEditingTurf] = useState<Turf | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form states
  const [nameVal, setNameVal] = useState("");
  const [sportVal, setSportVal] = useState("Football");
  const [priceVal, setPriceVal] = useState(1000);
  const [locationVal, setLocationVal] = useState("");
  const [courtsVal, setCourtsVal] = useState(1);

  // Fetch provider profile (auto-create if missing)
  const { data: providerProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["provider-profile"],
    queryFn: async () => {
      let profile = await turfService.getProviderProfile();
      if (!profile) {
        profile = await turfService.createProviderProfile("My Venue Business", "");
      }
      return profile;
    },
  });

  // Fetch turfs
  const { data: dbTurfs = [], isLoading: isTurfsLoading, refetch } = useQuery({
    queryKey: ["provider-turfs", providerProfile?.id],
    queryFn: () => turfService.getTurfs({ providerId: providerProfile!.id }),
    enabled: !!providerProfile?.id,
  });

  // Fetch sports
  const { data: sportsList = [] } = useQuery({
    queryKey: ["sports"],
    queryFn: () => turfService.getSports(),
  });

  // Map db turfs to UI format
  const turfs: Turf[] = dbTurfs.map((t) => ({
    id: t.id,
    name: t.name,
    location: t.location,
    sport: t.sports[0]?.sport.name || "Football",
    price: t.pricePerHour,
    rating: 4.8,
    image: getTurfImage(t.images[0]),
    courts: t.courts,
    status: t.status as "active" | "inactive",
  }));

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await turfService.deleteTurf(id);
      refetch();
    } catch (err) {
      console.error("Error deleting turf:", err);
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (turf: Turf) => {
    setEditingTurf(turf);
    setNameVal(turf.name);
    setSportVal(turf.sport);
    setPriceVal(turf.price);
    setLocationVal(turf.location);
    setCourtsVal(turf.courts);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingTurf(null);
    setNameVal("");
    setSportVal(sportsList[0]?.name || "Football");
    setPriceVal(1000);
    setLocationVal("");
    setCourtsVal(1);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!nameVal.trim()) {
      toast.error("Please enter a turf name");
      return;
    }
    if (!locationVal.trim()) {
      toast.error("Please enter a location");
      return;
    }

    const matchedSport = sportsList.find((s) => s.name.toLowerCase() === sportVal.toLowerCase());
    const sportIds = matchedSport ? [matchedSport.id] : [];

    // Map sport to image asset name
    const imageMap: Record<string, string> = {
      football: "turf-1.jpg",
      badminton: "turf-2.jpg",
      cricket: "turf-3.jpg",
      tennis: "turf-4.jpg",
    };
    const imageName = imageMap[sportVal.toLowerCase()] || "turf-1.jpg";

    const turfData = {
      name: nameVal.trim(),
      location: locationVal.trim(),
      pricePerHour: Number(priceVal),
      courts: Number(courtsVal),
      sports: sportIds,
      images: [imageName],
    };

    try {
      if (editingTurf) {
        await turfService.updateTurf(editingTurf.id, {
          ...turfData,
          status: editingTurf.status,
        });
        toast.success("Turf updated successfully");
      } else {
        await turfService.createTurf(turfData);
        toast.success("Turf added successfully");
      }
      refetch();
      setShowModal(false);
    } catch (err) {
      console.error("Error saving turf:", err);
      toast.error("Failed to save turf. Please try again.");
    }
  };

  if (isProfileLoading || isTurfsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Manage Turfs</h1>
          <p className="text-muted-foreground mt-1">Add, edit, or remove your venues</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 neon-glow"
        >
          <Plus className="h-4 w-4" /> Add Turf
        </button>
      </div>

      {turfs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">No turfs created yet. Click "Add Turf" to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {turfs.map((turf) => (
            <div
              key={turf.id}
              className={`glass-card overflow-hidden transition-all duration-300 ${
                deleting === turf.id ? "opacity-0 scale-95" : ""
              }`}
            >
              <div className="relative h-40 overflow-hidden">
                <img src={turf.image} alt={turf.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <span
                  className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    turf.status === "active"
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {turf.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{turf.name}</h3>
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{turf.location}</span>
                </div>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-muted-foreground">
                    {turf.sport} · {turf.courts} court{turf.courts > 1 ? "s" : ""}
                  </span>
                  <span className="font-bold text-primary">₹{turf.price}/hr</span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(turf)}
                    className="flex-1 py-2 bg-secondary rounded-lg text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(turf.id)}
                    className="py-2 px-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm hover:bg-destructive/20 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && createPortal(
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div
            className="flex min-h-full items-center justify-center p-4 text-center animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-card p-6 w-full max-w-md animate-scale-in neon-border text-left relative z-50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">
                  {editingTurf ? "Edit Turf" : "Add New Turf"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Turf Name</label>
                  <input
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    className="w-full h-11 px-4 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Enter turf name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Sport</label>
                    <select
                      value={sportVal}
                      onChange={(e) => setSportVal(e.target.value)}
                      className="w-full h-11 px-4 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                      {sportsList.length > 0 ? (
                        sportsList.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option>Football</option>
                          <option>Cricket</option>
                          <option>Badminton</option>
                          <option>Tennis</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Price/hr (₹)</label>
                    <input
                      type="number"
                      value={priceVal}
                      onChange={(e) => setPriceVal(Number(e.target.value))}
                      className="w-full h-11 px-4 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Location</label>
                  <input
                    value={locationVal}
                    onChange={(e) => setLocationVal(e.target.value)}
                    className="w-full h-11 px-4 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Number of Courts</label>
                  <input
                    type="number"
                    value={courtsVal}
                    onChange={(e) => setCourtsVal(Number(e.target.value))}
                    min={1}
                    className="w-full h-11 px-4 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                className="w-full mt-6 h-11 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all neon-glow"
              >
                {editingTurf ? "Save Changes" : "Add Turf"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProviderTurfs;
