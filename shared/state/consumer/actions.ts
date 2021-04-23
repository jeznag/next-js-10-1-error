import { Status, ActionPayload } from '@shared-types'
import {
    ApplianceType,
    Consumer,
    UpdatableApplianceProperties,
    Village
} from '@api'

export enum ConsumerStateProcess {
    Idle = 'Idle',
    Fetch = 'Fetch',
    Update = 'Update'
}

export type ConsumerState = {
    isReloadRequired: boolean
    consumers: Array<Consumer>
    currentStatus: Status
    currentProcess: ConsumerStateProcess
    error?: Error
}

export type ManageApplianceParams = {
    relatedConsumer: Consumer
    updatedAppliances?: UpdatableApplianceProperties[]
    newAppliance?: ApplianceType
}

export const defaultConsumerState: ConsumerState = {
    isReloadRequired: true,
    consumers: [],
    currentStatus: Status.Idle,
    currentProcess: ConsumerStateProcess.Idle
}

export const isConsumerAction = (payload: any): payload is ConsumerActionPayload => {
    return payload?.stateName === 'consumer'
}

export abstract class ConsumerActionPayload extends ActionPayload<ConsumerState> {
    protected readonly _stateName = 'consumer'
}

export class FetchConsumersAction extends ConsumerActionPayload {
    constructor (public readonly villages: Village[]) { super() }

    public reduce (state: ConsumerState): ConsumerState {
        return { ...state, currentStatus: Status.InProgress }
    }
}

export class FetchConsumersSuccessAction extends ConsumerActionPayload {
    constructor (public readonly consumers: Consumer[]) { super() }

    public reduce (state: ConsumerState): ConsumerState {
        return {
            ...state,
            consumers: this.consumers,
            isReloadRequired: false,
            currentStatus: Status.Success
        }
    }
}

export class FetchConsumersFailedAction extends ConsumerActionPayload {
    constructor (public readonly error: Error) { super() }

    public reduce (state: ConsumerState): ConsumerState {
        return {
            ...state,
            error: this.error,
            isReloadRequired: true,
            currentStatus: Status.Failed
        }
    }
}

export class SetConsumerReloadRequired extends ConsumerActionPayload {
    constructor (public readonly isReloadRequired: boolean) { super() }

    public reduce (state: ConsumerState): ConsumerState {
        return { ...state, isReloadRequired: this.isReloadRequired }
    }
}

export class ResetConsumerProcessAction extends ConsumerActionPayload {
    public reduce (state: ConsumerState): ConsumerState {
        return {
            ...state,
            currentStatus: Status.Idle,
            currentProcess: ConsumerStateProcess.Idle
        }
    }
}

export class UpdateConsumerInListAction extends ConsumerActionPayload {
    constructor (public readonly updatedConsumer: Consumer) { super() }

    public reduce (state: ConsumerState): ConsumerState {
        const consumers = state.consumers.map(consumer =>
            this.updatedConsumer.consumerPk === consumer.consumerPk ? this.updatedConsumer : consumer
        )

        return { ...state, consumers, currentStatus: Status.Success }
    }
}
