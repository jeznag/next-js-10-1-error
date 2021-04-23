import { Desco, DescoApi } from '@api'
import { SagaRunner } from '@utils'
import {
    fetchDescos,
    FetchAllDescosAction,
    FetchAllDescosSuccessAction,
    FetchAllDescosFailedAction
} from '@state'

describe('Selected Desco sagas', () => {
    describe('Fetch all desco feature', () => {
        it('should fetch all descos', async () => {
            const descos: Desco[] = [
                {
                    descoPk: 1,
                    name: 'Camsolar',
                    urlSlug: 'camsolar'
                }
            ]
            const initialAction = new FetchAllDescosAction().create()
            const expectedAction = new FetchAllDescosSuccessAction(descos).create()

            const mockApi = new DescoApi()
            jest.spyOn(mockApi, 'getAll').mockResolvedValue(descos)

            const sagaRunner = new SagaRunner(
                fetchDescos,
                initialAction,
                mockApi
            )
            const dispatchedActions = await sagaRunner.run()

            expect(dispatchedActions).toContainEqual(expectedAction)
        })

        it('should return FETCH_ALL_DESCO_FAILED when fetch fails', async () => {
            const dummyError = new Error('dummy error')

            const initialAction = new FetchAllDescosAction().create()
            const expectedAction = new FetchAllDescosFailedAction(dummyError).create()

            jest.spyOn(DescoApi.prototype, 'getAll').mockResolvedValue(dummyError)

            const sagaRunner = new SagaRunner(
                fetchDescos,
                initialAction
            )
            const dispatchedActions = await sagaRunner.run()

            expect(dispatchedActions).toContainEqual(expectedAction)
        })
    })
})
