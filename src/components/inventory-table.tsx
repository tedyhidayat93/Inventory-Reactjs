// src/components/inventory-table.tsx
import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { formatRupiah } from "@/lib/utils"
import { InventoryItem } from "@/hooks/use-inventory"

export interface InventoryResponse {
  success: boolean
  data: InventoryItem[]
  message: string
}
export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "warehouseName",
    header: "Warehouse",
  },
  {
    accessorKey: "productSku",
    header: "SKU",
  },
  {
    accessorKey: "productName",
    header: "Product",
  },
  {
    accessorKey: "productUnitPrice",
    header: "Unit Price",
    cell: ({ row }) => formatRupiah(row.original.productUnitPrice).toLocaleString(),
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "totalPrice",
    header: "Total",
    cell: ({ row }) => formatRupiah(row.original.totalPrice).toLocaleString(),
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => new Date(row.original.lastUpdated).toLocaleString(),
  }
]

interface InventoryTableProps {
  data: InventoryItem[]
  isLoading: boolean
  onAddItem?: () => void
}

export function InventoryTable({ data, isLoading, onAddItem }: InventoryTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 w-full bg-muted/50 animate-pulse rounded-md" />
        ))}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter products..."
          value={(table.getColumn("productName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("productName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      {data.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 p-4 bg-green-200/50 rounded-lg">
          <div>
            <h3 className="font-medium">Warehouse: {data[0]?.warehouseName || 'N/A'}</h3>
            <p className="text-sm text-muted-foreground">
              {data.length} products in stock
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Asset Value</p>
            <p className="text-xl font-semibold">
              {formatRupiah(
  data.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0)
)}
            </p>
          </div>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}