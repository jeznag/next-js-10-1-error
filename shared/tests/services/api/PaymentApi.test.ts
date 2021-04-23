import {
    PaymentApi,
    Payment,
    PAYMENT_PROVIDER,
    ApolloApi
} from '@apollo'
import { HttpClient } from '@services'
import { DateTime } from 'luxon'

describe('Testing PaymentApi class', () => {
    let paymentApi: PaymentApi
    let httpMock: HttpClient

    beforeEach(() => {
        httpMock = new HttpClient()
        paymentApi = new PaymentApi(httpMock)
    })

    describe('createPayment', () => {
        it('should use the Apollo API to create the payment', async () => {
            const mockPayment: Payment = {
                externalId: '12312312',
                amount: 150,
                currency: 'AUD',
                provider: PAYMENT_PROVIDER,
                okraBillRef: 'abc123',
                createdAt: DateTime.fromISO('2018-05-14T12:30:00.000Z')
            }

            const expectedApiResult = {
                'someReturnValue': 'whatever'
            }

            jest.spyOn(ApolloApi.prototype, 'create').mockResolvedValueOnce(expectedApiResult)

            const paymentResult = await paymentApi.createPayment(mockPayment, {
                apiCallId: 'fakeApiCallId'
            })

            expect(paymentResult).toStrictEqual(expectedApiResult)
        })
    })
})
