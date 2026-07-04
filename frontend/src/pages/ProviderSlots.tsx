import { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { turfService } from "@/services/turf.service";

const timeSlots = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM",
];

type SlotStatus = "available" | "blocked";

const days = ["Mon 10", "Tue 11", "Wed 12", "Thu 13", "Fri 14", "Sat 15", "Sun 16"];

const slotColors: Record<SlotStatus, string> = {
  available: "bg-secondary text-foreground border-border hover:border-primary/50 hover:bg-primary/10 cursor-pointer",
  blocked: "bg-destructive/10 text-destructive/60 border-destructive/20 cursor-pointer",
};

const ProviderSlots = () => {
  const [selectedDay, setSelectedDay] = useState("Fri 14");
  const [selectedTurfId, setSelectedTurfId] = useState<string | null>(null);

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

  // Fetch provider's turfs
  const { data: dbTurfs = [], isLoading: isTurfsLoading } = useQuery({
    queryKey: ["provider-turfs", providerProfile?.id],
    queryFn: () => turfService.getTurfs({ providerId: providerProfile!.id }),
    enabled: !!providerProfile?.id,
  });

  // Automatically select first turf when turfs load
  useEffect(() => {
    if (dbTurfs.length > 0 && !selectedTurfId) {
      setSelectedTurfId(dbTurfs[0].id);
    }
  }, [dbTurfs, selectedTurfId]);

  const selectedTurf = dbTurfs.find((t) => t.id === selectedTurfId);

  // Map day to backend Date string
  const dayToDateStr = (dayStr: string) => {
    const num = dayStr.split(" ")[1];
    return `2026-02-${num.padStart(2, "0")}T00:00:00.000Z`;
  };

  // Fetch slots for selected turf and day
  const { data: dbSlots = [], isLoading: isSlotsLoading, refetch } = useQuery({
    queryKey: ["provider-slots", selectedTurfId, selectedDay],
    queryFn: () => turfService.getAvailability(selectedTurfId!, dayToDateStr(selectedDay)),
    enabled: !!selectedTurfId,
  });

  const getStatus = (time: string): SlotStatus => {
    const dbSlot = dbSlots.find((s) => s.startTime === time);
    return dbSlot?.status === "BLOCKED" ? "blocked" : "available";
  };

  const toggleSlot = async (time: string) => {
    if (!selectedTurfId) return;
    const dbSlot = dbSlots.find((s) => s.startTime === time);
    const currentStatus = dbSlot?.status || "AVAILABLE";
    const newStatus = currentStatus === "AVAILABLE" ? "BLOCKED" : "AVAILABLE";

    // Calculate end time (+1 hour)
    const [hourStr, modifier] = time.split(" ");
    let [hours, minutes] = hourStr.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    
    let endHours = hours + 1;
    let endModifier = "AM";
    if (endHours >= 12) {
      endModifier = "PM";
      if (endHours > 12) endHours -= 12;
    } else if (endHours === 0) {
      endHours = 12;
    }
    const endTime = `${endHours}:00 ${endModifier}`;

    try {
      await turfService.updateAvailability(selectedTurfId, dayToDateStr(selectedDay), [
        {
          startTime: time,
          endTime,
          status: newStatus,
        },
      ]);
      refetch();
    } catch (err) {
      console.error("Error toggling slot availability:", err);
    }
  };

  const blockedCount = dbSlots.filter((s) => s.status === "BLOCKED").length;
  const availableCount = timeSlots.length - blockedCount;

  if (isProfileLoading || isTurfsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Slot Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage availability for {selectedTurf ? selectedTurf.name : "your turf"}
          </p>
        </div>
        {dbTurfs.length > 0 && (
          <select
            value={selectedTurfId || ""}
            onChange={(e) => setSelectedTurfId(e.target.value)}
            className="h-11 px-4 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all max-w-xs"
          >
            {dbTurfs.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {dbTurfs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">Please add a turf first to manage its slots.</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4 text-center">
              <CheckCircle className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{availableCount}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
            <div className="glass-card p-4 text-center">
              <XCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{blockedCount}</p>
              <p className="text-xs text-muted-foreground">Blocked</p>
            </div>
            <div className="glass-card p-4 text-center opacity-50">
              <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Bookings (M3)</p>
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

          {/* Slot grid */}
          {isSlotsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
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
          )}

          <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-secondary border border-border" /> Available (click to block)
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-destructive/10 border border-destructive/20" /> Blocked (click to unblock)
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default ProviderSlots;
