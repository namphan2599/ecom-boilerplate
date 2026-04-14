import { client } from "./client";
import type { User, AuthResponse } from "../types";

export const authApi = {
  login: (credentials: any) => 
    client.post<AuthResponse>("/auth/login", credentials),
  
  getMe: () => 
    client.get<User>("/auth/me"),
  logout: () => 
    client.post("/auth/logout"),
};
