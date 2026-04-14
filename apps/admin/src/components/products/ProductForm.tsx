import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Plus, Trash } from "lucide-react"
import { ImageUpload } from "../shared/ImageUpload"

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  isPublished: z.boolean(),
  images: z.array(z.string()),
  variants: z.array(z.object({
    sku: z.string().min(1, "SKU is required"),
    stock: z.number().min(0),
    price: z.number().min(0),
    options: z.record(z.string(), z.any()).optional(),
  })).min(1, "At least one variant is required"),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  initialData?: Product
  onSubmit: (data: ProductFormValues) => Promise<void>
}

export function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      slug: initialData.slug,
      description: initialData.description || "",
      isPublished: initialData.isPublished,
      images: [], 
      variants: initialData.variants.map(v => ({
        sku: v.sku,
        stock: v.stock,
        price: v.prices[0]?.amount || 0,
        options: v.options
      }))
    } : {
      name: "",
      slug: "",
      description: "",
      isPublished: false,
      images: [],
      variants: [{ sku: "", stock: 0, price: 0 }]
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants" as const,
  })

  const isPublished = watch("isPublished")
  const images = watch("images")

  const onFormSubmit = async (data: ProductFormValues) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 w-full pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Product name"
                  disabled={isLoading}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="product-slug"
                  disabled={isLoading}
                  {...register("slug")}
                />
                {errors.slug && (
                  <p className="text-xs text-red-500">{errors.slug.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Product description"
                  disabled={isLoading}
                  rows={5}
                  {...register("description")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={images}
                disabled={isLoading}
                onChange={(urls) => setValue("images", urls)}
                onRemove={(url) => setValue("images", images.filter((val) => val !== url))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Product Variants</CardTitle>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => append({ sku: "", stock: 0, price: 0 })}
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Variant
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-end border p-4 rounded-lg relative">
                  <div className="flex-1 space-y-2">
                    <Label>SKU</Label>
                    <Input
                      {...register(`variants.${index}.sku` as const)}
                      placeholder="SKU"
                      disabled={isLoading}
                    />
                    {errors.variants?.[index]?.sku && (
                      <p className="text-xs text-red-500">{errors.variants[index]?.sku?.message}</p>
                    )}
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      {...register(`variants.${index}.price` as const, { valueAsNumber: true })}
                      placeholder="0.00"
                      disabled={isLoading}
                    />
                    {errors.variants?.[index]?.price && (
                      <p className="text-xs text-red-500">{errors.variants[index]?.price?.message}</p>
                    )}
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      {...register(`variants.${index}.stock` as const, { valueAsNumber: true })}
                      placeholder="0"
                      disabled={isLoading}
                    />
                    {errors.variants?.[index]?.stock && (
                      <p className="text-xs text-red-500">{errors.variants[index]?.stock?.message}</p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => remove(index)}
                      disabled={isLoading}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.variants?.message && (
                <p className="text-sm text-red-500">{errors.variants.message}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Published</Label>
                  <p className="text-sm text-muted-foreground">
                    Visible in the store.
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={(checked) => setValue("isPublished", checked)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex items-center gap-4">
            <Button
              disabled={isLoading}
              className="w-full"
              type="submit"
            >
              {initialData ? "Save changes" : "Create product"}
            </Button>
            <Button
              disabled={isLoading}
              variant="outline"
              className="w-full"
              type="button"
              onClick={() => navigate("/products")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
