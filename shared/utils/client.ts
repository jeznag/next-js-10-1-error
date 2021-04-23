import { DateTime, Settings } from 'luxon'
import { Dictionary } from '@shared-types'
import DOMPurify from 'dompurify'


/*
   CLIENT-SIDE HELPER FUNCTIONS
*/

// By default DateTime will fail silently if it fails
// to create a DateTime instance e.g. passing an invalid date.
// We are setting Datetime to throw an exception so that
// we will have access to the stack trace.
// Reference: https://moment.github.io/luxon/docs/manual/validity.html
Settings.throwOnInvalid = true

export function capitalize (str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function toCamelCase (str: string) {
    return str
        .toLowerCase()
        .replace(/[-_]+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .replace(/ (.)/g, function (match) {
            return match.toUpperCase()
        })
        .replace(/ /g, '')
}

export function objectToCamelCase (origObj: Dictionary<any>) {
    return Object.keys(origObj).reduce(function (newObj: Dictionary<any>, key) {
        const val = origObj[key]
        const newVal = typeof val === 'object' ? objectToCamelCase(val) : val
        newObj[toCamelCase(key)] = newVal
        return newObj
    }, {})
}

/**
 * Make a specific text bold by wrapping the <strong> tag. This also sanitizes
 * the passed text to prevent injection attacks. This returns a string so you
 * most like need to use it in conjunction with `dangerouslySetInnerHTML` (not
 * recommended) or `react-html-parser`.
 * e.g.
 * ```javascript
 * makeHighlightedStringBold('hello world', 'world) // returns `hello <strong>world</strong>`
 * ```
 *
 * @param text
 * @param highlightedText
 */
export function makeHighlightedStringBold (text: string, highlightedText: string) {
    const highlightedDataRegex = new RegExp(`(${highlightedText})`)
    const updatedText = text.replace(highlightedDataRegex, '<strong>$1</strong>')

    return DOMPurify.sanitize(updatedText)
}

/**
 * Using DateTime from luxon, we calculate the time passed from a specific past to
 * a specific present. We only created this function to get `< 1 minute ago` to
 * avoid unnecessary information of seconds since the pod is last online. Usually
 * there are only seconds in between before a pod updates when it was last online
 * again.
 */
export function getTimePassed (pastDate: DateTime, presentDate: DateTime = DateTime.utc()): string {
    const timePassed = pastDate.toRelative({ base: presentDate })

    if (!timePassed) {
        throw new Error(`Cannot get time passed for date ${pastDate.toLocaleString(DateTime.DATETIME_FULL)}`)
    }

    if (timePassed.includes('second') || timePassed === '1 minute ago') {
        return '< 1 minute ago'
    }

    return timePassed
}
