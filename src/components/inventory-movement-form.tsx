// src/components/inventory/movement-form.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useWarehouses } from "@/hooks/use-warehouse"
import { useProducts } from "@/hooks/use-product"
import { StockMovementType, useInventory } from "@/hooks/use-inventory"

const movementFormSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

type MovementFormValues = z.infer<typeof movementFormSchema>

interface MovementFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function MovementForm({ onSuccess, onCancel }: MovementFormProps) {
  const { data: warehouses = [] } = useWarehouses()
  const { products = [] } = useProducts()

  const form = useForm<MovementFormValues>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: {
      type: "IN",
      quantity: 0,
    },
  })

  const { createStockMovement } = useInventory()
  
  const onSubmit = async (values: MovementFormValues) => {
    try {
        await createStockMovement.mutateAsync({
            productId: values.productId,
            type: values.type,
            quantity: values.quantity,
            fromWarehouseId: values.warehouseId, // or toWarehouseId for movement in
            reference: values.reference,
            notes: values.notes,
        })
      
      toast.success("Stock movement recorded successfully")
      onSuccess?.()
    } catch (error) {
      console.error("Error recording movement:", error)
      toast.error(error instanceof Error ? error.message : "Failed to record stock movement")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Movement Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select movement type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="IN">Inbound</SelectItem>
                  <SelectItem value="OUT">Outbound</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="warehouseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Warehouse</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a warehouse" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., PO123, SO456" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Additional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Record Movement
          </Button>
        </div>
      </form>
    </Form>
  )
}