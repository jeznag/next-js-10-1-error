import { InternalRoute, Route, EnvironmentClass } from '@services'

describe('Testing EnvironmentClass', () => {
    const mockServerUrl = 'http://server.test.com'
    const mockClientUrl = 'http://client.test.com'
    const mockConfig = {
        serverUrl: mockServerUrl,
        serverPort: '3000',
        clientUrl: mockClientUrl,
        clientPort: '3000'
    }

    describe('URLs', () => {
        /*
        * Setup constants for the different types of places to pull urls
        * Even though some of these might match in production, here they are all different
        * so they we can ensure the tests return the expected values
        */
        const windowProtocol = 'https:'
        const windowHost = 'window.test.com'
        const windowPort = '443'
        let mockUsersPath: string
        let mockVillagesPath: string
        let windowSpy: any

        beforeEach(() => {
            windowSpy = jest.spyOn(global, 'window', 'get')
            windowSpy.mockImplementation(() => undefined)

            const usersRoute = new InternalRoute('/users')
            mockUsersPath = usersRoute.getPath()

            const villagesRoute = new Route('/[desco-name]/villages/[village-name]')
            mockVillagesPath = villagesRoute.getPath()
        })

        afterEach(() => {
            windowSpy.mockRestore()
        })

        describe('getInternalHarvestUrl()', () => {
            it('should return server-side URL', () => {
                const villagesRoute = new Route('/[desco-name]/villages/[village-name]')
                const mockEndpoint = villagesRoute.getPath()

                const expected = `${mockConfig.serverUrl}:${mockConfig.serverPort}${mockEndpoint}`

                const environment = new EnvironmentClass(mockConfig)
                const actual = environment.getInternalHarvestUrl(mockEndpoint)

                expect(actual).toStrictEqual(expected)
            })

            it('should return base server-side URL if endpoint is not passed', () => {
                const expected = `${mockConfig.serverUrl}:${mockConfig.serverPort}`

                const environment = new EnvironmentClass(mockConfig)
                const actual = environment.getInternalHarvestUrl()

                expect(actual).toStrictEqual(expected)
            })

            it('should return client-side window URL', () => {
                windowSpy.mockImplementation(() => {
                    return {
                        location: {
                            protocol: windowProtocol,
                            hostname: windowHost,
                            port: windowPort
                        }
                    }
                })

                const expected = `${windowProtocol}//${windowHost}:${windowPort}${mockUsersPath}`

                const environment = new EnvironmentClass(mockConfig)
                const actual = environment.getInternalHarvestUrl(mockUsersPath)

                expect(actual).toStrictEqual(expected)
            })

            it('should return base client-side window URL without port if endpoint is not passed and port is missing', () => {
                windowSpy.mockImplementation(() => {
                    return {
                        location: {
                            protocol: windowProtocol,
                            hostname: windowHost
                        }
                    }
                })

                const expected = `${windowProtocol}//${windowHost}`

                const environment = new EnvironmentClass(mockConfig)
                const actual = environment.getInternalHarvestUrl()

                expect(actual).toStrictEqual(expected)
            })
        })

        describe('getExternalHarvestUrl()', () => {
            it('should return server-side URL', () => {
                const expected = `${mockConfig.clientUrl}:${mockConfig.clientPort}${mockVillagesPath}`

                const environment = new EnvironmentClass(mockConfig)
                const actual = environment.getExternalHarvestUrl(mockVillagesPath)

                expect(actual).toStrictEqual(expected)
            })

            it('should return base server-side URL if endpoint is not passed', () => {
                const expected = `${mockConfig.clientUrl}:${mockConfig.clientPort}`

                const environment = new EnvironmentClass(mockConfig)
                const actual = environment.getExternalHarvestUrl()

                expect(actual).toStrictEqual(expected)
            })

            it('should return client-side window URL', () => {
                windowSpy.mockImplementation(() => {
                    return {
                        location: {
                            protocol: windowProtocol,
                            hostname: windowHost,
                            port: windowPort

                        }
                    }
                })

                const expected = `${windowProtocol}//${windowHost}:${windowPort}${mockUsersPath}`

                const environment = new EnvironmentClass(mockConfig)
                const actual = environment.getExternalHarvestUrl(mockUsersPath)

                expect(actual).toStrictEqual(expected)
            })

            it('should return base client-side window URL without port if endpoint is not passed and port is missing', () => {
                windowSpy.mockImplementation(() => {
                    return {
                        location: {
                            protocol: windowProtocol,
                            hostname: windowHost
                        }
                    }
                })

                const expected = `${windowProtocol}//${windowHost}`

                const environment = new EnvironmentClass(mockConfig)
                const actual = environment.getExternalHarvestUrl()

                expect(actual).toStrictEqual(expected)
            })
        })
    })
})
