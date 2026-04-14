import { client } from "./client";
import type { User, PaginatedResponse } from "../types";

export const usersApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    
    return client.get<PaginatedResponse<User>>(`/users?${searchParams.toString()}`);
  },
  
  getUser: (id: string) => 
    client.get<User>(`/users/${id}`),
  
  updateUserRole: (id: string, role: string) => 
    client.patch<User>(`/users/${id}/role`, { role }),
  
  toggleUserStatus: (id: string, isActive: boolean) => 
    client.patch<User>(`/users/${id}/status`, { isActive }),
};
