// src/components/inventory/transfer-form.tsx
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
import { useInventory } from "@/hooks/use-inventory"

const transferFormSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  fromWarehouseId: z.string().min(1, "Source warehouse is required"),
  toWarehouseId: z.string().min(1, "Destination warehouse is required"),
  reference: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => data.fromWarehouseId !== data.toWarehouseId, {
  message: "Source and destination warehouses must be different",
  path: ["toWarehouseId"],
})

type TransferFormValues = z.infer<typeof transferFormSchema>

interface TransferFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function TransferForm({ onSuccess, onCancel }: TransferFormProps) {
  const { data: warehouses = [] } = useWarehouses()
  const { products = [] } = useProducts()
  const { createStockMovement } = useInventory()

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      quantity: 0,
    },
  })

  const fromWarehouseId = form.watch("fromWarehouseId")

  const onSubmit = async (values: TransferFormValues) => {
    try {
      await createStockMovement.mutateAsync({
        productId: values.productId,
        type: 'TRANSFER',
        quantity: values.quantity,
        fromWarehouseId: values.fromWarehouseId,
        toWarehouseId: values.toWarehouseId,
        reference: values.reference,
        notes: values.notes,
      })
      
      toast.success("Stock transfer initiated successfully")
      onSuccess?.()
    } catch (error) {
      console.error("Error initiating transfer:", error)
      toast.error(error instanceof Error ? error.message : "Failed to initiate stock transfer")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fromWarehouseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From Warehouse</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source warehouse" />
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
            name="toWarehouseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To Warehouse</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={!fromWarehouseId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination warehouse" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {warehouses
                      .filter(warehouse => warehouse.id !== fromWarehouseId)
                      .map((warehouse) => (
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
        </div>

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
                <Input placeholder="e.g., TRF-001" {...field} />
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
            Transfer Stock
          </Button>
        </div>
      </form>
    </Form>
  )
}