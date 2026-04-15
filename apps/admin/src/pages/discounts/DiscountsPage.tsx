import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { discountsApi } from "@/api/discounts.api"
import { DataTable } from "@/components/shared/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import type { Coupon } from "@/types"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { MoreHorizontal, Plus, Pencil, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function DiscountsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: () => discountsApi.getCoupons({ limit: 100 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => discountsApi.deleteCoupon(id),
    onSuccess: () => {
      console.log("Coupon deleted successfully")  
      queryClient.invalidateQueries({ queryKey: ["coupons"] })
    },
    onError: (error) => {
      console.error("Failed to delete coupon:", error)
      alert("Failed to delete coupon. Please try again.")
    },
  })

  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <div className="font-bold">{row.getValue("code")}</div>,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue("type")}
        </Badge>
      ),
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => {
        const type = row.original.type
        const amount = row.original.value
        return (
          <div>
            {type === "PERCENTAGE" ? `${amount}%` : `$${amount}`}
          </div>
        )
      },
    },
    {
      accessorKey: "usageCount",
      header: "Usages",
      cell: ({ row }) => {
        const current = row.original.usageCount
        const limit = row.original.usageLimit
        return (
          <div>
            {current} / {limit || "∞"}
          </div>
        )
      },
    },
    {
      accessorKey: "expiresAt",
      header: "Expires",
      cell: ({ row }) => {
        const dateStr = row.getValue("expiresAt") as string
        if (!dateStr) return <div>Never</div>
        const date = new Date(dateStr)
        return <div>{isNaN(date.getTime()) ? "Invalid" : format(date, "MMM d, yyyy")}</div>
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isActive") ? "default" : "destructive"}>
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const coupon = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Link
                    to={`/discounts/${coupon.id}`}
                    className="flex w-full items-center"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => deleteMutation.mutate(coupon.id)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ]

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Discounts</h2>
            <p className="text-sm text-muted-foreground">
              Manage promotional codes and special offers.
            </p>
          </div>
          <Link 
            to="/discounts/new" 
            className={cn(buttonVariants(), "flex items-center")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Coupon
          </Link>
        </div>
        <div className="mt-4">
          <DataTable 
            columns={columns} 
            data={data || []} 
            searchKey="code" 
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
