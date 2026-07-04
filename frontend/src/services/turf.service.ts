import API from "./api";

export interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  businessName: string;
  contactPhone: string | null;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
}

export interface Turf {
  id: string;
  name: string;
  description: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  pricePerHour: number;
  courts: number;
  images: string[];
  status: "active" | "inactive";
  providerId: string;
  sports: Array<{
    sport: Sport;
  }>;
}

export interface AvailabilitySlot {
  id: string;
  turfId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "BLOCKED";
  price: number | null;
}

export interface Favourite {
  id: string;
  userId: string;
  turfId: string;
  turf: Turf;
}

export const turfService = {
  // Sports
  async getSports(): Promise<Sport[]> {
    const { data } = await API.get<{ sports: Sport[] }>("/sports");
    return data.sports;
  },

  // Provider Profile
  async getProviderProfile(): Promise<ProviderProfile | null> {
    try {
      const { data } = await API.get<{ profile: ProviderProfile }>("/providers/profile");
      return data.profile;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async createProviderProfile(businessName: string, contactPhone?: string): Promise<ProviderProfile> {
    const { data } = await API.post<{ profile: ProviderProfile }>("/providers/profile", {
      businessName,
      contactPhone,
    });
    return data.profile;
  },

  async updateProviderProfile(businessName?: string, contactPhone?: string): Promise<ProviderProfile> {
    const { data } = await API.put<{ profile: ProviderProfile }>("/providers/profile", {
      businessName,
      contactPhone,
    });
    return data.profile;
  },

  // Turfs
  async getTurfs(filters?: {
    sport?: string;
    search?: string;
    location?: string;
    providerId?: string;
  }): Promise<Turf[]> {
    const { data } = await API.get<{ turfs: Turf[] }>("/turfs", { params: filters });
    return data.turfs;
  },

  async getTurfById(id: string): Promise<Turf> {
    const { data } = await API.get<{ turf: Turf }>(`/turfs/${id}`);
    return data.turf;
  },

  async createTurf(data: {
    name: string;
    description?: string;
    location: string;
    pricePerHour: number;
    courts: number;
    images?: string[];
    sports: string[];
  }): Promise<Turf> {
    const { data: response } = await API.post<{ turf: Turf }>("/turfs", data);
    return response.turf;
  },

  async updateTurf(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      location: string;
      pricePerHour: number;
      courts: number;
      images: string[];
      status: "active" | "inactive";
      sports: string[];
    }>
  ): Promise<Turf> {
    const { data: response } = await API.put<{ turf: Turf }>(`/turfs/${id}`, data);
    return response.turf;
  },

  async deleteTurf(id: string): Promise<void> {
    await API.delete(`/turfs/${id}`);
  },

  // Availability Slots
  async getAvailability(turfId: string, date: string): Promise<AvailabilitySlot[]> {
    const { data } = await API.get<{ slots: AvailabilitySlot[] }>("/availability", {
      params: { turfId, date },
    });
    return data.slots;
  },

  async updateAvailability(
    turfId: string,
    date: string,
    slots: Array<{
      startTime: string;
      endTime: string;
      status: "AVAILABLE" | "BLOCKED";
      price?: number;
    }>
  ): Promise<AvailabilitySlot[]> {
    const { data } = await API.post<{ slots: AvailabilitySlot[] }>("/availability", {
      turfId,
      date,
      slots,
    });
    return data.slots;
  },

  // Favourites
  async getFavourites(): Promise<Favourite[]> {
    const { data } = await API.get<{ favourites: Favourite[] }>("/favourites");
    return data.favourites;
  },

  async addFavourite(turfId: string): Promise<Favourite> {
    const { data } = await API.post<{ favourite: Favourite }>("/favourites", { turfId });
    return data.favourite;
  },

  async removeFavourite(turfId: string): Promise<void> {
    await API.delete(`/favourites/${turfId}`);
  },
};
