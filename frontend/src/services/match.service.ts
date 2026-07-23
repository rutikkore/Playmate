import API from "./api";
import { Turf } from "./turf.service";

export type MatchStatus = "OPEN" | "FULL" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "MIXED";
export type MatchVisibility = "PUBLIC" | "PRIVATE";

export interface AvailabilitySlot {
  id: string;
  turfId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "BLOCKED";
  price: number | null;
}

export interface Booking {
  id: string;
  userId: string;
  turfId: string;
  slotId: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalPrice: string | number;
  createdAt: string;
  updatedAt: string;
  turf: Turf;
  slot: AvailabilitySlot;
}

export interface MatchUser {
  id: string;
  name: string | null;
  photoUrl: string | null;
  role: string;
}

export interface MatchParticipant {
  id: string;
  matchId: string;
  userId: string;
  role: "HOST" | "PLAYER";
  joinedAt: string;
  user: MatchUser;
}

export interface Match {
  id: string;
  bookingId: string;
  hostId: string;
  sportId: string;
  description: string | null;
  status: MatchStatus;
  skillLevel: SkillLevel;
  maxPlayers: number;
  participantCount: number;
  visibility: MatchVisibility;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  booking: Booking;
  host: MatchUser;
  participants: MatchParticipant[];
}

export interface MatchesResponse {
  matches: Match[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MatchFilters {
  sportId?: string;
  skillLevel?: SkillLevel;
  status?: MatchStatus;
  page?: number;
  limit?: number;
}

export const matchService = {
  /**
   * Get paginated list of public matches with filters
   */
  getMatches: async (filters?: MatchFilters): Promise<MatchesResponse> => {
    const params = { ...filters } as Record<string, unknown>;
    // Remove undefined/empty filter keys to clean up query
    Object.keys(params).forEach((key) => {
      const val = params[key];
      if (val === undefined || val === "" || val === "All") {
        delete params[key];
      }
    });

    const response = await API.get<MatchesResponse>("/matches", { params });
    return response.data;
  },

  /**
   * Get single match by ID
   */
  getMatchById: async (id: string): Promise<Match> => {
    const response = await API.get<Match>(`/matches/${id}`);
    return response.data;
  },

  /**
   * Create a new match
   */
  createMatch: async (data: {
    bookingId: string;
    sportId: string;
    skillLevel: SkillLevel;
    maxPlayers: number;
    description?: string;
    visibility: MatchVisibility;
  }): Promise<Match> => {
    const response = await API.post<Match>("/matches", data);
    return response.data;
  },

  /**
   * Get all matches hosted by the authenticated user
   */
  getMyHostedMatches: async (): Promise<Match[]> => {
    const response = await API.get<Match[]>("/matches/my-hosted");
    return response.data;
  },

  /**
   * Get all matches joined by the authenticated user
   */
  getMyJoinedMatches: async (): Promise<Match[]> => {
    const response = await API.get<Match[]>("/matches/my-joined");
    return response.data;
  },

  /**
   * Join a match by ID
   */
  joinMatch: async (id: string): Promise<Match> => {
    const response = await API.post<Match>(`/matches/${id}/join`);
    return response.data;
  },

  /**
   * Leave a joined match by ID
   */
  leaveMatch: async (id: string): Promise<Match> => {
    const response = await API.delete<Match>(`/matches/${id}/leave`);
    return response.data;
  },
};
