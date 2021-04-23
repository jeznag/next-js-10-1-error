import { DateTime } from 'luxon'

import { DateRange } from '@utils'

describe('Testing DateTime', () => {
    it('should break a 4 month and 23 day DateRange into 5 date ranges', () => {
        const endDate = DateTime.fromISO('2019-06-30T16:59:59.000Z')
        const startDate = endDate.minus({ months: 4, days: 23 })
        const dateRange = new DateRange(startDate, endDate)
        const dateRanges = dateRange.break('months', 1)

        const monthOne = dateRanges[0]
        const monthOneInterval = monthOne.startDate.until(monthOne.endDate)

        const monthFive = dateRanges[4]
        const monthFiveInterval = monthFive.startDate.until(monthFive.endDate)

        expect(dateRanges.length).toEqual(5)
        expect(monthOneInterval.length('months')).toEqual(1)
        // start date of the first entry should be the same as the
        // original date range
        expect(monthOne.startDate).toEqual(dateRange.startDate)
        // spilled date range should be the last entry
        expect(monthFiveInterval.length('months')).toBeLessThan(1)
        // end date of the last entry should be the same as the
        // original date range
        expect(monthFive.endDate).toEqual(dateRange.endDate)
    })

    it('should return itself if the date range is less than the duration provided', () => {
        const endDate = DateTime.fromISO('2019-06-30T16:59:59.000Z')
        const startDate = endDate.minus({ days: 10 })
        const dateRange = new DateRange(startDate, endDate)
        const dateRanges = dateRange.break('months', 1)

        const monthOne = dateRanges[0]

        expect(dateRanges.length).toEqual(1)
        expect(monthOne).toEqual(dateRange)
    })
})
