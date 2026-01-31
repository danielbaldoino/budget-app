import { jwtAuthenticator } from '@/http/middlewares/application/jwt-authenticator'
import { tenantContext } from '@/http/middlewares/application/tenant-context'
import type { FastifyTypedInstance } from '@/types/fastify'
import { logIn } from './auth/login'
import { listCustomers } from './customers/list-customers'
import { integrationsRoutes } from './integrations'
import { listInventoryItems } from './inventory-items/list-inventory-items'
import { getPriceList } from './price-lists/get-price-list'
import { listPriceLists } from './price-lists/list-price-lists'
import { createProductCategory } from './product-categories/create-product-category'
import { deleteProductCategory } from './product-categories/delete-product-category'
import { getProductCategory } from './product-categories/get-product-category'
import { listProductCategories } from './product-categories/list-product-categories'
import { updateProductCategory } from './product-categories/update-product-category'
import { createProduct } from './products/create-product'
import { deleteProduct } from './products/delete-product'
import { getProduct } from './products/get-product'
import { listProducts } from './products/list-products'
import { createProductOption } from './products/options/create-product-option'
import { deleteProductOption } from './products/options/delete-product-option'
import { getProductOption } from './products/options/get-product-option'
import { listProductOptions } from './products/options/list-product-options'
import { updateProductOption } from './products/options/update-product-option'
import { updateProduct } from './products/update-product'
import { createProductVariant } from './products/variants/create-product-variant'
import { deleteProductVariant } from './products/variants/delete-product-variant'
import { getProductVariant } from './products/variants/get-product-variant'
import { createInventoryItem } from './products/variants/inventory-items/create-inventory-item'
import { deleteInventoryItem } from './products/variants/inventory-items/delete-inventory-item'
import { getInventoryItem } from './products/variants/inventory-items/get-inventory-item'
import { createInventoryLevel } from './products/variants/inventory-items/inventory-levels/create-inventory-level'
import { deleteInventoryLevel } from './products/variants/inventory-items/inventory-levels/delete-inventory-level'
import { getInventoryLevel } from './products/variants/inventory-items/inventory-levels/get-inventory-level'
import { listInventoryLevels } from './products/variants/inventory-items/inventory-levels/list-inventory-levels'
import { updateInventoryLevel } from './products/variants/inventory-items/inventory-levels/update-inventory-level'
import { listProductVariants } from './products/variants/list-product-variants'
import { updateProductVariant } from './products/variants/update-product-variant'
import { getProfile } from './profile/get-profile'
import { createStockLocation } from './stock-locations/create-stock-location'
import { deleteStockLocation } from './stock-locations/delete-stock-location'
import { getStockLocation } from './stock-locations/get-stock-location'
import { listStockLocations } from './stock-locations/list-stock-locations'
import { updateStockLocation } from './stock-locations/update-stock-location'

async function applicationRoutes(app: FastifyTypedInstance) {
  app.register(jwtAuthenticator) // Apply JWT authentication middleware

  app.register(getProfile)

  app.register(listCustomers)

  app.register(listProductCategories)
  app.register(getProductCategory)
  app.register(createProductCategory)
  app.register(updateProductCategory)
  app.register(deleteProductCategory)

  app.register(listProducts)
  app.register(getProduct)
  app.register(createProduct)
  app.register(updateProduct)
  app.register(deleteProduct)

  app.register(listProductOptions)
  app.register(getProductOption)
  app.register(createProductOption)
  app.register(updateProductOption)
  app.register(deleteProductOption)

  app.register(listProductVariants)
  app.register(getProductVariant)
  app.register(createProductVariant)
  app.register(updateProductVariant)
  app.register(deleteProductVariant)

  app.register(listInventoryItems)
  app.register(getInventoryItem)
  app.register(createInventoryItem)
  app.register(deleteInventoryItem)

  app.register(listInventoryLevels)
  app.register(getInventoryLevel)
  app.register(createInventoryLevel)
  app.register(updateInventoryLevel)
  app.register(deleteInventoryLevel)

  app.register(listPriceLists)
  app.register(getPriceList)

  app.register(listStockLocations)
  app.register(getStockLocation)
  app.register(createStockLocation)
  app.register(updateStockLocation)
  app.register(deleteStockLocation)
}

export async function applicationV1Routes(app: FastifyTypedInstance) {
  app.register(tenantContext) // Apply tenant context middleware

  app.register(integrationsRoutes, { prefix: '/integrations' })

  app.register(logIn, { prefix: '/auth' })

  app.register(applicationRoutes)
}
