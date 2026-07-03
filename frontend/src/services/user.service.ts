import API from "./api";
import { SyncUserResponse } from "./auth.service";

export const userService = {
  async getMe(): Promise<SyncUserResponse> {
    const { data } = await API.get<SyncUserResponse>("/users/me");
    return data;
  },
};
