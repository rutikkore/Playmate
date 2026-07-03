import { Link } from "react-router-dom";
import { Zap, ArrowRight, MapPin, Users, CalendarDays, Shield } from "lucide-react";
import heroImage from "@/assets/hero-turf.jpg";
import { Hero } from "@/components/home/Hero";


const features = [
  { icon: MapPin, title: "Discover Turfs", desc: "Find premium sports turfs near you with real-time availability" },
  { icon: CalendarDays, title: "Instant Booking", desc: "Book your preferred slot in seconds with our smart calendar" },
  { icon: Users, title: "Matchmaking", desc: "Find players, form teams, and join games effortlessly" },
  { icon: Shield, title: "For Providers", desc: "Manage your venues, slots, and analytics in one place" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold neon-text">PlayMate</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all neon-glow"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <Hero />



      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything you need to <span className="neon-text">play</span>
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
            From discovering venues to finding teammates, PlayMate handles it all.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="glass-card-hover p-6 text-center"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold neon-text">PlayMate</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 PlayMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
