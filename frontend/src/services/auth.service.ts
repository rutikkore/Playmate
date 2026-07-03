import API from "./api";

export interface BackendUser {
  id: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  photoUrl: string | null;
  role: "PLAYER" | "PROVIDER";
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SyncUserResponse {
  user: BackendUser;
}

export const authService = {
  async register(idToken: string, name: string, role: string): Promise<SyncUserResponse> {
    const { data } = await API.post<SyncUserResponse>("/auth/register", { idToken, name, role });
    return data;
  },

  async login(idToken: string): Promise<SyncUserResponse> {
    const { data } = await API.post<SyncUserResponse>("/auth/login", { idToken });
    return data;
  },

  async googleLogin(idToken: string, role: string): Promise<SyncUserResponse> {
    const { data } = await API.post<SyncUserResponse>("/auth/google", { idToken, role });
    return data;
  },
};
