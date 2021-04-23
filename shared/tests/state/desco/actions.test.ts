import {
    FetchAllDescosSuccessAction,
    SelectDescoAction,
    DescoState
} from '@state'

describe('Testing all Redux actions related to desco', () => {
    let descoState: DescoState

    beforeEach(() => {
        descoState = {
            descos: [{
                descoPk: 1,
                name: 'Camsolar',
                urlSlug: 'camsolar'
            },
            {
                descoPk: 2,
                name: 'Pteah Baitong',
                urlSlug: 'pteah-baitong'
            }, {
                descoPk: 6,
                name: 'AIEC',
                urlSlug: 'aiec'
            }],
            selectedDesco: {
                descoPk: 6,
                name: 'AIEC',
                urlSlug: 'aiec'
            }
        }
    })

    describe('FetchAllDescosSuccessAction', () => {
        it('should update descos in the desco state', () => {
            const expectedDescos = [
                {
                    descoPk: 1,
                    name: 'Camsolar',
                    urlSlug: 'camsolar'
                }, {
                    descoPk: 4,
                    name: 'NRG',
                    urlSlug: 'nrg'
                }, {
                    descoPk: 6,
                    name: 'AIEC',
                    urlSlug: 'aiec'
                }
            ]

            const actualState = new FetchAllDescosSuccessAction(expectedDescos).reduce(descoState)
            expect(actualState.descos).toStrictEqual(expectedDescos)
        })
    })

    describe('SelectDescoAction', () => {
        it('should update selected desco in the desco state', () => {
            const expectedSelectedDesco = {
                descoPk: 1,
                name: 'Camsolar',
                urlSlug: 'camsolar'
            }

            const actualState = new SelectDescoAction(expectedSelectedDesco).reduce(descoState)
            expect(actualState.selectedDesco).toStrictEqual(expectedSelectedDesco)
        })
    })
})
