import { Coords } from 'shared/types'
import { GridLine } from 'shared/services/api'

export type GridLineCoords = [ Coords, Coords ]

export const createGridlineParams = (
    gridlines: GridLine[], selectedVillagePk: number
): GridLineCoords[] => {
    return gridlines.flatMap<GridLineCoords>(gridLine => {
        const isValidGridLine = gridLine.villagePk === selectedVillagePk

        return isValidGridLine
            ? [[{ lat: gridLine.latitudeA, lng: gridLine.longitudeA }, { lat: gridLine.latitudeB, lng: gridLine.longitudeB }]]
            : []
    })
}
