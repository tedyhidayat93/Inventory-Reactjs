// my-app/src/hooks/use-warehouse.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'; // Update with your API URL

export interface Warehouse {
  id: string;
  name: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export const useWarehouses = () => {
  const queryClient = useQueryClient();

  const getAuthToken = () => localStorage.getItem('token') || '';

  // Get all warehouses
  const { data: warehouses = [], isLoading } = useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data } = await axios.get(API_URL + '/warehouses', {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      return data.data;
    },
  });

  // Get single warehouse
  const useWarehouse = (id: string) => {
    return useQuery<Warehouse>({
      queryKey: ['warehouse', id],
      queryFn: async () => {
        const { data } = await axios.get(`${API_URL}/warehouses/${id}`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        return data.data;
      },
      enabled: !!id,
    });
  };

  // Create warehouse
  const createWarehouse = useMutation({
    mutationFn: async (warehouseData: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await axios.post(API_URL + '/warehouses', warehouseData, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });

  // Update warehouse
  const updateWarehouse = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Warehouse> & { id: string }) => {
      const { data } = await axios.put(`${API_URL}/warehouses/${id}`, updates, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      return data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse', id] });
    },
  });

  // Delete warehouse
  const deleteWarehouse = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_URL}/warehouses/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });

  return {
    warehouses,
    isLoading,
    useWarehouse,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
  };
};