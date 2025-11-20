import { getCustomer, getCustomerWithRelations } from './customers/get-customer'
import {
  listCustomersByIds,
  listCustomersWithRelations,
} from './customers/list-customers'

export const internalQueries = {
  customers: {
    listCustomersWithRelations,
    listCustomersByIds,
    getCustomer,
    getCustomerWithRelations,
  },
}
