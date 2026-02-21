import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import {
  BoxSelectIcon,
  ExternalLinkIcon,
  TextSelectIcon,
} from 'lucide-react-native'
import { useProductContext } from '../product.context'

export function SelectVariantButton() {
  const { isCartMode, variant, handleSelectVariantPress } = useProductContext()

  return (
    <Button
      variant="ghost"
      className="min-h-16 border border-border/50"
      onPress={handleSelectVariantPress}
      disabled={isCartMode}
    >
      <Icon
        className="text-muted-foreground"
        as={variant ? TextSelectIcon : BoxSelectIcon}
      />
      {variant ? (
        <Text className="ml-2">Ver todas as variantes</Text>
      ) : (
        <Text className="ml-2">Selecionar uma variante</Text>
      )}
      <Icon className="ml-auto text-muted-foreground" as={ExternalLinkIcon} />
    </Button>
  )
}
