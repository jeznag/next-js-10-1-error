import { Config } from '@services'
import generatePassword from 'password-generator'
import AbortController from 'abort-controller'
import fetch from 'isomorphic-fetch'

/*
   SERVER-SIDE HELPER FUNCTIONS
*/
export function createStrongPassword (passwordLength = 12, excludeSpecialCharacters = false): string {
    if (passwordLength < 12) {
        throw new Error('Password length should be at least 12.')
    }

    const isStrongEnough = (password: string, length: number) => {
        const upperCaseCharacters = password.match(/[A-Z]/g)
        const lowerCaseCharacters = password.match(/[a-z]/g)
        const numbers = password.match(/[\d]/g)
        const specialCharacters = password.match(/[@#$%^&*]/g)

        return password.length === length &&
            upperCaseCharacters &&
            lowerCaseCharacters &&
            numbers &&
            (excludeSpecialCharacters || specialCharacters)
    }
    const passwordPattern = excludeSpecialCharacters
        ? /[\w\d]/
        : /[\w\d@#$%^&*]/

    let password: string
    do {
        password = generatePassword(passwordLength, false, passwordPattern)
    }
    while (!isStrongEnough(password, passwordLength))

    return password
}

export type RequestInitWithTimeout = {
    timeout?: number
} & RequestInit
export async function fetchWithTimeout (input: RequestInfo, init?: RequestInitWithTimeout) {
    const timeout = init?.timeout ?? Number(Config.get('DEFAULT_FETCH_TIMEOUT'))

    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(input, { ...init, signal: controller.signal })

    clearTimeout(id)

    return response
}
