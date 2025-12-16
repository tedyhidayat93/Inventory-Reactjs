// src/hooks/use-warehouse.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"
import { AxiosError } from 'axios';

export interface Warehouse {
  id: string
  name: string
  location: string
  capacity: number
  createdAt: string
  updatedAt: string
}

export function useWarehouses() {
  const queryClient = useQueryClient()
  
  const { data, isLoading } = useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/warehouses')
      return data
    }
  })

  const createWarehouse = useMutation({
    mutationFn: async (warehouse: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await axiosInstance.post('/warehouses', warehouse)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    }
  })

  const updateWarehouse = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Warehouse> & { id: string }) => {
      const { data } = await axiosInstance.put(`/warehouses/${id}`, updates)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    }
  })

  const deleteWarehouse = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/warehouses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    }
  })

  return {
    data,
    isLoading,
    createWarehouse: createWarehouse.mutateAsync,
    updateWarehouse: updateWarehouse.mutateAsync,
    deleteWarehouse: deleteWarehouse.mutateAsync,
  }
}