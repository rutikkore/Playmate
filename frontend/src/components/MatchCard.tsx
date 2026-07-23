import { MapPin, Clock, Users, User, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Match, SkillLevel, MatchStatus } from "../services/match.service";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface MatchCardProps {
  match: Match;
  sportName: string;
  roleBadge?: "HOST" | "PLAYER";
}

const skillColors: Record<SkillLevel, string> = {
  BEGINNER: "bg-info/15 text-info border-info/30",
  INTERMEDIATE: "bg-warning/15 text-warning border-warning/30",
  ADVANCED: "bg-destructive/15 text-destructive border-destructive/30",
  MIXED: "bg-secondary text-muted-foreground border-border",
};

const statusColors: Record<MatchStatus, string> = {
  OPEN: "bg-primary/15 text-primary border-primary/30",
  FULL: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  IN_PROGRESS: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  CANCELLED: "bg-destructive/15 text-destructive border-destructive/30",
};

export function MatchCard({ match, sportName, roleBadge }: MatchCardProps) {
  const gameDate = new Date(match.booking.slot.date);
  const formattedDate = format(gameDate, "MMM d, yyyy");
  const timeStr = `${match.booking.slot.startTime} - ${match.booking.slot.endTime}`;

  return (
    <div className="glass-card-hover p-5 flex flex-col justify-between h-full group">
      <div>
        {/* Badges Row */}
        <div className="flex flex-wrap gap-2 mb-3 items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize">
              {sportName}
            </Badge>
            <Badge className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${skillColors[match.skillLevel]}`}>
              {match.skillLevel.toLowerCase()}
            </Badge>
            {roleBadge && (
              <Badge className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                roleBadge === "HOST"
                  ? "bg-primary text-primary-foreground border-primary/20 neon-glow"
                  : "bg-secondary text-primary border-primary/30"
              }`}>
                {roleBadge}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Badge className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[match.status]}`}>
              {match.status}
            </Badge>
            {match.visibility === "PRIVATE" && (
              <Badge variant="outline" className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 border-zinc-700 text-zinc-400 flex items-center gap-1">
                <Shield className="h-3 w-3" /> PRIVATE
              </Badge>
            )}
          </div>
        </div>

        {/* Turf Name */}
        <h3 className="font-bold text-lg text-foreground truncate mb-1" title={match.booking.turf.name}>
          {match.booking.turf.name}
        </h3>

        {/* Match Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
          {match.description || "No description provided."}
        </p>

        {/* Location & Time details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{match.booking.turf.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              {formattedDate} • {timeStr}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>Hosted by <strong className="text-foreground font-semibold">{match.host.name || "Anonymous"}</strong></span>
          </div>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="pt-4 border-t border-glass-border flex items-center justify-between gap-4 mt-auto">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Players</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {match.participantCount} <span className="text-muted-foreground font-normal">/ {match.maxPlayers}</span>
            </span>
          </div>
        </div>

        <Button asChild variant="default" size="sm" className="neon-glow font-semibold">
          <Link to={`/matches/${match.id}`}>View Details</Link>
        </Button>
      </div>
    </div>
  );
}
