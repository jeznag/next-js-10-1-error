import { DateRange } from '@utils'
import { HttpClient } from '@services'
import { PaymentType, TariffType, XMysqlApi } from './'

export enum TransactionType {
    Payment = 'PAYMENT',
    Charge = 'CHARGE',
    Adjustment = 'ADJUSTMENT',
    ChargeAppliance = 'CHARGE_APPLIANCE'
}

export type DetailedTransactionDTO = {
    transaction_pk: number
    alias: string
    village_name: string
    village_fk: number
    desco_fk: number
    transaction_date: string
    package_name: string
    payment_type: PaymentType
    tariff_type: TariffType
    base_rate: number
    transaction_type: TransactionType
    amount: number
    currency: string
    remaining_balance: number
}

export type DetailedTransaction = {
    transactionPk: number
    alias: string
    villageName: string
    villageFk: number
    descoFk: number
    transactionDate: string
    packageName: string
    paymentType: PaymentType
    tariffType: TariffType
    baseRate: number
    transactionType: TransactionType
    amount: number
    currency: string
    remainingBalance: number
}

export class DetailedTransactionApi {
    private readonly baseApi: XMysqlApi<DetailedTransactionDTO>
    private readonly fields = [
        'transaction_pk',
        'alias',
        'village_name',
        'village_fk',
        'desco_fk',
        'transaction_date',
        'package_name',
        'payment_type',
        'tariff_type',
        'base_rate',
        'transaction_type',
        'amount',
        'currency',
        'remaining_balance'
    ]

    constructor (client?: HttpClient) {
        this.baseApi = new XMysqlApi<DetailedTransactionDTO>('detailed_transaction', this.fields, client)
    }

    /**
     * Retrieve all transactions using the `desco` primary key (please see
     * `detailed_transaction` view). To prevent overloading the database,
     * the daterange is required.
     * @param descoKey
     * @param dateRange
     */
    public async getAllFromDesco (descoKey: number, dateRange: DateRange) {
        const dateRanges = dateRange.break('months', 1)
        const defaultCondition = `(desco_fk,in,${descoKey})`

        const results = await Promise.all(
            dateRanges.map(currentDateRange => {
                const startDate = currentDateRange.startDate.toSQL()
                const endDate = currentDateRange.endDate.toSQL()

                const dateRangeCondition = `(transaction_date,gte,${startDate})~and(transaction_date,lte,${endDate})`
                const condition = `${defaultCondition}~and${dateRangeCondition}`

                return this.baseApi.getAll({
                    _where: condition,
                    _sort: 'village_name,alias,-transaction_pk'
                })
            })
        )

        if (results.some(result => result instanceof Error)) {
            const error = results.find(result => result instanceof Error)
            return error as Error
        }

        return results.flatMap(result => {
            const transactions = result as DetailedTransactionDTO[]

            return transactions.map(transaction => this.parseDto(transaction))
        })
    }

    private parseDto (dto: DetailedTransactionDTO): DetailedTransaction {
        return {
            transactionPk: dto.transaction_pk,
            alias: dto.alias,
            villageName: dto.village_name,
            villageFk: dto.village_fk,
            descoFk: dto.desco_fk,
            transactionDate: dto.transaction_date,
            packageName: dto.package_name,
            paymentType: dto.payment_type,
            tariffType: dto.tariff_type,
            baseRate: dto.base_rate,
            transactionType: dto.transaction_type,
            amount: dto.amount,
            currency: dto.currency,
            remainingBalance: dto.remaining_balance
        }
    }
}
