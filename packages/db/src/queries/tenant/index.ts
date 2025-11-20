import { getApiKey } from './api-keys/get-api-key'
import { listApiKeys } from './api-keys/list-api-keys'
import { getCustomer, getCustomerWithRelations } from './customers/get-customer'
import { listCustomersWithRelations } from './customers/list-customers'
import { getUser, getUserByUsername } from './users/get-user'
import { listUsers } from './users/list-users'

export const tenantQueries = {
  apiKeys: {
    listApiKeys,
    getApiKey,
  },
  users: {
    listUsers,
    getUser,
    getUserByUsername,
  },
  customers: {
    listCustomersWithRelations,
    getCustomer,
    getCustomerWithRelations,
  },
}
