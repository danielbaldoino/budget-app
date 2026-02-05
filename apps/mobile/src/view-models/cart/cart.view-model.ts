import { useGetCart } from '@/hooks/use-cart-queries'

export function useCartViewModel() {
  const { isLoading, cart } = useGetCart()

  return {
    isLoading,
    cart,
  }
}
