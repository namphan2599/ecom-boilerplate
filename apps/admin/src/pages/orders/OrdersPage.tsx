import { useQuery } from "@tanstack/react-query"
import { ordersApi } from "@/api/orders.api"
import { DataTable } from "@/components/shared/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import type { Order } from "@/types"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Eye, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.getOrders({ limit: 100 }),
  })

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }) => <div className="font-bold">{row.getValue("orderNumber")}</div>,
    },
    {
      accessorKey: "customerEmail",
      header: "Customer",
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium">{order.customerName}</span>
            <span className="text-xs text-muted-foreground">{order.customerEmail}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalAmount"))
        return <div>${amount.toFixed(2)}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          PENDING: "secondary",
          PAID: "default",
          SHIPPED: "outline",
          CANCELLED: "destructive",
        }
        return (
          <Badge variant={variants[status] || "outline"}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const dateStr = row.getValue("createdAt") as string
        const date = new Date(dateStr)
        return <div>{isNaN(date.getTime()) ? "Invalid" : format(date, "MMM d, yyyy")}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Link to={`/orders/${order.id}`} className="flex w-full items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Mark as Shipped</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Cancel Order</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
            <p className="text-sm text-muted-foreground">
              Monitor and manage customer orders and fulfillment.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <DataTable 
            columns={columns} 
            data={data?.data || []} 
            searchKey="orderNumber" 
          />
          {isLoading && (
            <div className="flex h-24 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
