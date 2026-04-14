import { client } from "./client";
import type { Product, PaginatedResponse } from "../types";

export const productsApi = {
  getProducts: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    
    return client.get<PaginatedResponse<Product>>(`/catalog/products?${searchParams.toString()}`);
  },
  
  getProduct: (id: string) => 
    client.get<Product>(`/catalog/products/${id}`),
  
  createProduct: (data: any) => 
    client.post<Product>("/catalog/products", data),
  
  updateProduct: (id: string, data: any) => 
    client.patch<Product>(`/catalog/products/${id}`, data),
  
  deleteProduct: (id: string) => 
    client.delete(`/catalog/products/${id}`),
};
