// my-app/src/hooks/use-product.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'; // Update with your API URL

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
      const { data } = await axios.get(API_URL + '/products', {
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
        const { data } = await axios.get(`${API_URL}/products/${id}`, {
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
      const { data } = await axios.post(API_URL + '/products', productData, {
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
      const { data } = await axios.put(`${API_URL}/products/${id}`, updates, {
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
      await axios.delete(`${API_URL}/products/${id}`, {
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