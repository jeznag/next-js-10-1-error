import { call, put, select, race, take } from 'typed-redux-saga'
import { Logger } from '@services'
import { IAction } from '@shared-types'
import { ConsumerApi, Village } from '@api'

import {
    FetchConsumersAction,
    FetchConsumersFailedAction,
    FetchConsumersSuccessAction
} from './actions'
import { getConsumerState } from '../state-selectors'

export function* fetchConsumers (action: IAction<FetchConsumersAction>, consumerApi?: ConsumerApi) {
    const api = consumerApi || new ConsumerApi()
    const villages = action.payload.villages

    const consumers = yield* call([api, api.getAllFromVillages], villages)

    if (consumers instanceof Error) {
        yield* put(new FetchConsumersFailedAction(consumers).create())
        return
    }

    yield* put(new FetchConsumersSuccessAction(consumers).create())
}

export function* getConsumers (villages: Village[]) {
    const consumerState = yield* select(getConsumerState)

    if (consumerState.isReloadRequired) {
        yield* put(new FetchConsumersAction(villages).create())
        const { success, failed } = yield* race({
            success: take<IAction<FetchConsumersSuccessAction>>(FetchConsumersSuccessAction.name),
            failed: take<IAction<FetchConsumersFailedAction>>(FetchConsumersFailedAction.name)
        })

        if (failed) {
            return failed.payload.error
        }

        if (success) {
            return success.payload.consumers
        }

        const error = new Error('Fetching consumers neither failed or succeeded.')
        Logger.error(error)
        return error
    }

    return consumerState.consumers
}
