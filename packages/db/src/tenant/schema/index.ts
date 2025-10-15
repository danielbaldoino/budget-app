import { pgSchema, text } from 'drizzle-orm/pg-core'
import { id, metadata, timestamps } from '../../utils'
import { TENANT_MIGRATIONS_SCHEMA } from '../constants'

export const tenantSchema = pgSchema(TENANT_MIGRATIONS_SCHEMA)

export const users = tenantSchema.table('users', {
  ...id,
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  ...metadata,
  ...timestamps,
})

export const addresses = tenantSchema.table('addresses', {
  ...id,
  street: text('street').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  country: text('country').notNull(),
  ...timestamps,
})

export const customers = tenantSchema.table('customers', {
  ...id,
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  document: text('document').notNull().unique(),
  addressId: text('address_id')
    .references(() => addresses.id)
    .notNull(),
  billingAddressId: text('billing_address_id')
    .references(() => addresses.id)
    .notNull(),
  erpId: text('erp_id').notNull().unique(),
  ...metadata,
  ...timestamps,
})

export const categories = tenantSchema.table('categories', {
  ...id,
  name: text('name').notNull(),
  description: text('description'),
  ...metadata,
  ...timestamps,
})

export const transporters = tenantSchema.table('transporters', {
  ...id,
  name: text('name').notNull(),
  erpId: text('erp_id').notNull().unique(),
  ...metadata,
  ...timestamps,
})

export const paymentTerms = tenantSchema.table('payment_terms', {
  ...id,
  name: text('name').notNull(),
  erpId: text('erp_id').notNull().unique(),
  ...metadata,
  ...timestamps,
})

export const paymentConditions = tenantSchema.table('payment_conditions', {
  ...id,
  name: text('name').notNull(),
  erpId: text('erp_id').notNull().unique(),
  ...metadata,
  ...timestamps,
})
