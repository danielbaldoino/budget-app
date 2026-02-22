import * as React from 'react'
import { useCartViewModel } from './cart.view-model'

type CartContextType = ReturnType<typeof useCartViewModel>

const CartContext = React.createContext<CartContextType | undefined>(undefined)

export function useCartContext(): CartContextType {
  const context = React.useContext(CartContext)

  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider')
  }

  return context
}

export function CartProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const viewModel = useCartViewModel()

  const contextValue: CartContextType = { ...viewModel }

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  )
}
