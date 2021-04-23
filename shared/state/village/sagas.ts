import { call, put } from 'typed-redux-saga'
import { Logger } from '@services'
import { CriticalApiError, IAction } from '@shared-types'
import { VillageApi } from '@api'

import {
    FetchAllVillagesFromDescoAction,
    FetchAllVillagesFromDescoSuccessAction,
    FetchAllVillagesFromDescoFailedAction,
    UpdateVillageAction,
    UpdateVillageFailedAction,
    UpdateVillageSuccessAction
} from './actions'

export function* fetchAllVillagesFromDesco (action: IAction<FetchAllVillagesFromDescoAction>, villageApi?: VillageApi) {
    const desco = action.payload.desco
    const api = villageApi || new VillageApi()

    const villages = yield* call([api, api.getAllFromDesco], desco.descoPk)

    if (villages instanceof Error) {
        Logger.error(villages)
        yield* put(new FetchAllVillagesFromDescoFailedAction(villages).create())
        return
    }

    if (villages.length === 0) {
        // Note: Desco should always have villages assigned.
        const error = new CriticalApiError(`Desco doesn't have any assigned villages. Desco name: ${desco.name}.`)
        yield* put(new FetchAllVillagesFromDescoFailedAction(error).create())
        return
    }

    yield* put(new FetchAllVillagesFromDescoSuccessAction(villages).create())
}

export function* updateVillage (action: IAction<UpdateVillageAction>, villageApi?: VillageApi) {
    const updateParams = action.payload.updateParams
    const api = villageApi ?? new VillageApi()

    const result = yield* call([api, api.updateVillage], updateParams)
    const villageKey = updateParams.villageKey

    if (!result || result instanceof Error) {
        const error = result instanceof Error
            ? result
            : new Error(`Village update failed. Village key: ${villageKey}`)

        yield* put(new UpdateVillageFailedAction(error).create())
        return
    }

    // Reload newly created village to update the village list
    const updatedVillage = yield* call([api, api.getFromKey], villageKey)

    if (!updatedVillage || updatedVillage instanceof Error) {
        const error = updatedVillage instanceof Error
            ? updatedVillage
            : new Error(`Village list was not updated. Outdated village key: ${villageKey}`)

        yield* put(new UpdateVillageFailedAction(error).create())
        return
    }

    yield* put(new UpdateVillageSuccessAction(updatedVillage).create())
}
