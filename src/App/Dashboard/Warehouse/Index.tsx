// src/App/Dashboard/Warehouse/Index.tsx
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WarehouseTable } from "@/components/warehouse-table"
import { WarehouseForm } from "@/components/warehouse-form"
import { useWarehouses, type Warehouse } from "@/hooks/use-warehouse"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export default function WarehousePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentWarehouse, setCurrentWarehouse] = useState<Warehouse | null>(null)
  
  const { 
    data: warehouses = [], 
    isLoading,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse
  } = useWarehouses()

  const handleAddWarehouse = () => {
    setCurrentWarehouse(null)
    setIsDialogOpen(true)
  }

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setCurrentWarehouse(warehouse)
    setIsDialogOpen(true)
  }

  const handleDeleteWarehouse = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      await deleteWarehouse(id)
    }
  }

  const handleSubmit = async (values: any) => {
    if (currentWarehouse) {
      await updateWarehouse({ id: currentWarehouse.id, ...values })
    } else {
      await createWarehouse(values)
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Warehouse Management</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your warehouses and their details
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <WarehouseTable 
            data={warehouses} 
            onAdd={handleAddWarehouse}
            onEdit={handleEditWarehouse}
            onDelete={handleDeleteWarehouse}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {currentWarehouse ? 'Edit warehouse details' : 'Add a new warehouse'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <WarehouseForm
              warehouse={currentWarehouse || undefined}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isLoading={isLoading}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}