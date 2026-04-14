import { client } from "./client";
import type { Order, PaginatedResponse } from "../types";

export const ordersApi = {
  getOrders: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    
    return client.get<PaginatedResponse<Order>>(`/sales/orders?${searchParams.toString()}`);
  },
  
  getOrder: (id: string) => 
    client.get<Order>(`/sales/orders/${id}`),
  
  updateOrderStatus: (id: string, status: string) => 
    client.patch<Order>(`/sales/orders/${id}/status`, { status }),
};
