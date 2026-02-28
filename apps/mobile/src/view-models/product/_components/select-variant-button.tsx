import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
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
        <Text className="ml-2">
          {i18n.t('product.variants.actions.viewAll')}
        </Text>
      ) : (
        <Text className="ml-2">
          {i18n.t('product.variants.actions.select')}
        </Text>
      )}
      <Icon
        className="ml-auto text-muted-foreground"
        size={ICON_SIZES.smaller}
        as={ExternalLinkIcon}
      />
    </Button>
  )
}
