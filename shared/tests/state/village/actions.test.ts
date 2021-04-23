import {
    FetchAllVillagesFromDescoAction,
    FetchAllVillagesFromDescoFailedAction,
    FetchAllVillagesFromDescoSuccessAction,
    SelectVillageAction,
    VillageState,
    VillageStateProcess
} from '@state'
import { Desco, Village } from '@api'
import { Status } from '@shared-types'

describe('Testing all Redux actions related to village', () => {
    let sampleVillageState: VillageState
    let mockDesco: Desco

    beforeEach(() => {
        sampleVillageState = {
            villages: [
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
            ],
            selectedVillage: {
                villagePk: 10,
                name: 'San Isidro',
                aliasPrefix: 'SI',
                descoFk: 6,
                urlSlug: 'san-isidro',
                latitude: 0,
                longitude: 0
            },
            currentProcess: VillageStateProcess.Idle,
            currentStatus: Status.Idle
        }
        mockDesco = {
            descoPk: 6,
            name: 'AIEC',
            urlSlug: 'aiec'
        }
    })

    describe('FetchAllVillagesFromDescoSuccessAction', () => {
        it('should replace current village list with villages from desco', () => {
            const fakeVillageDataFromDeco: Village[] = [
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
                },
                {
                    villagePk: 17,
                    name: 'Cabuyao',
                    aliasPrefix: 'CB',
                    descoFk: 6,
                    urlSlug: 'cabuyao',
                    latitude: 0,
                    longitude: 0
                }
            ]

            const actualState = new FetchAllVillagesFromDescoSuccessAction(fakeVillageDataFromDeco).reduce({ ...sampleVillageState })
            expect(actualState.villages).toStrictEqual(fakeVillageDataFromDeco)
        })
    })

    describe('SelectVillageAction', () => {
        it('should update selected village in the village state', () => {
            const expectedSelectedVillage: Village = {
                villagePk: 15,
                name: 'Calamba',
                aliasPrefix: 'CA',
                descoFk: 6,
                urlSlug: 'calamba',
                latitude: 0,
                longitude: 0
            }

            const actualState = new SelectVillageAction(expectedSelectedVillage).reduce({ ...sampleVillageState })
            expect(actualState.selectedVillage).toStrictEqual(expectedSelectedVillage)
        })
    })

    describe('FetchAllVillagesFromDescoAction', () => {
        it('should not modify existing state', () => {
            const actualState = new FetchAllVillagesFromDescoAction(mockDesco).reduce({ ...sampleVillageState })
            expect(actualState).toStrictEqual(sampleVillageState)
        })
    })

    describe('FetchAllVillagesFromDescoFailedAction', () => {
        it('should not modify existing state', () => {
            const fakeError = new Error('Uh oh! Rogue desco is going around painting the solar panels black! Stop them quick!')
            const actualState = new FetchAllVillagesFromDescoFailedAction(fakeError).reduce({ ...sampleVillageState })
            expect(actualState).toStrictEqual({
                ...sampleVillageState,
                error: fakeError
            })
        })
    })
})
