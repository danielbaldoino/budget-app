import * as React from 'react'
import { useProductViewModel } from './product.view-model'

type ProductContextType = ReturnType<typeof useProductViewModel>

const ProductContext = React.createContext<ProductContextType | undefined>(
  undefined,
)

export function useProductContext(): ProductContextType {
  const context = React.useContext(ProductContext)

  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductProvider')
  }

  return context
}

export function ProductProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const viewModel = useProductViewModel()

  const contextValue: ProductContextType = { ...viewModel }

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  )
}
