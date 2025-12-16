// src/components/warehouse-table.tsx
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Warehouse } from "@/hooks/use-warehouse"
import { Skeleton } from "@/components/ui/skeleton"

export const columns: ColumnDef<Warehouse>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row }) => row.getValue("capacity").toLocaleString(),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const warehouse = row.original
      const meta = table.options.meta as {
        onEdit?: (warehouse: Warehouse) => void
        onDelete?: (id: string) => void
      } | undefined

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => meta?.onEdit?.(warehouse)}
                className="cursor-pointer"
              >
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this warehouse?')) {
                    meta?.onDelete?.(warehouse.id)
                  }
                }}
                className="cursor-pointer text-red-600 hover:text-red-600"
              >
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

interface WarehouseTableProps {
  data: Warehouse[]
  onEdit: (warehouse: Warehouse) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

export function WarehouseTable({ data, onEdit, onDelete, isLoading }: WarehouseTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="w-full">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th
                key={column.id || String(column.accessorKey)}
                className="text-left py-3 px-4 font-medium"
              >
                {String(column.header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((warehouse) => (
            <tr key={warehouse.id} className="border-b hover:bg-muted/50">
              {columns.map((column) => (
                <td key={column.id || String(column.accessorKey)} className="py-3 px-4">
                  {column.cell
                    ? column.cell({
                        row: { original: warehouse, getValue: (key: string) => warehouse[key as keyof Warehouse] },
                        table: { options: { meta: { onEdit, onDelete } } }
                      } as any)
                    : String(warehouse[column.accessorKey as keyof Warehouse] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}