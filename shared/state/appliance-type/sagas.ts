import { call, put } from 'typed-redux-saga'
import { IAction } from '@shared-types'
import { ApplianceTypeApi } from '@api'

import {
    FetchApplianceTypesAction,
    FetchApplianceTypesFailedAction,
    FetchApplianceTypesSuccessAction
} from './actions'

export function* fetchApplianceTypes (action: IAction<FetchApplianceTypesAction>, applianceTypeApi?: ApplianceTypeApi) {
    const api = applianceTypeApi || new ApplianceTypeApi()
    const selectedDesco = action.payload.desco

    const products = yield* call([api, api.getAllFromDesco], selectedDesco.descoPk)

    if (products instanceof Error) {
        yield* put(new FetchApplianceTypesFailedAction(products).create())
        return
    }

    yield* put(new FetchApplianceTypesSuccessAction(products).create())
}
