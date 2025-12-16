// src/App/Dashboard/Inventory/Index.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryTable } from "@/components/inventory-table"
import { useInventory } from "@/hooks/use-inventory"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MovementForm } from "@/components/inventory-movement-form"
import { TransferForm } from "@/components/inventory-transfer-form"
import { OpnameForm } from "@/components/inventory-opname-form"
import { useWarehouses } from "@/hooks/use-warehouse"
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("movement")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { 
    data: warehouses = [], 
    // isLoading: isLoadingWarehouse,
    // createWarehouse,
    // updateWarehouse,
    // deleteWarehouse
  } = useWarehouses()
  const { useWarehouseInventory } = useInventory()
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(() => {
    return warehouses.length > 0 ? warehouses[0].id : '';
  });
  const { data: inventories = [], isLoading } = useWarehouseInventory(selectedWarehouseId)

  const handleSuccess = () => {
    setIsDialogOpen(false)
    // TODO: Invalidate queries to refresh data
  }

  return (
    <div className="container mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-bold">Inventory</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Inventory Management</CardTitle>
            <p className="text-sm text-muted-foreground" aria-label="Manage your inventory movements and stock levels">
              Manage your inventory movements and stock levels
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>New Transaction</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>New Inventory Transaction</DialogTitle>
                <CardDescription className="sr-only">
                New Inventory Transaction
              </CardDescription>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="movement">Movement</TabsTrigger>
                  <TabsTrigger value="transfer">Transfer</TabsTrigger>
                  <TabsTrigger value="opname">Stock Opname</TabsTrigger>
                </TabsList>
                <TabsContent value="movement" className="mt-4">
                  <MovementForm onSuccess={handleSuccess} onCancel={() => setIsDialogOpen(false)} />
                </TabsContent>
                <TabsContent value="transfer" className="mt-4">
                  <TransferForm onSuccess={handleSuccess} onCancel={() => setIsDialogOpen(false)} />
                </TabsContent>
                <TabsContent value="opname" className="mt-4">
                  <OpnameForm onSuccess={handleSuccess} onCancel={() => setIsDialogOpen(false)} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select
              value={selectedWarehouseId}
              onValueChange={setSelectedWarehouseId}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Select a warehouse</SelectItem>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <InventoryTable 
            data={inventories} 
            isLoading={isLoading}
            onAddItem={() => setActiveTab("movement")}
          />
        </CardContent>
      </Card>
    </div>
  )
}