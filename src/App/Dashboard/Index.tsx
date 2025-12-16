import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWarehouses } from "@/hooks/use-warehouse"
import { useInventory } from "@/hooks/use-inventory"
import { formatRupiah } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import axios, { AxiosResponse } from 'axios'
import { useMemo } from "react"
import { Button } from "@/components/ui/button"

// Define types
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
}

interface Warehouse {
  id: string;
  name: string;
}

interface InventoryItem {
  id: string;
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: Warehouse;
  quantity: number;
  reorderLevel?: number;
  createdAt: string;
  updatedAt: string;
}

interface WarehouseStock {
  warehouse: string;
  totalItems: number;
  totalValue: number;
}

// Define types for the transaction history
interface Transaction {
  id: string
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT'
  productName: string
  quantity: number
  fromWarehouse?: string
  toWarehouse?: string
  timestamp: string
  value: number
}

export default function DashboardPage() {
  // const { warehouses, isLoading: isLoadingWarehouses } = useWarehouses();
  // const { useProductInventory } = useInventory();
  // // Get all products first
  // const { data: products = [] } = useQuery<Product[]>({
  //   queryKey: ['products'],
  //   queryFn: async () => {
  //     const { data } = await axios.get<{ data: Product[] }>(
  //       `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/products`,
  //       {
  //         headers: { 
  //           Authorization: `Bearer ${localStorage.getItem('token') || ''}` 
  //         }
  //       }
  //     );
  //     return data.data;
  //   }
  // });
  // // For each product, get its inventory
  // const productInventories = products.map(product => {
  //   const { data: inventory = [] } = useProductInventory(product.id);
  //   return inventory;
  // });
  // // Flatten all inventory items
  // const allInventory = useMemo(() => 
  //   productInventories.flat(), 
  //   [productInventories]
  // );
  
  // // Calculate total stock value
  // const totalStockValue = inventory.reduce((sum: number, item: InventoryItem) => {
  //   return sum + (item.quantity * (item.product?.price || 0));
  // }, 0);

  // // Calculate stock per warehouse
  // const warehouseStock: WarehouseStock[] = warehouses.map((warehouse) => {
  //   const warehouseInventory = inventory.filter(
  //     (item: InventoryItem) => item.warehouseId === warehouse.id
  //   );
  //   const totalItems = warehouseInventory.reduce(
  //     (sum: number, item: InventoryItem) => sum + item.quantity, 
  //     0
  //   );
  //   const totalValue = warehouseInventory.reduce(
  //     (sum: number, item: InventoryItem) => 
  //       sum + (item.quantity * (item.product?.price || 0)), 
  //     0
  //   );
    
  //   return {
  //     warehouse: warehouse.name,
  //     totalItems,
  //     totalValue
  //   };
  // });

  // // Mock transaction history (replace with real data from your API)
  // const transactionHistory: Transaction[] = [
  //   // This would come from your API
  //   {
  //     id: '1',
  //     type: 'IN',
  //     productName: 'Product A',
  //     quantity: 10,
  //     toWarehouse: 'Gudang Utama',
  //     timestamp: '2025-12-16T10:30:00',
  //     value: 1500000
  //   },
  //   // Add more transactions...
  // ]

  // if (isLoadingWarehouses || isLoadingInventory) {
  //   return <div>Loading dashboard data...</div>
  // }

  return (
    <div className="container mx-auto space-y-6">
      <Button>Button</Button>
      {/* Stock Summary Cards */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai Aset</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalStockValue)}</div>
            <p className="text-xs text-muted-foreground">Total nilai aset seluruh gudang</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gudang</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
              <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
              <path d="M12 3v6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warehouses.length}</div>
            <p className="text-xs text-muted-foreground">Total gudang aktif</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(inventory.map(item => item.productId)).size}
            </div>
            <p className="text-xs text-muted-foreground">Jenis produk berbeda</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total item di semua gudang</p>
          </CardContent>
        </Card>
      </div> */}

      {/* Warehouse Stock Overview */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Stok per Gudang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {warehouseStock.map((warehouse) => (
              <div key={warehouse.warehouse} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{warehouse.warehouse}</span>
                  <span className="text-sm text-muted-foreground">
                    {warehouse.totalItems} item • {formatRupiah(warehouse.totalValue)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div 
                    className="h-full bg-primary"
                    style={{
                      width: `${(warehouse.totalValue / totalStockValue) * 100}%`,
                      maxWidth: '100%'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}

      {/* Transaction History */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Tipe</th>
                  <th className="text-left p-2">Produk</th>
                  <th className="text-right p-2">Qty</th>
                  <th className="text-left p-2">Dari</th>
                  <th className="text-left p-2">Ke</th>
                  <th className="text-right p-2">Nilai</th>
                  <th className="text-right p-2">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {transactionHistory.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === 'IN' ? 'bg-green-100 text-green-800' :
                        tx.type === 'OUT' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {tx.type === 'IN' ? 'Masuk' : tx.type === 'OUT' ? 'Keluar' : 'Transfer'}
                      </span>
                    </td>
                    <td className="p-2">{tx.productName}</td>
                    <td className="p-2 text-right">{tx.quantity}</td>
                    <td className="p-2">{tx.fromWarehouse || '-'}</td>
                    <td className="p-2">{tx.toWarehouse || '-'}</td>
                    <td className="p-2 text-right">{formatRupiah(tx.value)}</td>
                    <td className="p-2 text-right">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}