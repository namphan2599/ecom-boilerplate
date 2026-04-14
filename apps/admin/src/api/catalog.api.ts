import { client } from "./client";
import type { Category, Tag } from "../types";

export const catalogApi = {
  // Categories
  getCategories: () => 
    client.get<Category[]>("/catalog/categories"),
  
  createCategory: (data: Partial<Category>) => 
    client.post<Category>("/catalog/categories", data),
  
  updateCategory: (id: string, data: Partial<Category>) => 
    client.patch<Category>(`/catalog/categories/${id}`, data),
  
  deleteCategory: (id: string) => 
    client.delete(`/catalog/categories/${id}`),

  // Tags
  getTags: () => 
    client.get<Tag[]>("/catalog/tags"),
  
  createTag: (data: Partial<Tag>) => 
    client.post<Tag>("/catalog/tags", data),
  
  updateTag: (id: string, data: Partial<Tag>) => 
    client.patch<Tag>(`/catalog/tags/${id}`, data),
  
  deleteTag: (id: string) => 
    client.delete(`/catalog/tags/${id}`),
};
