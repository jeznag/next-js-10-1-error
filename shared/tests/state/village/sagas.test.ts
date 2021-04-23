import { SagaRunner } from '@utils'
import { Village, VillageApi, Desco } from '@api'
import {
    fetchAllVillagesFromDesco,
    FetchAllVillagesFromDescoAction,
    FetchAllVillagesFromDescoFailedAction,
    FetchAllVillagesFromDescoSuccessAction
} from '@state'

describe('Selected Village sagas', () => {
    let mockSelectedVillage: Village
    let mockSelectedDesco: Desco
    let mockState = {
        village: {
            selectedVillage: {
                villagePk: 10,
                name: 'San Isidro',
                descoFk: 6,
                urlSlug: 'san-isidro',
                latitude: 0,
                longitude: 0
            }
        },
        desco: {
            selectedDesco: {
                descoPk: 6,
                name: 'AIEC'
            }
        }
    }

    beforeEach(() => {
        mockSelectedVillage = {
            villagePk: 10,
            name: 'San Isidro',
            aliasPrefix: 'SI',
            descoFk: 6,
            urlSlug: 'san-isidro',
            latitude: 0,
            longitude: 0
        }
        mockSelectedDesco = {
            descoPk: 6,
            name: 'Okra',
            urlSlug: 'okra'
        }
        mockState = {
            village: {
                selectedVillage: mockSelectedVillage
            },
            desco: {
                selectedDesco: mockSelectedDesco
            }
        }
    })

    describe('Fetch all villages feature', () => {
        it('should fetch all descos', async () => {
            const expectedVillages: Village[] = [
                {
                    villagePk: 10,
                    name: 'San Isidro',
                    aliasPrefix: 'SI',
                    descoFk: 6,
                    urlSlug: 'san-isidro',
                    latitude: 0,
                    longitude: 0
                },
                {
                    villagePk: 15,
                    name: 'Calamba',
                    aliasPrefix: 'CA',
                    descoFk: 6,
                    urlSlug: 'calamba',
                    latitude: 0,
                    longitude: 0
                }
            ]
            const initialAction = new FetchAllVillagesFromDescoAction(mockSelectedDesco).create()
            const expectedAction = new FetchAllVillagesFromDescoSuccessAction(expectedVillages).create()

            const mockApi = new VillageApi()
            jest.spyOn(mockApi, 'getAllFromDesco').mockImplementation(async (actualDescoKey: number) => {
                expect(actualDescoKey).toStrictEqual(mockSelectedDesco.descoPk)
                return expectedVillages
            })

            const sagaRunner = new SagaRunner(
                fetchAllVillagesFromDesco,
                initialAction,
                mockApi
            )
            sagaRunner.addState(mockState)
            const actualActions = await sagaRunner.run()

            expect(actualActions).toContainEqual(expectedAction)
        })

        it('should return a failed action if fetching villages fails', async () => {
            const dummyError = new Error('dummy error')

            const initialAction = new FetchAllVillagesFromDescoAction(mockSelectedDesco).create()
            const expectedAction = new FetchAllVillagesFromDescoFailedAction(dummyError).create()

            jest.spyOn(VillageApi.prototype, 'getAllFromDesco').mockResolvedValue(dummyError)

            const sagaRunner = new SagaRunner(
                fetchAllVillagesFromDesco,
                initialAction
            )
            sagaRunner.addState(mockState)
            const actualActions = await sagaRunner.run()

            expect(actualActions).toContainEqual(expectedAction)
        })
    })
})
