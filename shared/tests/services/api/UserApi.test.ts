import { HttpClient } from '@services'
import { expectHttpResponses } from '@utils'
import { UserApi, UserDTOWithDescoName } from '@api'

describe('Testing UserApi class', () => {
    let userApi: UserApi
    let httpMock: HttpClient
    let mockEmail: string

    beforeEach(() => {
        httpMock = new HttpClient()
        userApi = new UserApi(httpMock)
        mockEmail = 'test_email@desco.user'
    })

    describe('getUserFromEmail', () => {
        it('should return a user', async () => {
            const mockUsers: UserDTOWithDescoName[] = [
                {
                    user_pk: 33,
                    email: 'legen.wait.for.it.dary@legendary.com',
                    auth0_id: 'auth0|5ea57bc8d498370bdbe8e0f1',
                    desco_fk: 6,
                    last_login_at: '2020-05-06T01:37:27.000Z',
                    name: 'AIEC',
                    url_slug: 'aiec',
                    is_deleted: 0
                }
            ]

            expectHttpResponses([mockUsers])

            const actualResult = await userApi.getUserFromEmail(mockEmail)
            if (actualResult instanceof Error) throw actualResult

            expect(actualResult?.userPk).toStrictEqual(mockUsers[0].user_pk)
            expect(actualResult?.email).toStrictEqual(mockUsers[0].email)
            expect(actualResult?.descoFk).toStrictEqual(mockUsers[0].desco_fk)
            expect(actualResult?.descoName).toStrictEqual(mockUsers[0].name)
            expect(actualResult?.descoUrlSlug).toStrictEqual(mockUsers[0].url_slug)
        })

        it('should return undefined when no user is found', async () => {
            const mockUsers: Array<any> = []
            expectHttpResponses([mockUsers])

            const actualResult = await userApi.getUserFromEmail(mockEmail)
            if (actualResult instanceof Error) throw actualResult

            expect(actualResult).toBeUndefined()
        })

        it('should return an error if the http client fails', async () => {
            expectHttpResponses([new Error('bad connection')])
            const actualResult = await userApi.getUserFromEmail(mockEmail)
            expect(actualResult).toBeInstanceOf(Error)
        })
    })
})
