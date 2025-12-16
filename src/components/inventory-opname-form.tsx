// src/components/inventory/opname-form.tsx
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
import { Product, useProducts } from "@/hooks/use-product"
import { useInventory } from "@/hooks/use-inventory"
import { useState } from "react"

const opnameItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  systemQuantity: z.number(),
  physicalQuantity: z.number().min(0, "Quantity cannot be negative"),
  notes: z.string().optional(),
})

const opnameFormSchema = z.object({
  warehouseId: z.string().min(1, "Warehouse is required"),
  notes: z.string().optional(),
  items: z.array(opnameItemSchema).min(1, "At least one item is required"),
})

type OpnameFormValues = z.infer<typeof opnameFormSchema>

interface OpnameFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function OpnameForm({ onSuccess, onCancel }: OpnameFormProps) {
  const { data: warehouses = [] } = useWarehouses()
  const { products: productsData = [] } = useProducts()
  const [selectedProduct, setSelectedProduct] = useState("")

  const form = useForm<OpnameFormValues>({
    resolver: zodResolver(opnameFormSchema),
    defaultValues: {
      items: [],
    },
  })

  const warehouseId = form.watch("warehouseId")
  const items = form.watch("items")

  const { createStockOpname } = useInventory()
  
  const onSubmit = async (values: OpnameFormValues) => {
    try {
      await createStockOpname.mutateAsync({
        warehouseId: values.warehouseId,
        notes: values.notes,
        items: values.items.map(item => ({
          productId: item.productId,
          actualQuantity: item.physicalQuantity,
          notes: item.notes,
        })),
      })
      
      toast.success("Stock opname recorded successfully")
      onSuccess?.()
    } catch (error) {
      console.error("Error recording stock opname:", error)
      toast.error(error instanceof Error ? error.message : "Failed to record stock opname")
    }
  }

  const handleAddItem = () => {
    if (!selectedProduct) return

    const product = productsData.find((p: Product) => p.id === selectedProduct)
    if (!product) return

    const existingItemIndex = items.findIndex(
      (item) => item.productId === selectedProduct
    )

    if (existingItemIndex >= 0) {
      // Item already exists, don't add again
      return
    }

    const currentItems = form.getValues("items")
    form.setValue("items", [
      ...currentItems,
      {
        productId: selectedProduct,
        systemQuantity: 0, // TODO: Fetch current system quantity
        physicalQuantity: 0,
        notes: "",
      },
    ])

    setSelectedProduct("")
  }

  const removeItem = (index: number) => {
    const currentItems = [...items]
    currentItems.splice(index, 1)
    form.setValue("items", currentItems)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <div className="space-y-2">
          <div className="flex gap-2">
            <Select
              value={selectedProduct}
              onValueChange={setSelectedProduct}
              disabled={!warehouseId}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {productsData
                  .filter(
                    (product: Product) =>
                      !items.some((item) => item.productId === product.id)
                  )
                  .map((product: Product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={handleAddItem}
              disabled={!selectedProduct}
            >
              Add
            </Button>
          </div>

          {items.length > 0 && (
            <div className="border rounded-md p-4 space-y-4">
              {items.map((item, index) => {
                const product = productsData.find((p: Product) => p.id === item.productId)
                return (
                  <div
                    key={item.productId}
                    className="grid grid-cols-12 gap-4 items-center"
                  >
                    <div className="col-span-4">
                      <p className="font-medium">
                        {product?.name} ({product?.sku})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        System: {item.systemQuantity}
                      </p>
                    </div>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.physicalQuantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Physical Count</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.notes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Input placeholder="Notes..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

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
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || items.length === 0}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Complete Stock Opname
          </Button>
        </div>
      </form>
    </Form>
  )
}