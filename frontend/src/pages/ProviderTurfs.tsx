import { useState } from "react";
import { Plus, Edit3, Trash2, MapPin, Star, X } from "lucide-react";
import turf1 from "@/assets/turf-1.jpg";
import turf2 from "@/assets/turf-2.jpg";
import turf3 from "@/assets/turf-3.jpg";

interface Turf {
  id: number;
  name: string;
  location: string;
  sport: string;
  price: number;
  rating: number;
  image: string;
  courts: number;
  status: "active" | "inactive";
}

const initialTurfs: Turf[] = [
  { id: 1, name: "Green Arena 5-a-side", location: "Koramangala, Bangalore", sport: "Football", price: 1200, rating: 4.8, image: turf1, courts: 2, status: "active" },
  { id: 2, name: "Shuttle Zone Pro", location: "HSR Layout, Bangalore", sport: "Badminton", price: 800, rating: 4.6, image: turf2, courts: 4, status: "active" },
  { id: 3, name: "Pitch Perfect Nets", location: "Indiranagar, Bangalore", sport: "Cricket", price: 1500, rating: 4.9, image: turf3, courts: 3, status: "inactive" },
];

const ProviderTurfs = () => {
  const [turfs, setTurfs] = useState<Turf[]>(initialTurfs);
  const [showModal, setShowModal] = useState(false);
  const [editingTurf, setEditingTurf] = useState<Turf | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeleting(id);
    setTimeout(() => {
      setTurfs((prev) => prev.filter((t) => t.id !== id));
      setDeleting(null);
    }, 400);
  };

  const handleEdit = (turf: Turf) => {
    setEditingTurf(turf);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingTurf(null);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingTurf) {
      setTurfs((prev) => prev.map((t) => (t.id === editingTurf.id ? editingTurf : t)));
    } else {
      setTurfs((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: "New Turf",
          location: "Bangalore",
          sport: "Football",
          price: 1000,
          rating: 0,
          image: turf1,
          courts: 1,
          status: "active",
        },
      ]);
    }
    setShowModal(false);
  };

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
                  className="py-2 px-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="glass-card p-6 w-full max-w-md animate-scale-in neon-border" onClick={(e) => e.stopPropagation()}>
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
                  defaultValue={editingTurf?.name || ""}
                  className="w-full h-11 px-4 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Enter turf name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Sport</label>
                  <select
                    defaultValue={editingTurf?.sport || "Football"}
                    className="w-full h-11 px-4 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option>Football</option>
                    <option>Cricket</option>
                    <option>Badminton</option>
                    <option>Tennis</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Price/hr (₹)</label>
                  <input
                    type="number"
                    defaultValue={editingTurf?.price || 1000}
                    className="w-full h-11 px-4 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Location</label>
                <input
                  defaultValue={editingTurf?.location || ""}
                  className="w-full h-11 px-4 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Number of Courts</label>
                <input
                  type="number"
                  defaultValue={editingTurf?.courts || 1}
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
      )}
    </div>
  );
};

export default ProviderTurfs;
