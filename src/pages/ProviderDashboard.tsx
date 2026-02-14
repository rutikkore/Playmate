import { useState } from "react";
import { BarChart3, DollarSign, CalendarDays, Users, TrendingUp, Clock, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";

const slots = [
  { id: 1, time: "6:00 AM", status: "available" },
  { id: 2, time: "7:00 AM", status: "booked" },
  { id: 3, time: "8:00 AM", status: "booked" },
  { id: 4, time: "9:00 AM", status: "available" },
  { id: 5, time: "10:00 AM", status: "available" },
  { id: 6, time: "11:00 AM", status: "blocked" },
  { id: 7, time: "12:00 PM", status: "available" },
  { id: 8, time: "1:00 PM", status: "available" },
  { id: 9, time: "2:00 PM", status: "booked" },
  { id: 10, time: "3:00 PM", status: "available" },
  { id: 11, time: "4:00 PM", status: "booked" },
  { id: 12, time: "5:00 PM", status: "booked" },
  { id: 13, time: "6:00 PM", status: "booked" },
  { id: 14, time: "7:00 PM", status: "available" },
  { id: 15, time: "8:00 PM", status: "available" },
  { id: 16, time: "9:00 PM", status: "booked" },
  { id: 17, time: "10:00 PM", status: "available" },
];

const recentBookings = [
  { name: "Arjun M.", time: "6:00 PM", date: "Today", sport: "Football", amount: 1200 },
  { name: "Priya S.", time: "7:30 AM", date: "Tomorrow", sport: "Badminton", amount: 800 },
  { name: "Vikram R.", time: "4:00 PM", date: "Feb 16", sport: "Cricket", amount: 1500 },
  { name: "Meera D.", time: "6:00 AM", date: "Feb 15", sport: "Tennis", amount: 1000 },
];

const slotColors: Record<string, string> = {
  available: "bg-secondary text-foreground border-border hover:border-primary/50 hover:bg-primary/10 cursor-pointer",
  booked: "bg-primary/15 text-primary border-primary/30",
  blocked: "bg-destructive/10 text-destructive/60 border-destructive/20 cursor-not-allowed",
};

const ProviderDashboard = () => {
  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Provider Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Green Arena 5-a-side — Manage your venue</p>
        </div>
        <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 neon-glow">
          <Plus className="h-4 w-4" /> Add Turf
        </button>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Revenue (Month)" value="₹1,84,500" icon={DollarSign} trend={{ value: "+12%", positive: true }} />
        <StatCard title="Total Bookings" value={156} icon={CalendarDays} trend={{ value: "+8%", positive: true }} />
        <StatCard title="Occupancy Rate" value="78%" icon={BarChart3} trend={{ value: "+5%", positive: true }} />
        <StatCard title="Active Players" value={342} icon={Users} trend={{ value: "+22", positive: true }} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Slot management */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Today's Slots</h2>
            <span className="text-sm text-muted-foreground">Feb 14, 2026</span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`py-3 px-2 rounded-xl text-sm font-medium text-center border transition-all ${slotColors[slot.status]}`}
              >
                <p>{slot.time}</p>
                <p className="text-xs mt-1 capitalize opacity-70">{slot.status}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-secondary border border-border" /> Available</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-primary/15 border border-primary/30" /> Booked</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-destructive/10 border border-destructive/20" /> Blocked</span>
          </div>
        </div>

        {/* Recent bookings */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Bookings</h2>
          <div className="space-y-3">
            {recentBookings.map((booking, i) => (
              <div key={i} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{booking.name}</p>
                    <p className="text-xs text-muted-foreground">{booking.sport} · {booking.date}, {booking.time}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">₹{booking.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
