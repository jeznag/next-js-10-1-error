import { call, put } from 'typed-redux-saga'
import { Action } from 'redux'
import { DescoApi } from '@api'

import {
    FetchAllDescosSuccessAction,
    FetchAllDescosFailedAction
} from './actions'

export function* fetchDescos (_action?: Action, descoApi?: DescoApi) {
    const api = descoApi || new DescoApi()
    const descos = yield* call([api, api.getAll])

    if (descos instanceof Error) {
        yield* put(new FetchAllDescosFailedAction(descos).create())
        return
    }

    yield* put(new FetchAllDescosSuccessAction(descos).create())
}
