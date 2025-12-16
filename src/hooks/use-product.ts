// my-app/src/hooks/use-product.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from "@/lib/axios";
import { AxiosError } from 'axios';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const useProducts = () => {
  const queryClient = useQueryClient();

  const getAuthToken = () => localStorage.getItem('token') || '';

  // Get all products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/products', {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      return data.data;
    },
  });

  // Get single product
  const useProduct = (id: string) => {
    return useQuery<Product>({
      queryKey: ['product', id],
      queryFn: async () => {
        const { data } = await axiosInstance.get(`/products/${id}`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        return data;
      },
      enabled: !!id,
    });
  };

  // Create product
  const createProduct = useMutation({
    mutationFn: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await axiosInstance.post('/products', productData, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Update product
  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data } = await axiosInstance.put(`/products/${id}`, updates, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });

  // Delete product
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    products,
    isLoading,
    useProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};