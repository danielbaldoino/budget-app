import type {
  AddressType as AddressTypeEnum,
  CurrencyCode as CurrencyCodeEnum,
  DocumentType as DocumentTypeEnum,
} from './enums'

export type Metadata = Record<string, any>

export type CurrencyCode = (typeof CurrencyCodeEnum)[number]

export type DocumentType = (typeof DocumentTypeEnum)[number]

export type AddressType = (typeof AddressTypeEnum)[number]
