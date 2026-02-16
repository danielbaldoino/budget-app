import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { router } from 'expo-router'
import { PencilRulerIcon } from 'lucide-react-native'
import { useProductContext } from '../product.context'

export function SelectVariantButton() {
  const { product } = useProductContext()

  const handlePress = () =>
    router.push({
      pathname: 'products/[productId]/select-variant',
      params: { productId: product?.id },
    })

  return (
    <Button
      variant="ghost"
      className="min-h-16 border-2 border-muted"
      onPress={handlePress}
    >
      <Icon as={PencilRulerIcon} />
      <Text>Selecionar uma variante</Text>
    </Button>
  )
}
