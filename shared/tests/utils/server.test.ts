import {
    createStrongPassword
} from '@utils'

describe('Test server helper functions', () => {
    describe('createStrongPassword()', () => {
        let uppercaseLetters: string[]
        let lowercaseLetters: string[]
        let numbers: number[]
        let specialCharacters: string[]

        beforeEach(() => {
            uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
            lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz'.split('')
            specialCharacters = '@#$%^&*'.split('')
            numbers = '12345678910'.split('').map(Number)
        })

        it('should return a strong password with a length of 20', () => {
            const expectedLength = 20
            const actual = createStrongPassword(expectedLength)
            const actualLength = actual.length

            const hasUppercaseLetters =
                uppercaseLetters.find((letter) => actual.includes(letter)) !==
                undefined
            const hasLowercaseLetters =
                lowercaseLetters.find((letter) => actual.includes(letter)) !==
                undefined
            const hasSpecialCharacters =
                specialCharacters.find((character) =>
                    actual.includes(character)
                ) !== undefined
            const hasNumbers =
                numbers.find((num) => actual.includes(num.toString())) !==
                undefined

            expect(actualLength).toStrictEqual(expectedLength)
            expect(hasUppercaseLetters).toStrictEqual(true)
            expect(hasLowercaseLetters).toStrictEqual(true)
            expect(hasSpecialCharacters).toStrictEqual(true)
            expect(hasNumbers).toStrictEqual(true)
        })

        it('should return a strong password with a length of 12', () => {
            const expectedLength = 12
            const actual = createStrongPassword(expectedLength)
            const actualLength = actual.length

            const hasUppercaseLetters =
                uppercaseLetters.find((letter) => actual.includes(letter)) !==
                undefined
            const hasLowercaseLetters =
                lowercaseLetters.find((letter) => actual.includes(letter)) !==
                undefined
            const hasSpecialCharacters =
                specialCharacters.find((character) =>
                    actual.includes(character)
                ) !== undefined
            const hasNumbers =
                numbers.find((num) => actual.includes(num.toString())) !==
                undefined

            expect(actualLength).toStrictEqual(expectedLength)
            expect(hasUppercaseLetters).toStrictEqual(true)
            expect(hasLowercaseLetters).toStrictEqual(true)
            expect(hasSpecialCharacters).toStrictEqual(true)
            expect(hasNumbers).toStrictEqual(true)
        })

        it('should return an error if the password length is too low', () => {
            const expectedLength = 5
            const expectedError = 'Password length should be at least 12.'
            const actual = () => {
                createStrongPassword(expectedLength)
            }

            expect(actual).toThrow(expectedError)
        })
    })
})
