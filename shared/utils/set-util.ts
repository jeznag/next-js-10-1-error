export class SetUtil {
    /**
     * Create a set that contains those elements of arrayOne that are also in arrayTwo.
     * @param arrayOne
     * @param arrayTwo
     */
    public static intersection (arrayOne: any[], arrayTwo: any[]) {
        return new Set([...arrayOne].filter(value => arrayTwo.includes(value)))
    }

    /**
     * Create a set that contains those elements of arrayOne that are not in set arrayTwo
     * @param arrayOne
     * @param arrayTwo
     */
    public static difference (arrayOne: any[], arrayTwo: any[]) {
        const difference = new Set(arrayOne)

        for (const value of arrayTwo) {
            difference.delete(value)
        }

        return difference
    }
}
