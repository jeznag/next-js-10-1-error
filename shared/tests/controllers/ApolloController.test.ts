import { createMockContext } from '@shopify/jest-koa-mocks'
import { ApolloController } from '@controllers'
import { Config } from '@services'

describe('Test ApolloController', () => {
    let mockNext: () => Promise<any>

    beforeEach(() => {
        mockNext = jest.fn()
    })

    describe('buildUrl()', () => {
        it('should exclude "apollo" from link before forwarding the request', async () => {
            const mockPath = '/insights?village_pk=10&start_ts=1580103000000&end_ts=1590980174843'
            const context = createMockContext({
                url: `/apollo${mockPath}`
            })
            const expectedPath = `${Config.get('APOLLO_API_URL')}:${Config.get('APOLLO_API_PORT')}${mockPath}`

            await ApolloController.buildUrl(context, mockNext)

            expect(context.request.url).toEqual(expectedPath)
        })

        it('should throw an internal server error if an invalid path is passed', async () => {
            const context = createMockContext({
                url: '/apolloinvalidpath'
            })
            const expectedErrorMessage = 'Requested Apollo endpoint cannot be found.'

            await ApolloController.buildUrl(context, mockNext)

            expect(context.throw).toBeCalledWith(expectedErrorMessage, 500)
        })
    })
})
