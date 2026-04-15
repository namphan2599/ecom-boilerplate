import { useQuery } from "@tanstack/react-query"
import { productsApi } from "@/api/products.api"
import { DataTable } from "@/components/shared/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import type { Product } from "@/types"
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
import { cn } from "@/lib/utils"

export default function ProductsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getProducts({ limit: 100 }),
  })


  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey:'categoryId'
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isPublished") ? "default" : "secondary"}>
          {row.getValue("isPublished") ? "Published" : "Draft"}
        </Badge>
      ),
    },
    //display variants product
    {
      accessorKey: "variants",
      header: "Variants",
      cell: ({ row }) => {
        const variants = row.getValue("variants") as any[]
        return (
          <div className="flex flex-col space-y-1">
            {variants.map((variant) => (
              <div key={variant.sku} className="text-sm text-muted-foreground">
                {variant.sku} - ${variant.prices[0]?.amount || "N/A"}
              </div>
            ))}
          </div>
        )
      }
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const dateStr = row.getValue("createdAt") as string
        const date = new Date(dateStr)
        return <div>{isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString()}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original

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
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(product.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link
                    to={`/products/${product.slug}`}
                    className="flex w-full items-center"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Product
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Product
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
            <h2 className="text-3xl font-bold tracking-tight">Products</h2>
            <p className="text-sm text-muted-foreground">
              Manage your product catalog and variants.
            </p>
          </div>
          <Link 
            to="/products/new" 
            className={cn(buttonVariants(), "flex items-center")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </div>
        <div className="mt-4">
          <DataTable 
            columns={columns} 
            data={data?.items || []} 
            searchKey="name" 
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
