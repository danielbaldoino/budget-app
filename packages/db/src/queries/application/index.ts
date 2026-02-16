import { getApiKey } from './api-keys/get-api-key'
import { listApiKeys } from './api-keys/list-api-keys'
import { getCarrier } from './carriers/get-carrier'
import { listCarriers } from './carriers/list-carriers'
import { getCart, getCartWithRelations } from './carts/get-cart'
import {
  getCartItem,
  getCartItemByProductVariantId,
} from './carts/items/get-cart-item'
import { listCartsWithRelations } from './carts/list-carts'
import { getCustomer, getCustomerWithRelations } from './customers/get-customer'
import { listCustomers } from './customers/list-customers'
import { getOrder, getOrderWithRelations } from './orders/get-order'
import { listOrdersWithRelations } from './orders/list-orders'
import { getPaymentMethod } from './payment-methods/get-payment-method'
import { listPaymentMethods } from './payment-methods/list-payment-methods'
import { getPaymentTerm } from './payment-terms/get-payment-term'
import { listPaymentTerms } from './payment-terms/list-payment-terms'
import {
  getPriceList,
  getPriceListByName,
  getPriceListWithRelations,
} from './price-lists/get-price-list'
import { listPriceLists } from './price-lists/list-price-lists'
import {
  getPriceSet,
  getPriceSetByProductVariantId,
} from './price-sets/get-price-set'
import { listPrices } from './price-sets/prices/list-prices'
import {
  getProductCategory,
  getProductCategoryByName,
} from './product-categories/get-product-category'
import { listProductCategories } from './product-categories/list-product-categories'
import { getProductDetail } from './products/details/get-product-detail'
import { getProduct, getProductWithRelations } from './products/get-product'
import {
  listProductsByIds,
  listProductsWithRelations,
} from './products/list-products'
import {
  getProductOption,
  getProductOptionByName,
  getProductOptionWithRelations,
} from './products/options/get-product-option'
import {
  listProductOptionsWithRelations,
  listProductOptionsWithValues,
} from './products/options/list-product-options'
import {
  getProductVariant,
  getProductVariantByName,
  getProductVariantBySku,
  getProductVariantWithRelations,
} from './products/variants/get-product-variant'
import {
  getInventoryItem,
  getInventoryWithRelations,
} from './products/variants/inventory-items/get-inventory-item'
import {
  getInventoryLevel,
  getInventoryLevelByLocation,
  getInventoryLevelWithRelations,
} from './products/variants/inventory-items/inventory-levels/get-inventory-level'
import { listInventoryLevelsWithRelations } from './products/variants/inventory-items/inventory-levels/list-inventory-levels'
import { listInventoryItemsWithRelations } from './products/variants/inventory-items/list-list-inventory-items'
import {
  listProductVariantsWithOptions,
  listProductVariantsWithRelations,
} from './products/variants/list-product-variants'
import { getSeller, getSellerWithRelations } from './sellers/get-seller'
import { listSellers } from './sellers/list-sellers'
import {
  getStockLocation,
  getStockLocationByName,
  getStockLocationWithRelations,
} from './stock-locations/get-stock-location'
import { listStockLocations } from './stock-locations/list-stock-locations'
import {
  getUser,
  getUserByUsername,
  getUserWithRelations,
} from './users/get-user'
import { listUsersWithRelations } from './users/list-users'

export const applicationQueries = {
  apiKeys: {
    listApiKeys,
    getApiKey,
  },
  users: {
    listUsersWithRelations,
    getUser,
    getUserWithRelations,
    getUserByUsername,
  },
  customers: {
    listCustomers,
    getCustomer,
    getCustomerWithRelations,
  },
  productCategories: {
    listProductCategories,
    getProductCategory,
    getProductCategoryByName,
  },
  products: {
    listProductsWithRelations,
    listProductsByIds,
    getProduct,
    getProductWithRelations,
    details: {
      getProductDetail,
    },
    options: {
      listProductOptionsWithRelations,
      listProductOptionsWithValues,
      getProductOption,
      getProductOptionByName,
      getProductOptionWithRelations,
    },
    variants: {
      listProductVariantsWithRelations,
      listProductVariantsWithOptions,
      getProductVariant,
      getProductVariantByName,
      getProductVariantBySku,
      getProductVariantWithRelations,
      inventoryItems: {
        listInventoryItemsWithRelations,
        getInventoryItem,
        getInventoryWithRelations,
        inventoryLevels: {
          listInventoryLevelsWithRelations,
          getInventoryLevel,
          getInventoryLevelByLocation,
          getInventoryLevelWithRelations,
        },
      },
    },
  },
  priceLists: {
    listPriceLists,
    getPriceList,
    getPriceListByName,
    getPriceListWithRelations,
  },
  priceSets: {
    getPriceSet,
    getPriceSetByProductVariantId,
    prices: {
      listPrices,
    },
  },
  stockLocations: {
    listStockLocations,
    getStockLocation,
    getStockLocationByName,
    getStockLocationWithRelations,
  },
  carts: {
    listCartsWithRelations,
    getCart,
    getCartWithRelations,
    items: {
      getCartItem,
      getCartItemByProductVariantId,
    },
  },
  orders: {
    listOrdersWithRelations,
    getOrder,
    getOrderWithRelations,
  },
  sellers: {
    listSellers,
    getSeller,
    getSellerWithRelations,
  },
  carriers: {
    listCarriers,
    getCarrier,
  },
  paymentMethods: {
    listPaymentMethods,
    getPaymentMethod,
  },
  paymentTerms: {
    listPaymentTerms,
    getPaymentTerm,
  },
}
