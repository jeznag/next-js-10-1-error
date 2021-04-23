import { ObjectUtil } from '@utils'

type MultipleTestCases = [string, any][]

describe('test ObjectUtil class', () => {
    describe('isEmpty', () => {
        it('should return true if object is empty ({})', () => {
            const actual = ObjectUtil.isEmpty({})
            expect(actual).toStrictEqual(true)
        })

        it('should return true if object is not empty', () => {
            const mockObject = {
                firstName: 'Rodrigo',
                lastName: 'Duterte'
            }

            const actual = ObjectUtil.isEmpty(mockObject)
            expect(actual).toStrictEqual(false)
        })

        it('should return an error if value passed is not an object', () => {
            const actual = () => {
                ObjectUtil.isEmpty(3)
            }
            expect(actual).toThrowError()
        })
    })

    describe('isObject', () => {
        it('should return true if passed value is any object', () => {
            const actual = ObjectUtil.isObject({})
            expect(actual).toStrictEqual(true)
        })

        it('should return true if passed value is any object created using Object.create', () => {
            const mockObject = Object.create(null)
            mockObject.firstName = 'Jose'
            mockObject.firstName = 'Rizal'

            const actual = ObjectUtil.isObject(mockObject)
            expect(actual).toStrictEqual(true)
        })

        const cases: MultipleTestCases = [
            ['number', 3],
            ['string', 'Metal Garurumon'],
            ['date', new Date()],
            ['function', () => undefined]
        ]

        test.each(cases)(
            'should return false for %s',
            (dataType: string, data: any) => {
                expect(ObjectUtil.isObject(data)).toStrictEqual(false)
            }
        )
    })

    describe('isUndefinedOrNull', () => {
        it('should return true if passed value is undefined', () => {
            const actual = ObjectUtil.isUndefinedOrNull(undefined)
            expect(actual).toStrictEqual(true)
        })

        it('should return true if passed value is null', () => {
            const actual = ObjectUtil.isUndefinedOrNull(null)
            expect(actual).toStrictEqual(true)
        })

        const cases: MultipleTestCases = [
            ['number', 3],
            ['string', 'Metal Garurumon'],
            ['date', new Date()],
            ['function', () => undefined]
        ]

        test.each(cases)(
            'should return false for %s',
            (dataType: string, data: any) => {
                expect(ObjectUtil.isUndefinedOrNull(data)).toStrictEqual(false)
            }
        )
    })
})
