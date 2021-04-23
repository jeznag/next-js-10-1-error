import { Currency } from 'dinero.js'
import { DateTime } from 'luxon'

import { HttpClient } from '@services'
import { ApolloApi } from './ApolloApi'
import { ApiMetaData } from '@shared-types'

export const PAYMENT_PROVIDER = 'HARVEST_MOBILE'

export type Payment = {
    externalId: string,
    amount: number,
    currency: Currency,
    provider: typeof PAYMENT_PROVIDER,
    okraBillRef: string
    createdAt: DateTime
}

export class PaymentApi {
    private readonly baseApi: ApolloApi<Payment>

    constructor (private readonly client?: HttpClient) {
        this.baseApi = new ApolloApi('payments', client)
    }

    public async createPayment (payment: Payment, metadata?: ApiMetaData) {
        const body = {
            external_id: payment.externalId,
            amount: payment.amount,
            currency: payment.currency,
            provider: payment.provider,
            okra_bill_ref: payment.okraBillRef,
            created_at: payment.createdAt.toISO()
        }

        return this.baseApi.create(body, metadata)
    }
}
