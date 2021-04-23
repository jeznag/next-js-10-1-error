import { Route, UtilityRoute } from '@services'

describe('Testing Route class', () => {
    describe('toKoaRoute()', () => {
        it('should convert NextJS dynamic route to koa route', () => {
            const route = new Route('/[desco-name]/consumers/[consumer-detail]')
            const expected = '/:desco_name/consumers/:consumer_detail'

            const actual = route.toKoaRoute()

            expect(actual).toEqual(expected)
        })
    })

    describe('replaceDynamicRoutes()', () => {
        it('should replace dynamic routes with the provided parameters', () => {
            const consumerDetails = new Route('/[desco-name]/villages/[village-name]/[consumer-detail]')
            const expected = '/okra/villages/san-isidro/nmjK512'

            const actual = consumerDetails.replaceDynamicRoutes(
                ['okra', 'san-isidro', 'nmjK512']
            )

            expect(actual).toEqual(expected)
        })

        it('should throw an error if the number of dynamic routes and parameters does not match',
            () => {
                const actual = () => {
                    const consumerDetails = new Route(
                        '/[desco-name]/villages/[village-name]/[consumer-detail]'
                    )
                    consumerDetails.replaceDynamicRoutes(
                        ['okra']
                    )
                }
                expect(actual).toThrowError(
                    'The number of parameters provided does ' +
                    'not match the dynamic routes found.'
                )
            }
        )

        it(
            'should return the passed route if there is no dynamic route found',
            () => {
                const auth0 = new UtilityRoute('/auth0')
                const actual = auth0.replaceDynamicRoutes(
                    ['okra']
                )
                expect(actual).toEqual(auth0.getPath())
            }
        )
    })

    describe('isValid()', () => {
        test.each([
            ['/okra/consumers/nmjK512/'],
            ['/okra//nmjK512'],
            ['//consumers/nmjK512'],
            ['//']
        ])('should return false for invalid route: %s', (mockData: string) => {
            const actual = Route.isValid(mockData)

            expect(actual).toBe(false)
        })

        test.each([
            ['/[desco-name]'],
            ['/[desco-name]/consumers/nmjK512'],
            ['/okra/consumers/!l4K@By'],
            ['/consumers/nmjK512'],
            ['/users'],
            ['/']
        ])('should return true for valid route: %s', (mockData: string) => {
            const actual = Route.isValid(mockData)

            expect(actual).toBe(true)
        })

        it('should throw an error if Route class is initialized with invalid route', () => {
            const actual = () => {
                const route = new Route('/okra//nmjK512')
                route.getPath()
            }

            expect(actual).toThrowError()
        })
    })
})
