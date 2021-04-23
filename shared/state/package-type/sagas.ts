import { call, put } from 'typed-redux-saga'
import { IAction } from '@shared-types'
import { PackageTypeApi } from '@api'

import {
    FetchPackageTypesAction,
    FetchPackageTypesFailedAction,
    FetchPackageTypesSuccessAction
} from './actions'

export function* fetchPackageTypes (
    action: IAction<FetchPackageTypesAction>,
    applianceTypeApi?: PackageTypeApi
) {
    const api = applianceTypeApi || new PackageTypeApi()
    const selectedDesco = action.payload.desco

    const products = yield* call([api, api.getAllFromDesco], selectedDesco.descoPk)

    if (products instanceof Error) {
        yield* put(new FetchPackageTypesFailedAction(products).create())
        return
    }

    yield* put(new FetchPackageTypesSuccessAction(products).create())
}
