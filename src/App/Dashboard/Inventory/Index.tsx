import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryTable } from "@/components/inventory-table"
import { useInventory } from "@/hooks/use-inventory"
import { useState } from "react"

export default function InventoryPage() {
  // TODO: Replace with actual warehouse selection logic
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('default-warehouse-id')
  const { useWarehouseInventory } = useInventory()
  const { data: inventories = [], isLoading } = useWarehouseInventory(selectedWarehouseId)

  const handleAddItem = () => {
    // TODO: Implement add item functionality
    console.log('Add item clicked')
  }

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Add warehouse selection dropdown */}
          <InventoryTable 
            data={inventories} 
            isLoading={isLoading}
            onAddItem={handleAddItem}
          />
        </CardContent>
      </Card>
    </div>
  )
}