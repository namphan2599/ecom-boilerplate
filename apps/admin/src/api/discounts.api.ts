import { client } from "./client";
import type { Coupon, PaginatedResponse } from "../types";

export const discountsApi = {
  getCoupons: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    
    return client.get<PaginatedResponse<Coupon>>(`/discounts?${searchParams.toString()}`);
  },
  
  getCoupon: (id: string) => 
    client.get<Coupon>(`/discounts/${id}`),
  
  createCoupon: (data: Partial<Coupon>) => 
    client.post<Coupon>("/discounts", data),
  
  updateCoupon: (id: string, data: Partial<Coupon>) => 
    client.patch<Coupon>(`/discounts/${id}`, data),
  
  deleteCoupon: (id: string) => 
    client.delete(`/discounts/${id}`),
};
