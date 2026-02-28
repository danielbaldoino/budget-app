import * as React from 'react'
import { useCheckoutViewModel } from './checkout.view-model'

type CheckoutContextType = ReturnType<typeof useCheckoutViewModel>

const CheckoutContext = React.createContext<CheckoutContextType | undefined>(
  undefined,
)

export function useCheckoutContext(): CheckoutContextType {
  const context = React.useContext(CheckoutContext)

  if (context === undefined) {
    throw new Error('useCheckoutContext must be used within a CheckoutProvider')
  }

  return context
}

export function CheckoutProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const viewModel = useCheckoutViewModel()

  const contextValue: CheckoutContextType = { ...viewModel }

  return (
    <CheckoutContext.Provider value={contextValue}>
      {children}
    </CheckoutContext.Provider>
  )
}
