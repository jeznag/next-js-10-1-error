import { call, select, put, take, race } from 'typed-redux-saga'
import { Logger } from '@services'
import { IAction } from '@shared-types'
import { UserApi, Desco } from '@api'

import {
    SetExternalUserAction,
    FetchUsersAction,
    FetchUsersSuccessAction,
    FetchUsersFailedAction
} from './actions'
import { getUserState } from '../state-selectors'

export function* updateUserLastLogin (action: IAction<SetExternalUserAction>, userApi?: UserApi) {
    const userPk = action.payload.externalUser.userPk

    const api = userApi || new UserApi()

    const success = yield* call([api, api.updateUsersLastLogin], userPk)

    if (success instanceof Error) {
        // Error in updating the user's last login should not
        // prevent the user from logging in.
        Logger.error(success)
    }
}

export function* fetchUsers (action: IAction<FetchUsersAction>, userApi?: UserApi) {
    const desco = action.payload.desco
    const api = userApi || new UserApi()

    const users = yield* call([api, api.getUsersFromDesco], desco.descoPk)

    if (users instanceof Error) {
        yield* put(new FetchUsersFailedAction(users).create())
        return
    }

    yield* put(new FetchUsersSuccessAction(users).create())
}

export function* getUsers (desco: Desco) {
    const userState = yield* select(getUserState)

    if (userState.isReloadRequired) {
        yield* put(new FetchUsersAction(desco).create())
        const { success, failed } = yield* race({
            success: take<IAction<FetchUsersSuccessAction>>(FetchUsersSuccessAction.name),
            failed: take<IAction<FetchUsersFailedAction>>(FetchUsersFailedAction.name)
        })

        if (failed) {
            return failed.payload.error
        } else if (success) {
            return success.payload.users
        } else {
            const error = new Error('Fetching users neither failed or succeeded.')
            Logger.error(error)
            return error
        }
    } else {
        return userState.users
    }
}
