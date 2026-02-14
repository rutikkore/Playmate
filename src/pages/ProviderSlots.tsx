import { useState } from "react";
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const timeSlots = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM",
];

type SlotStatus = "available" | "booked" | "blocked";

const initialSlots: Record<string, SlotStatus> = {
  "7:00 AM": "booked", "8:00 AM": "booked", "2:00 PM": "booked",
  "4:00 PM": "booked", "5:00 PM": "booked", "6:00 PM": "booked",
  "9:00 PM": "booked", "11:00 AM": "blocked",
};

const days = ["Mon 10", "Tue 11", "Wed 12", "Thu 13", "Fri 14", "Sat 15", "Sun 16"];

const slotColors: Record<SlotStatus, string> = {
  available: "bg-secondary text-foreground border-border hover:border-primary/50 hover:bg-primary/10 cursor-pointer",
  booked: "bg-primary/15 text-primary border-primary/30 cursor-not-allowed",
  blocked: "bg-destructive/10 text-destructive/60 border-destructive/20 cursor-pointer",
};

const ProviderSlots = () => {
  const [selectedDay, setSelectedDay] = useState("Fri 14");
  const [slots, setSlots] = useState<Record<string, SlotStatus>>(initialSlots);
  const [showConflict, setShowConflict] = useState<string | null>(null);

  const getStatus = (time: string): SlotStatus => slots[time] || "available";

  const toggleSlot = (time: string) => {
    const status = getStatus(time);
    if (status === "booked") {
      setShowConflict(time);
      setTimeout(() => setShowConflict(null), 2000);
      return;
    }
    setSlots((prev) => ({
      ...prev,
      [time]: status === "available" ? "blocked" : "available",
    }));
  };

  const bookedCount = Object.values(slots).filter((s) => s === "booked").length;
  const blockedCount = Object.values(slots).filter((s) => s === "blocked").length;
  const availableCount = timeSlots.length - bookedCount - blockedCount;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Slot Management</h1>
        <p className="text-muted-foreground mt-1">Manage availability for Green Arena 5-a-side</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 text-center">
          <CheckCircle className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{availableCount}</p>
          <p className="text-xs text-muted-foreground">Available</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{bookedCount}</p>
          <p className="text-xs text-muted-foreground">Booked</p>
        </div>
        <div className="glass-card p-4 text-center">
          <XCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{blockedCount}</p>
          <p className="text-xs text-muted-foreground">Blocked</p>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedDay === day
                ? "bg-primary text-primary-foreground neon-glow"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Conflict warning */}
      {showConflict && (
        <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-lg flex items-center gap-2 text-sm text-warning animate-fade-in">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Cannot modify <strong>{showConflict}</strong> — this slot is already booked by a player.</span>
        </div>
      )}

      {/* Slot grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {timeSlots.map((time) => {
          const status = getStatus(time);
          return (
            <button
              key={time}
              onClick={() => toggleSlot(time)}
              className={`py-3 px-2 rounded-xl text-sm font-medium text-center border transition-all ${slotColors[status]}`}
            >
              <p>{time}</p>
              <p className="text-xs mt-1 capitalize opacity-70">{status}</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-secondary border border-border" /> Available (click to block)</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-primary/15 border border-primary/30" /> Booked (locked)</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-destructive/10 border border-destructive/20" /> Blocked (click to unblock)</span>
      </div>
    </div>
  );
};

export default ProviderSlots;
