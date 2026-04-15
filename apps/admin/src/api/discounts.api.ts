import { client } from "./client";
import type { Coupon, PaginatedResponse } from "../types";

export const discountsApi = {
  getCoupons: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    
    return client.get<Coupon[]>(`/discounts?${searchParams.toString()}`);
  },
  
  getCoupon: async (id: string) => 
    await client.get<Coupon>(`/discounts/${id}`),
  
  createCoupon: async (data: Partial<Coupon>) => 
    await client.post<Coupon>("/discounts", data),
  
  updateCoupon:async (id: string, data: Partial<Coupon>) => 
    await client.patch<Coupon>(`/discounts/${id}`, data),
  
  deleteCoupon:async (id: string) => 
    await client.delete(`/discounts/${id}`),
};
