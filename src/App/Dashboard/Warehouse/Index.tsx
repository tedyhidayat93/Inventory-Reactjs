import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WarehouseTable } from "@/components/warehouse-table";
import { useWarehouses } from "@/hooks/use-warehouse";

export default function WarehousePage() {
  const { warehouses = [], isLoading } = useWarehouses();

  const handleAddWarehouse = () => {
    // TODO: Implement add warehouse functionality
    console.log('Add warehouse clicked');
  };

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Management</CardTitle>
        </CardHeader>
        <CardContent>
          <WarehouseTable 
            data={warehouses} 
            isLoading={isLoading}
            onAddWarehouse={handleAddWarehouse}
          />
        </CardContent>
      </Card>
    </div>
  );
}