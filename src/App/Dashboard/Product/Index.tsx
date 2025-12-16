import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductTable } from "@/components/product-table"
import { ProductForm } from "@/components/product-form"
import { useProducts, type Product } from "@/hooks/use-product"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ProductPage() {
  const { 
    products = [], 
    isLoading, 
    createProduct, 
    updateProduct, 
    deleteProduct 
  } = useProducts()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddProduct = () => {
    setCurrentProduct(null)
    setIsDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product)
    setIsDialogOpen(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId)
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true)
      if (currentProduct) {
        // Update existing product
        await updateProduct.mutateAsync({ ...values, id: currentProduct.id })
      } else {
        // Create new product
        await createProduct.mutateAsync(values)
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-bold">Products</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Product Management</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your products and inventory
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <ProductTable 
            data={products} 
            isLoading={isLoading}
            isProcessing={isSubmitting || deleteProduct.isPending}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              This is a hidden description for screen readers.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ProductForm
              product={currentProduct || undefined}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isLoading={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}