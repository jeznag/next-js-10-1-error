import { Condition } from '@shared-types'

import { XMysqlApi, PaymentType, TransactionType } from '@api'
import { HttpClient } from '@services'

export type TransactionDTO = {
    latest_transaction_date: string
    amount: number
    balance: number
    type: TransactionType
    consumer_fk: number
    village_fk: number
    currency_code: string
    base_rate: number
    excess_rate: number
    base_allowance_wh: number
    payment_type: PaymentType
    days_left: number
}

export type Transaction = {
    latestTransactionDate: string
    amount: number
    balance: number
    type: TransactionType
    consumerFk: number
    villageFk: number
    currencyCode: string
    baseRate: number
    excessRate: number
    baseAllowanceWh: number
    paymentType: PaymentType
}
export class TransactionApi {
    private readonly baseApi: XMysqlApi<Transaction>
    private readonly fields = [
        'latest_transaction_date',
        'amount',
        'balance',
        'type',
        'consumer_fk',
        'village_fk',
        'package_type_fk',
        'currency_code',
        'base_rate',
        'excess_rate',
        'base_allowance_wh',
        'payment_type',
        'days_left'
    ]

    constructor (client?: HttpClient) {
        this.baseApi = new XMysqlApi<Transaction>('transaction', this.fields, client)
    }

    /**
     * This would return the latest transaction for each consumer
     * @param villageKeys
     */
    private async getAllLatestTransactions (condition?: Condition): Promise<Transaction[] | Error> {
        const parsedCondition = condition
            ? this.baseApi.parseCondition(condition)
            : undefined

        const rawTransactions = await this.baseApi.getAllWithCustomEntity<TransactionDTO>({
            _fields: this.fields.join(','),
            ...parsedCondition
        }, 'latest_transactions_view')

        if (rawTransactions instanceof Error) {
            return rawTransactions
        }

        return rawTransactions.map(transaction => this.parseDto(transaction))
    }

    /**
     * This would return the latest charge (charge for energy and appliances)
     * transaction for each consumer.
     * @param villageKeys
     */
    private async getAllLatestChargeTransactions (condition?: Condition): Promise<Transaction[] | Error> {
        const parsedCondition = condition
            ? this.baseApi.parseCondition(condition)
            : undefined

        const rawTransactions = await this.baseApi.getAllWithCustomEntity<TransactionDTO>({
            _fields: this.fields.join(','),
            ...parsedCondition
        }, 'latest_charge_transactions_view')

        if (rawTransactions instanceof Error) {
            return rawTransactions
        }

        return rawTransactions.map(transaction => this.parseDto(transaction))
    }

    public async getLatestFromVillages (villageKeys: number[]): Promise<Transaction[] | Error> {
        const uniqueKeys = [...new Set(villageKeys)]
        const stringOfKeys = uniqueKeys.join(',')

        const transactions = await this.getAllLatestTransactions({ village_fk: `${stringOfKeys}` })

        return transactions
    }

    public async getLatestChargeTransactionsFromVillages (villageKeys: number[]): Promise<Transaction[] | Error> {
        const uniqueKeys = [...new Set(villageKeys)]
        const stringOfKeys = uniqueKeys.join(',')

        const transactions = await this.getAllLatestChargeTransactions({ village_fk: `${stringOfKeys}` })

        return transactions
    }

    private parseDto (dto: TransactionDTO): Transaction {
        return {
            latestTransactionDate: dto.latest_transaction_date,
            amount: dto.amount,
            balance: dto.balance,
            type: dto.type,
            consumerFk: dto.consumer_fk,
            villageFk: dto.village_fk,
            currencyCode: dto.currency_code,
            baseRate: dto.base_rate,
            excessRate: dto.excess_rate,
            baseAllowanceWh: dto.base_allowance_wh,
            paymentType: dto.payment_type
        }
    }
}
