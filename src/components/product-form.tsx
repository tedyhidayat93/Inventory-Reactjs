import { useForm } from "react-hook-form"
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
import { Product } from "@/hooks/use-product"
import { Loader2 } from "lucide-react"

type ProductFormValues = {
  name: string
  sku: string
  price: number
}

interface ProductFormProps {
  product?: Product
  onSubmit: (values: ProductFormValues) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading,
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      price: product?.price ?? 0,
    },
    mode: "onSubmit",
  })

  return (
    <Form<ProductFormValues> {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        {/* NAME */}
        <FormField
          control={form.control}
          name="name"
          rules={{
            required: "Name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* SKU */}
          <FormField
            control={form.control}
            name="sku"
            rules={{
              required: "SKU is required",
              minLength: {
                value: 3,
                message: "SKU must be at least 3 characters",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="Enter SKU" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PRICE */}
          <FormField
            control={form.control}
            name="price"
            rules={{
              required: "Price is required",
              min: {
                value: 0,
                message: "Price must be a positive number",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (IDR)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter price"
                    value={field.value ? new Intl.NumberFormat('id-ID').format(Number(field.value)) : ''}
                    onChange={(e) => {
                      // Remove all non-digit characters
                      const value = e.target.value.replace(/\D/g, '');
                      // Convert to number or 0 if empty
                      field.onChange(value === '' ? 0 : Number(value));
                    }}
                    onBlur={() => {
                      // Format the number when input loses focus
                      if (field.value) {
                        field.onChange(Number(field.value));
                      }
                    }}
                    className="text-left [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {product ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
