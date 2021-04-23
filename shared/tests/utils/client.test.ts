/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @jest-environment node
 */

/* eslint-disable camelcase */

// See server.test.ts for the relevance of
// setting @jest-environment to node.
import { DateTime } from 'luxon'

import {
    getTimePassed,
    capitalize,
    toCamelCase,
    objectToCamelCase
} from '@utils'

describe('Testing helper functions', () => {
    describe('capitalize()', () => {
        it('should return capilized string', () => {
            const expected = 'Seashells'

            const actual = capitalize('seashells')
            expect(actual).toStrictEqual(expected)
        })
    })

    describe('toCamelCase()', () => {
        it('should convert strings from kebab case to camel case', () => {
            const expected = 'theQuickBrownFox'

            const actual = toCamelCase('the-Quick-Brown-fox')
            expect(actual).toStrictEqual(expected)
        })

        it('should convert strings from snake case to camel case', () => {
            const expected = 'theLazyDog'

            const actual = toCamelCase('the_lazy_Dog')
            expect(actual).toStrictEqual(expected)
        })
    })

    describe('objectToCamelCase', () => {
        it('should convert snake case keys to camel case', () => {
            const testObject = {
                sea_shells: 'She sells seashells on the seashore',
                the_quick_brown_fox: {
                    the_lazy_dog: 'The quick brown fox jumps over the lazy dog.'
                }
            }

            const expected = {
                seaShells: 'She sells seashells on the seashore',
                theQuickBrownFox: {
                    theLazyDog: 'The quick brown fox jumps over the lazy dog.'
                }
            }

            const actual = objectToCamelCase(testObject)

            expect(actual).toStrictEqual(expected)
        })

        it('should convert kebab case keys to camel case', () => {
            const testObject = {
                'sea-shells': 'She sells seashells on the seashore',
                'the-quick-brown-fox': {
                    'the-lazy-dog': 'The quick brown fox jumps over the lazy dog.'
                }
            }

            const expected = {
                seaShells: 'She sells seashells on the seashore',
                theQuickBrownFox: {
                    theLazyDog: 'The quick brown fox jumps over the lazy dog.'
                }
            }

            const actual = objectToCamelCase(testObject)

            expect(actual).toStrictEqual(expected)
        })
    })

    describe('getTimePassed()', () => {
        const MOCK_DATE_TODAY = DateTime.fromISO('2019-03-11T01:24:38.000Z', { zone: 'utc' })

        // Reference: https://jestjs.io/docs/en/api#testeachtablename-fn-timeout
        test.each([
            ['< 1 minute ago', '2019-03-11T01:23:40.000Z'],
            ['< 1 minute ago', '2019-03-11T01:24:35.000Z'],
            ['< 1 minute ago', '2019-03-11T01:24:09.000Z'],
            ['4 minutes ago', '2019-03-11T01:20:36.000Z'],
            ['3 hours ago', '2019-03-10T22:24:38.000Z'],
            ['4 days ago', '2019-03-06T21:24:38.000Z'],
            ['2 months ago', '2019-01-02T22:24:38.000Z'],
            ['3 years ago', '2016-01-02T22:23:38.000Z']
        ])('should return %s', (expected: string, mockDateStr: string) => {
            const mockDate = DateTime.fromISO(mockDateStr, { zone: 'utc' })

            const actual = getTimePassed(mockDate, MOCK_DATE_TODAY)

            expect(actual).toStrictEqual(expected)
        })
    })
})
