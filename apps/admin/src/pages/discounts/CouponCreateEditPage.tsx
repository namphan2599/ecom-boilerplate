import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { discountsApi } from "@/api/discounts.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  amount: z.number().min(0, "Amount must be positive"),
  usageLimit: z.number().optional().nullable(),
  isActive: z.boolean(),
  expiresAt: z.string().optional().nullable(),
})

type CouponFormValues = z.infer<typeof couponSchema>

export default function CouponCreateEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const { data: initialData, isLoading } = useQuery({
    queryKey: ["coupon", id],
    queryFn: () => discountsApi.getCoupon(id!),
    enabled: isEdit,
  })

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: initialData || {
      code: "",
      type: "PERCENTAGE" as const,
      amount: 0,
      usageLimit: null,
      isActive: true,
      expiresAt: null,
    },
  })

  // Update form defaults when data is loaded
  if (initialData && !form.getValues("code")) {
    form.reset({
      code: initialData.code,
      type: initialData.type,
      amount: initialData.amount,
      usageLimit: initialData.usageLimit,
      isActive: initialData.isActive,
      expiresAt: initialData.expiresAt,
    })
  }

  const mutation = useMutation({
    mutationFn: (data: CouponFormValues) =>
      isEdit ? discountsApi.updateCoupon(id!, data as any) : discountsApi.createCoupon(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] })
      navigate("/discounts")
    },
  })

  const onFormSubmit = (data: CouponFormValues) => {
    mutation.mutate(data)
  }

  if (isEdit && isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {isEdit ? "Edit Coupon" : "Create Coupon"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isEdit ? "Update promotional code details." : "Add a new discount code for your customers."}
            </p>
          </div>
        </div>
        <Separator />
        
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Display Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input
                    id="code"
                    placeholder="WINTER20"
                    {...form.register("code")}
                    disabled={mutation.isPending}
                  />
                  {form.formState.errors.code && (
                    <p className="text-xs text-red-500">{form.formState.errors.code.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      onValueChange={(val: any) => form.setValue("type", val)}
                      value={form.watch("type")}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Value</Label>
                    <Input
                      id="amount"
                      type="number"
                      {...form.register("amount", { valueAsNumber: true })}
                      disabled={mutation.isPending}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settings & Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit (Leave empty for unlimited)</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    placeholder="∞"
                    {...form.register("usageLimit", { valueAsNumber: true })}
                    disabled={mutation.isPending}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    {...form.register("expiresAt")}
                    disabled={mutation.isPending}
                  />
                </div>

                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Active Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Only active coupons can be applied at checkout.
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("isActive")}
                    onCheckedChange={(checked) => form.setValue("isActive", checked)}
                    disabled={mutation.isPending}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-4">
            <Button disabled={mutation.isPending} type="submit">
              {isEdit ? "Save Changes" : "Create Coupon"}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate("/discounts")}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
