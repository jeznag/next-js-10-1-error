import { HttpClient } from '@services'
import { expectHttpResponses } from '@utils'
import {
    TransactionApi,
    PaymentType,
    TransactionDTO,
    TransactionType
} from '@api'

describe('Testing TransactionApi', () => {
    let httpMock: HttpClient
    let transactionApi: TransactionApi
    let mockTransactionsDtos: TransactionDTO[]
    let mockConsumerKeys: number[]

    beforeEach(() => {
        httpMock = new HttpClient()
        transactionApi = new TransactionApi(httpMock)
        mockConsumerKeys = [6, 7]
        mockTransactionsDtos = [
            {
                latest_transaction_date: '2018-06-30T16:59:59.000Z',
                type: TransactionType.Charge,
                amount: 4.6572,
                balance: -4.6572,
                consumer_fk: 6,
                village_fk: 6,
                base_rate: 6.00000,
                excess_rate: 0.00125,
                base_allowance_wh: 6000,
                currency_code: 'USD',
                payment_type: PaymentType.PostPaid,
                days_left: -5
            },
            {
                latest_transaction_date: '2018-06-30T16:59:59.000Z',
                type: TransactionType.Charge,
                amount: 4.2096,
                balance: -4.2096,
                consumer_fk: 7,
                village_fk: 6,
                base_rate: 6.00000,
                excess_rate: 0.00125,
                base_allowance_wh: 6000,
                currency_code: 'USD',
                payment_type: PaymentType.PostPaid,
                days_left: -5
            }
        ]
    })

    describe('getLatestFromVillages', () => {
        it('should return latest transaction for every consumer key provided', async () => {
            const transactions = mockTransactionsDtos.map(dto => transactionApi.parseDto(dto))

            const pageCount = [
                { no_of_rows: 1 }
            ]
            expectHttpResponses([pageCount, mockTransactionsDtos])
            const transactionApiSpy = jest.spyOn(transactionApi, 'getLatestFromVillages')

            const actualTransactions = await transactionApi.getLatestFromVillages(mockConsumerKeys)

            expect(transactionApiSpy).toBeCalledWith(mockConsumerKeys)
            expect(actualTransactions).toStrictEqual(transactions)
        })

        it('should return error when getAllFromConsumers returned an error', async () => {
            const expectedError = new Error('bad connection')

            const transactionApiSpy = jest.spyOn(transactionApi, 'getLatestFromVillages')
            expectHttpResponses([expectedError])

            const actualTransactions = await transactionApi.getLatestFromVillages(mockConsumerKeys)

            expect(transactionApiSpy).toBeCalled()
            expect(actualTransactions).toBeInstanceOf(Error)
        })
    })
})
