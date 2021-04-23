import { Status, ActionPayload } from '@shared-types'
import { ApplianceType, Desco } from '@services/api'

export type ApplianceTypeState = {
    isReloadRequired: boolean
    applianceTypes: Array<ApplianceType>
    currentStatus: Status
    error?: Error
}

export const defaultApplianceTypeState: ApplianceTypeState = {
    isReloadRequired: true,
    applianceTypes: [],
    currentStatus: Status.Idle
}

export const isApplianceTypeAction = (payload: any): payload is ApplianceTypeActionPayload => {
    return payload?.stateName === 'appliance-type'
}

export abstract class ApplianceTypeActionPayload extends ActionPayload<ApplianceTypeState> {
    protected readonly _stateName = 'appliance-type'
}

export class FetchApplianceTypesAction extends ApplianceTypeActionPayload {
    constructor (public readonly desco: Desco) { super() }

    public reduce (state: ApplianceTypeState): ApplianceTypeState {
        return { ...state, currentStatus: Status.InProgress }
    }
}

export class FetchApplianceTypesSuccessAction extends ApplianceTypeActionPayload {
    constructor (public readonly applianceTypes: ApplianceType[]) { super() }

    public reduce (state: ApplianceTypeState): ApplianceTypeState {
        return {
            ...state,
            applianceTypes: this.applianceTypes,
            isReloadRequired: false,
            currentStatus: Status.Success
        }
    }
}

export class FetchApplianceTypesFailedAction extends ApplianceTypeActionPayload {
    constructor (public readonly error: Error) {
        super()
        this.error = error
    }

    public reduce (state: ApplianceTypeState): ApplianceTypeState {
        return {
            ...state,
            error: this.error,
            isReloadRequired: true,
            currentStatus: Status.Failed
        }
    }
}

export class SetApplianceTypeReloadRequired extends ApplianceTypeActionPayload {
    constructor (public readonly isReloadRequired: boolean) { super() }

    public reduce (state: ApplianceTypeState): ApplianceTypeState {
        return {
            ...state,
            isReloadRequired: this.isReloadRequired
        }
    }
}
