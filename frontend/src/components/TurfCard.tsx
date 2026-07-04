import { MapPin, Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface TurfCardProps {
  id: string | number;
  name: string;
  location: string;
  sport: string;
  price: number;
  rating: number;
  image: string;
  available: boolean;
}

export function TurfCard({ id, name, location, sport, price, rating, image, available }: TurfCardProps) {
  return (
    <Link to={`/booking?turfId=${id}`} className="block">
      <div className="glass-card-hover overflow-hidden group">
        <div className="relative h-44 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
            available ? "bg-primary/20 text-primary border border-primary/30" : "bg-destructive/20 text-destructive border border-destructive/30"
          }`}>
            {available ? "Available" : "Full"}
          </span>
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/80 text-secondary-foreground backdrop-blur-sm">
            {sport}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          <div className="flex items-center gap-1 mt-1.5 text-muted-foreground text-sm">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-warning fill-warning" />
              <span className="text-sm font-medium text-foreground">{rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-bold text-primary">₹{price}/hr</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
