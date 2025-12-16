import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWarehouses } from "@/hooks/use-warehouse"
import { useInventory, StockMovement, StockMovementType } from "@/hooks/use-inventory"
import { useProducts } from "@/hooks/use-product"
import { formatRupiah } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DashboardPage() {
  const { products = [] } = useProducts()
  const { data: warehouses = [] } = useWarehouses()
  const warehouseIds = warehouses.map(w => w.id)
  
  const { data: allInventory = [] } = useInventory().useWarehousesInventory(warehouseIds)
  
  // --- Pagination State ---
  const [page, setPage] = useState(1)
  const limit = 10

  const {
    data: movementsData,
    isLoading: isMovementsLoading,
  } = useInventory().useStockMovements({
    page,
    limit,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  })

  const movementHistory: (StockMovement & {
    productName: string;
    fromWarehouseName?: string;
    toWarehouseName?: string;
  })[] = (movementsData?.data || []).map(move => ({
    ...move,
    productName: products.find(p => p.id === move.productId)?.name || 'Unknown Product',
    fromWarehouseName: move.fromWarehouseId ? warehouses.find(w => w.id === move.fromWarehouseId)?.name || 'Unknown' : undefined,
    toWarehouseName: move.toWarehouseId ? warehouses.find(w => w.id === move.toWarehouseId)?.name || 'Unknown' : undefined,
  }))

  const pagination = movementsData?.pagination

  const calculateTotalStockValue = () => {
    return allInventory.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)
      return sum + (item.quantity * (product?.price || 0))
    }, 0)
  }
  const totalStockValue = calculateTotalStockValue()

  const warehouseStock = warehouses.map(warehouse => {
    const warehouseInventory = allInventory.filter(item => item.warehouseId === warehouse.id)
    const totalItems = warehouseInventory.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = warehouseInventory.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)
      return sum + (item.quantity * (product?.price || 0))
    }, 0)
    return { warehouse: warehouse.name, totalItems, totalValue }
  })

  const isLoading = warehouses.length === 0 || allInventory.length === 0 || isMovementsLoading

  // Add these states at the top of your component with other state declarations
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<StockMovementType | 'ALL'>('ALL')
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ 
    from: new Date(new Date().setDate(1)), // First day of current month
    to: new Date() // Today
  })
  // Update the movementHistory filtering
  const filteredMovementHistory = movementHistory.filter(move => {
    // Search by product name
    const matchesSearch = move.productName.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filter by type
    const matchesType = typeFilter === 'ALL' || move.type === typeFilter
    
    // Filter by date range
    const moveDate = new Date(move.createdAt)
    const matchesDateRange = 
      (!dateRange.from || moveDate >= dateRange.from) &&
      (!dateRange.to || moveDate <= new Date(dateRange.to.getTime() + 24 * 60 * 60 * 1000 - 1)) // End of day
    return matchesSearch && matchesType && matchesDateRange
  })

  if (isLoading) return <div className="container mx-auto p-6">Loading dashboard data...</div>

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Stock Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Nilai Aset */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai Aset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalStockValue)}</div>
            <p className="text-xs text-muted-foreground">Total nilai aset seluruh gudang</p>
          </CardContent>
        </Card>

        {/* Total Gudang */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Gudang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warehouses.length}</div>
            <p className="text-xs text-muted-foreground">Total gudang aktif</p>
          </CardContent>
        </Card>

        {/* Total Produk */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(allInventory.map(item => item.productId)).size}</div>
            <p className="text-xs text-muted-foreground">Jenis produk berbeda</p>
          </CardContent>
        </Card>

        {/* Total Stok */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allInventory.reduce((sum, item) => sum + item.quantity, 0)}</div>
            <p className="text-xs text-muted-foreground">Total item di semua gudang</p>
          </CardContent>
        </Card>
      </div>

      {/* Warehouse Stock Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Stok per Gudang</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {warehouseStock.map(ws => (
            <div key={ws.warehouse} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{ws.warehouse}</span>
                <span className="text-sm text-muted-foreground">{ws.totalItems} item • {formatRupiah(ws.totalValue)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, (ws.totalItems / 100) * 100)}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pergerakan Barang </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 mb-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as StockMovementType | 'ALL')}
                className="px-4 py-2 border rounded-md"
              >
                <option value="ALL">Semua Tipe</option>
                <option value="IN">Masuk</option>
                <option value="OUT">Keluar</option>
                <option value="TRANSFER">Transfer</option>
                <option value="ADJUSTMENT">Penyesuaian</option>
                <option value="OPNAME">Stok Opname</option>
              </select>

              {/* Date Range Picker */}
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.from?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value ? new Date(e.target.value) : undefined }))}
                  className="px-4 py-2 border rounded-md"
                />
                <span className="flex items-center">s/d</span>
                <input
                  type="date"
                  value={dateRange.to?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value ? new Date(e.target.value) : undefined }))}
                  className="px-4 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipe</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Dari</TableHead>
                <TableHead>Ke</TableHead>
                <TableHead>Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovementHistory.length > 0 ? filteredMovementHistory.map(move => (
                <TableRow key={move.id}>
                  <TableCell className="font-medium">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      move.type === 'IN' ? 'bg-green-100 text-green-800' :
                      move.type === 'OUT' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'}`}>
                      {move.type}
                    </span>
                  </TableCell>
                  <TableCell>{move.productName}</TableCell>
                  <TableCell>{move.quantity}</TableCell>
                  <TableCell>{move.fromWarehouseName || '-'}</TableCell>
                  <TableCell>{move.toWarehouseName || '-'}</TableCell>
                  <TableCell>{new Date(move.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    Tidak ada data pergerakan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {pagination && (
            <div className="flex justify-between items-center mt-4">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
