import { relations } from 'drizzle-orm'
import {
  bigint,
  bigserial,
  boolean,
  integer,
  jsonb,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

import { Gender, OrderStatus, ProductStatus } from '../../lib/enums'
import type { AddressType, CurrencyCode, DocumentType } from '../../lib/types'
import { id, metadata, timestamps } from '../../utils'
import { TENANT_MIGRATIONS_SCHEMA } from '../constants'

export function createTenantSchema(schema?: string) {
  const tenantSchema = pgSchema(schema ?? TENANT_MIGRATIONS_SCHEMA)

  const genderEnum = tenantSchema.enum('gender', Gender)

  const productStatusEnum = tenantSchema.enum('product_status', ProductStatus)

  const orderStatusEnum = tenantSchema.enum('order_status', OrderStatus)

  const apiKeys = tenantSchema.table('api_keys', {
    ...id,
    name: text('name').notNull(),
    token: text('token').notNull().unique(),

    ...timestamps,
  })

  const users = tenantSchema.table('users', {
    ...id,
    referenceId: text('reference_id').unique(),

    name: text('name').notNull(),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash'),

    ...metadata,
    ...timestamps,
  })

  const customers = tenantSchema.table('customers', {
    ...id,
    referenceId: text('reference_id').unique(),

    name: text('name').notNull(),
    documentType: text('document_type').$type<DocumentType>(),
    document: text('document'),
    tradeName: text('trade_name'),
    corporateName: text('corporate_name'),
    stateRegistration: text('state_registration'),
    birthDate: timestamp('birth_date', { withTimezone: true }),
    gender: genderEnum('gender'),
    email: text('email'),
    phone: text('phone'),

    ...timestamps,
  })

  const customersRelations = relations(customers, ({ many }) => ({
    addresses: many(addresses),
    orders: many(orders),
  }))

  const addresses = tenantSchema.table('addresses', {
    ...id,
    type: text('type').$type<AddressType>(),
    street: text('street'),
    number: text('number'),
    complement: text('complement'),
    neighborhood: text('neighborhood'),
    city: text('city'),
    state: text('state'),
    country: text('country'),
    zipCode: text('zip_code'),
    reference: text('reference'),

    customerId: text('customer_id').references(() => customers.id, {
      onDelete: 'cascade',
    }),
    stockLocationId: text('stock_location_id').references(
      () => stockLocations.id,
      { onDelete: 'cascade' },
    ),
    orderId: text('order_id').references(() => orders.id, {
      onDelete: 'cascade',
    }),

    ...timestamps,
  })

  const addressesRelations = relations(addresses, ({ one }) => ({
    customer: one(customers, {
      fields: [addresses.customerId],
      references: [customers.id],
    }),
    stockLocation: one(stockLocations, {
      fields: [addresses.stockLocationId],
      references: [stockLocations.id],
    }),
    order: one(orders, {
      fields: [addresses.orderId],
      references: [orders.id],
    }),
  }))

  const productCategories = tenantSchema.table('product_categories', {
    ...id,
    name: text('name').notNull(),
    description: text('description'),

    ...timestamps,
  })

  const productCategoriesRelations = relations(
    productCategories,
    ({ many }) => ({
      products: many(products),
    }),
  )

  const products = tenantSchema.table('products', {
    ...id,
    name: text('name').notNull(),
    subtitle: text('subtitle'),
    description: text('description'),
    status: productStatusEnum('status').notNull().default('active'),
    thumbnailUrl: text('thumbnail_url'),

    categoryId: text('category_id').references(() => productCategories.id),

    ...timestamps,
  })

  const productsRelations = relations(products, ({ one, many }) => ({
    category: one(productCategories, {
      fields: [products.categoryId],
      references: [productCategories.id],
    }),
    detail: one(productDetails),
    images: many(productImages),
    options: many(productOptions),
    variants: many(productVariants),
  }))

  const productImages = tenantSchema.table('product_images', {
    ...id,
    url: text('url').notNull(),
    rank: integer('rank').notNull().default(0),

    productId: text('product_id').references(() => products.id, {
      onDelete: 'cascade',
    }),
    variantId: text('variant_id').references(() => productVariants.id, {
      onDelete: 'cascade',
    }),

    ...timestamps,
  })

  const productImagesRelations = relations(productImages, ({ one }) => ({
    product: one(products, {
      fields: [productImages.productId],
      references: [products.id],
    }),
    variant: one(productVariants, {
      fields: [productImages.variantId],
      references: [productVariants.id],
    }),
  }))

  const productOptions = tenantSchema.table('product_options', {
    ...id,
    name: text('name').notNull(),

    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),

    ...timestamps,
  })

  const productOptionsRelations = relations(
    productOptions,
    ({ one, many }) => ({
      product: one(products, {
        fields: [productOptions.productId],
        references: [products.id],
      }),
      values: many(productOptionValues),
    }),
  )

  const productOptionValues = tenantSchema.table('product_option_values', {
    ...id,
    name: text('name').notNull(),

    optionId: text('option_id')
      .notNull()
      .references(() => productOptions.id, { onDelete: 'cascade' }),

    ...timestamps,
  })

  const productOptionValuesRelations = relations(
    productOptionValues,
    ({ one, many }) => ({
      option: one(productOptions, {
        fields: [productOptionValues.optionId],
        references: [productOptions.id],
      }),
      variants: many(productOptionValuesToProductVariants),
    }),
  )

  const productVariants = tenantSchema.table('product_variants', {
    ...id,
    name: text('name').notNull(),
    sku: text('sku'),
    manageInventory: boolean('manage_inventory').notNull().default(false),
    thumbnail: text('thumbnail'),

    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),

    ...timestamps,
  })

  const productVariantsRelations = relations(
    productVariants,
    ({ one, many }) => ({
      product: one(products, {
        fields: [productVariants.productId],
        references: [products.id],
      }),
      inventoryItem: one(inventoryItems),
      images: many(productImages),
      priceSets: many(priceSets),
      options: many(productOptionValuesToProductVariants),
    }),
  )

  const priceLists = tenantSchema.table('price_lists', {
    ...id,
    name: text('name').notNull(),
    description: text('description'),

    ...timestamps,
  })

  const priceListsRelations = relations(priceLists, ({ many }) => ({
    priceSets: many(priceSets),
  }))

  const priceSets = tenantSchema.table(
    'price_sets',
    {
      ...id,

      priceListId: text('price_list_id').references(() => priceLists.id, {
        onDelete: 'cascade',
      }),
      productVariantId: text('product_variant_id').references(
        () => productVariants.id,
        { onDelete: 'cascade' },
      ),

      ...timestamps,
    },
    (t) => [uniqueIndex().on(t.priceListId, t.productVariantId)],
  )

  const priceSetsRelations = relations(priceSets, ({ one, many }) => ({
    priceList: one(priceLists, {
      fields: [priceSets.priceListId],
      references: [priceLists.id],
    }),
    productVariant: one(productVariants, {
      fields: [priceSets.productVariantId],
      references: [productVariants.id],
    }),
    prices: many(prices),
  }))

  const prices = tenantSchema.table('prices', {
    ...id,
    currencyCode: text('currency_code').$type<CurrencyCode>().notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),

    priceSetId: text('price_set_id')
      .notNull()
      .references(() => priceSets.id, { onDelete: 'cascade' }),

    ...timestamps,
  })

  const pricesRelations = relations(prices, ({ one }) => ({
    priceSet: one(priceSets, {
      fields: [prices.priceSetId],
      references: [priceSets.id],
    }),
  }))

  const inventoryItems = tenantSchema.table('inventory_items', {
    ...id,

    variantId: text('variant_id')
      .notNull()
      .unique()
      .references(() => productVariants.id, { onDelete: 'cascade' }),

    ...timestamps,
  })

  const inventoryItemsRelations = relations(
    inventoryItems,
    ({ one, many }) => ({
      variant: one(productVariants, {
        fields: [inventoryItems.variantId],
        references: [productVariants.id],
      }),
      inventoryLevels: many(inventoryLevels),
    }),
  )

  const inventoryLevels = tenantSchema.table('inventory_levels', {
    ...id,
    stockedQuantity: integer('stocked_quantity').notNull().default(0),

    inventoryItemId: text('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'cascade' }),
    locationId: text('location_id')
      .notNull()
      .references(() => stockLocations.id, { onDelete: 'cascade' }),

    ...timestamps,
  })

  const inventoryLevelsRelations = relations(inventoryLevels, ({ one }) => ({
    inventoryItem: one(inventoryItems, {
      fields: [inventoryLevels.inventoryItemId],
      references: [inventoryItems.id],
    }),
    location: one(stockLocations, {
      fields: [inventoryLevels.locationId],
      references: [stockLocations.id],
    }),
  }))

  const stockLocations = tenantSchema.table('stock_locations', {
    ...id,
    name: text('name').notNull(),

    ...timestamps,
  })

  const stockLocationsRelations = relations(stockLocations, ({ many }) => ({
    addresses: many(addresses),
    inventoryLevels: many(inventoryLevels),
  }))

  const productDetails = tenantSchema.table('product_details', {
    ...id,
    brand: text('brand'),
    material: text('material'),

    productId: text('product_id')
      .notNull()
      .unique()
      .references(() => products.id, { onDelete: 'cascade' }),

    ...timestamps,
  })

  const productDetailsRelations = relations(productDetails, ({ one }) => ({
    product: one(products, {
      fields: [productDetails.productId],
      references: [products.id],
    }),
  }))

  const orders = tenantSchema.table('orders', {
    ...id,
    displayId: bigserial('display_id', { mode: 'number' }).unique().notNull(),

    status: orderStatusEnum('status').notNull().default('draft'),
    currencyCode: text('currency_code').$type<CurrencyCode>().notNull(),
    notes: text('notes'),

    isOpened: boolean('is_opened').notNull().default(true),

    sellerUserId: text('seller_user_id').references(() => users.id),
    customerId: text('customer_id').references(() => customers.id),

    ...timestamps,
  })

  const ordersRelations = relations(orders, ({ one, many }) => ({
    sellerUser: one(users, {
      fields: [orders.sellerUserId],
      references: [users.id],
    }),
    customer: one(customers, {
      fields: [orders.customerId],
      references: [customers.id],
    }),
    addresses: many(addresses),
    orderItems: many(orderItems),
  }))

  const orderItems = tenantSchema.table('order_items', {
    ...id,
    referenceId: text('reference_id').unique(),

    quantity: integer('quantity').notNull().default(1),
    unitPrice: bigint('unit_price', { mode: 'number' }).notNull(),
    compareAtUnitPrice: bigint('compare_at_unit_price', { mode: 'number' }),
    notes: text('notes'),

    orderId: text('order_id')
      .notNull()
      .references(() => orders.id),
    orderLineItemId: text('order_line_item_id')
      .unique()
      .references(() => orderLineItems.id),

    ...timestamps,
  })

  const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
      fields: [orderItems.orderId],
      references: [orders.id],
    }),
    orderLineItem: one(orderLineItems, {
      fields: [orderItems.orderLineItemId],
      references: [orderLineItems.id],
    }),
  }))

  const orderLineItems = tenantSchema.table('order_line_items', {
    ...id,

    productVariantId: text('product_variant_id'),
    productVariantName: text('product_variant_name'),
    productVariantSku: text('product_variant_sku'),
    productVariantManageInventory: boolean('product_variant_manage_inventory'),
    productVariantThumbnail: text('product_variant_thumbnail'),
    productVariantImages: jsonb('product_variant_images'),
    productVariantOptions: jsonb('product_variant_options'),
    productName: text('product_name'),
    productSubtitle: text('product_subtitle'),
    productDescription: text('product_description'),
    productThumbnail: text('product_thumbnail'),
    productImages: jsonb('product_images'),

    ...timestamps,
  })

  const orderLineItemsRelations = relations(orderLineItems, ({ one }) => ({
    orderItem: one(orderItems),
  }))

  const productOptionValuesToProductVariants = tenantSchema.table(
    'product_option_values_to_product_variants',
    {
      optionValueId: text('option_value_id')
        .notNull()
        .references(() => productOptionValues.id, {
          onUpdate: 'cascade',
          onDelete: 'cascade',
        }),
      variantId: text('variant_id')
        .notNull()
        .references(() => productVariants.id, {
          onUpdate: 'cascade',
          onDelete: 'cascade',
        }),
    },
    (t) => [primaryKey({ columns: [t.variantId, t.optionValueId] })],
  )

  const productOptionValuesToProductVariantsRelations = relations(
    productOptionValuesToProductVariants,
    ({ one }) => ({
      optionValue: one(productOptionValues, {
        fields: [productOptionValuesToProductVariants.optionValueId],
        references: [productOptionValues.id],
      }),
      variant: one(productVariants, {
        fields: [productOptionValuesToProductVariants.variantId],
        references: [productVariants.id],
      }),
    }),
  )

  //  const timelineActivities = tenantSchema.table('timeline_activities', {
  //   ...id,
  //   userId: text('user_id').notNull(),

  //   createdAt: timestamps.createdAt,
  // })

  //  const auditLogs = tenantSchema.table('audit_logs', {
  //   ...id,

  //   createdAt: timestamps.createdAt,
  // })

  return {
    genderEnum,
    productStatusEnum,
    orderStatusEnum,
    apiKeys,
    users,
    customers,
    customersRelations,
    addresses,
    addressesRelations,
    productCategories,
    productCategoriesRelations,
    products,
    productsRelations,
    productImages,
    productImagesRelations,
    productOptions,
    productOptionsRelations,
    productOptionValues,
    productOptionValuesRelations,
    productVariants,
    productVariantsRelations,
    priceLists,
    priceListsRelations,
    priceSets,
    priceSetsRelations,
    prices,
    pricesRelations,
    inventoryItems,
    inventoryItemsRelations,
    inventoryLevels,
    inventoryLevelsRelations,
    stockLocations,
    stockLocationsRelations,
    productDetails,
    productDetailsRelations,
    orders,
    ordersRelations,
    orderItems,
    orderItemsRelations,
    orderLineItems,
    orderLineItemsRelations,
    productOptionValuesToProductVariants,
    productOptionValuesToProductVariantsRelations,
  }
}

export const {
  genderEnum,
  productStatusEnum,
  orderStatusEnum,
  apiKeys,
  users,
  customers,
  customersRelations,
  addresses,
  addressesRelations,
  productCategories,
  productCategoriesRelations,
  products,
  productsRelations,
  productImages,
  productImagesRelations,
  productOptions,
  productOptionsRelations,
  productOptionValues,
  productOptionValuesRelations,
  productVariants,
  productVariantsRelations,
  priceLists,
  priceListsRelations,
  priceSets,
  priceSetsRelations,
  prices,
  pricesRelations,
  inventoryItems,
  inventoryItemsRelations,
  inventoryLevels,
  inventoryLevelsRelations,
  stockLocations,
  stockLocationsRelations,
  productDetails,
  productDetailsRelations,
  orders,
  ordersRelations,
  orderItems,
  orderItemsRelations,
  orderLineItems,
  orderLineItemsRelations,
  productOptionValuesToProductVariants,
  productOptionValuesToProductVariantsRelations,
} = createTenantSchema()
