import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { productsApi } from "@/api/products.api";
import { ProductForm } from "@/components/products/ProductForm";
import { Separator } from "@/components/ui/separator";

export default function ProductCreateEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: initialData, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getProduct(id!),
    enabled: isEdit,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => 
      isEdit ? productsApi.updateProduct(id!, data) : productsApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/products");
    },
  });

  if (isEdit && isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {isEdit ? "Edit Product" : "Create Product"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isEdit ? "Update product details and variations." : "Add a new product to your catalog."}
            </p>
          </div>
        </div>
        <Separator />
        <ProductForm 
          initialData={initialData} 
          onSubmit={async (data) => {
            await mutation.mutateAsync(data);
          }} 
        />
      </div>
    </div>
  );
}
