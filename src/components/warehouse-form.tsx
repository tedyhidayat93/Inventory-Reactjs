// src/components/warehouse-form.tsx
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
import { Warehouse } from "@/hooks/use-warehouse"
import { Loader2 } from "lucide-react"

type WarehouseFormValues = {
  name: string
  location: string
}

interface WarehouseFormProps {
  warehouse?: Warehouse
  onSubmit: (values: WarehouseFormValues) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export function WarehouseForm({
  warehouse,
  onSubmit,
  onCancel,
  isLoading,
}: WarehouseFormProps) {
  const form = useForm<WarehouseFormValues>({
    defaultValues: {
      name: warehouse?.name ?? "",
      location: warehouse?.location ?? "",
    },
    mode: "onSubmit",
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
              <FormLabel>Warehouse Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter warehouse name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          rules={{
            required: "Location is required",
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter location" {...field} />
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
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {warehouse ? "Update Warehouse" : "Create Warehouse"}
          </Button>
        </div>
      </form>
    </Form>
  )
}