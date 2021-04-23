import { DateTime, DurationUnit, Duration } from 'luxon'

export class DateRange {
    private readonly _startDate: DateTime
    private readonly _endDate: DateTime

    constructor (startDate: DateTime, endDate: DateTime) {
        this._startDate = startDate
        this._endDate = endDate
    }

    public get startDate () {
        return this._startDate
    }

    public get endDate () {
        return this._endDate
    }

    /**
     * Breaks the current DateRange object into an array of DateRanges
     * depending on the provided duration. Most likely the date range
     * would not be exactly broken into the given duration. The spilled
     * date range would be added into the last entry e.g. 2 weeks and 3 days
     * [1 week, 1 week, 3 days ]. If the date range is shorter than the
     * duration provided it would return itself.
     * @param unit
     * @param length
     */
    public break (unit: DurationUnit, length: number) {
        const duration = Duration.fromObject({ [`${unit}`]: length })
        const interval = this._startDate.until(this._endDate)
        const dateRanges: DateRange[] = []

        if (interval.length(unit) < length) {
            return [this]
        }

        let currentStartDate = this._startDate
        let currentEndDate = this._startDate.plus(duration)

        while (currentEndDate < this._endDate) {
            dateRanges.push(new DateRange(currentStartDate, currentEndDate))

            currentStartDate = currentEndDate
            currentEndDate = currentEndDate.plus(duration)

            if (currentEndDate > this._endDate) {
                currentEndDate = currentEndDate.minus(duration)
                dateRanges.push(new DateRange(currentEndDate, this._endDate))
                break
            }
        }

        return dateRanges
    }
}
