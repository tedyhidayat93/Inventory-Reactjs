// my-app/src/hooks/use-inventory.ts
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from "@/lib/axios"

// Types
export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'OPNAME';
export type StockOpnameStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface InventoryItem {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reorderLevel?: number;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockOpname {
  id: string;
  warehouseId: string;
  status: StockOpnameStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    productId: string;
    systemQuantity: number;
    actualQuantity: number;
    notes?: string;
  }>;
}

export const useInventory = () => {
  const queryClient = useQueryClient();

  const getAuthToken = () => localStorage.getItem('token') || '';

  // Get inventory by warehouse
  const useWarehouseInventory = (warehouseId: string) => {
    return useQuery<InventoryItem[]>({
      queryKey: ['inventory', 'warehouse', warehouseId],
      queryFn: async () => {
        const { data } = await axiosInstance.get(`/inventory/warehouse/${warehouseId}`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        return data.data;
      },
      enabled: !!warehouseId,
    });
  };

  // Get Multiple Warehouse Data
  const useWarehousesInventory = (warehouseIds: string[]) => {
    // Gunakan useQueries agar aman
    const queries = useQueries({
      queries: warehouseIds.map((id) => ({
        queryKey: ['inventory', 'warehouse', id],
        queryFn: async () => {
          const { data } = await axiosInstance.get(`/inventory/warehouse/${id}`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          })
          return data.data as InventoryItem[]
        },
        enabled: !!id,
      })),
    })

    // Flatten data dari semua warehouse
    const data: InventoryItem[] = queries.flatMap(q => q.data ?? [])
    const isLoading = queries.some(q => q.isLoading)
    const isError = queries.some(q => q.isError)
    const error = queries.find(q => q.error)?.error

    return { data, isLoading, isError, error }
  }

  // Get inventory by product
  const useProductInventory = (productId: string) => {
    return useQuery<InventoryItem[]>({
      queryKey: ['inventory', 'product', productId],
      queryFn: async () => {
        const { data } = await axiosInstance.get(`/inventory/product/${productId}`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        return data.data;
      },
      enabled: !!productId,
    });
  };

  // Add or update inventory item
  const addOrUpdateItem = useMutation({
    mutationFn: async (itemData: {
      productId: string;
      warehouseId: string;
      quantity: number;
      reorderLevel?: number;
    }) => {
      const { data } = await axiosInstance.post(
        `/inventory`,
        itemData,
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'warehouse', variables.warehouseId] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'product', variables.productId] });
    },
  });

  // Update inventory quantity
  const updateQuantity = useMutation({
    mutationFn: async (params: { id: string; quantity: number }) => {
      const { data } = await axiosInstance.patch(
        `/inventory/${params.id}/quantity`,
        { quantity: params.quantity },
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  // Delete inventory item
  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/inventory/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  // Stock Movements
  const useStockMovements = (params?: {
    warehouseId?: string;
    type?: StockMovementType;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    return useQuery<{
      data: StockMovement[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>({
      queryKey: ['stock-movements', params],
      queryFn: async () => {
        const { data: response } = await axiosInstance.get(`/inventory/movements`, {
          params,
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });

        return {
          data: response.data.data as StockMovement[],
          pagination: response.data.pagination,
        };
      },
      enabled: !!params,
    });
  };

  const createStockMovement = useMutation({
    mutationFn: async (movementData: {
      productId: string;
      type: StockMovementType;
      quantity: number;
      fromWarehouseId?: string;
      toWarehouseId?: string;
      reference?: string;
      notes?: string;
    }) => {
      const { data } = await axiosInstance.post(
        `/inventory/movements`,
        movementData,
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  // Stock Opname
  const useStockOpnames = (params?: {
    warehouseId?: string;
    status?: StockOpnameStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    return useQuery<{ data: StockOpname[]; total: number }>({
      queryKey: ['stock-opnames', params],
      queryFn: async () => {
        const { data } = await axiosInstance.get(`/inventory/opnames`, {
          params,
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        return data.data;
      },
      enabled: !!params,
    });
  };

  const createStockOpname = useMutation({
    mutationFn: async (opnameData: {
      warehouseId: string;
      notes?: string;
      items: Array<{
        productId: string;
        actualQuantity: number;
        notes?: string;
      }>;
    }) => {
      const { data } = await axiosInstance.post(
        `/inventory/opnames`,
        opnameData,
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-opnames'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const updateStockOpnameStatus = useMutation({
    mutationFn: async (params: { id: string; status: StockOpnameStatus }) => {
      const { data } = await axiosInstance.patch(
        `/inventory/opnames/${params.id}/status`,
        { status: params.status },
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-opnames'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  return {
    // Inventory
    useWarehouseInventory,
    useWarehousesInventory,
    useProductInventory,
    addOrUpdateItem,
    updateQuantity,
    deleteItem,
    
    // Stock Movements
    useStockMovements,
    createStockMovement,
    
    // Stock Opname
    useStockOpnames,
    createStockOpname,
    updateStockOpnameStatus,
  };
};