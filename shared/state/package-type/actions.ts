import { Status, ActionPayload } from '@shared-types'
import { PackageType, Desco } from '@services/api'

export type PackageTypeState = {
    isReloadRequired: boolean
    packageTypes: Array<PackageType>
    currentStatus: Status
    error?: Error
}

export const defaultPackageTypeState: PackageTypeState = {
    isReloadRequired: true,
    packageTypes: [],
    currentStatus: Status.Idle
}

export const isPackageTypeAction = (payload: any): payload is PackageTypeActionPayload => {
    return payload?.stateName === 'package-type'
}

export abstract class PackageTypeActionPayload extends ActionPayload<PackageTypeState> {
    protected readonly _stateName = 'package-type'
}

export class FetchPackageTypesAction extends PackageTypeActionPayload {
    constructor (public readonly desco: Desco) { super() }

    public reduce (state: PackageTypeState): PackageTypeState {
        return { ...state, currentStatus: Status.InProgress }
    }
}

export class FetchPackageTypesSuccessAction extends PackageTypeActionPayload {
    constructor (public readonly packageTypes: PackageType[]) { super() }

    public reduce (state: PackageTypeState): PackageTypeState {
        return {
            ...state,
            packageTypes: this.packageTypes,
            isReloadRequired: false,
            currentStatus: Status.Success
        }
    }
}

export class FetchPackageTypesFailedAction extends PackageTypeActionPayload {
    constructor (public readonly error: Error) {
        super()
        this.error = error
    }

    public reduce (state: PackageTypeState): PackageTypeState {
        return {
            ...state,
            error: this.error,
            isReloadRequired: true,
            currentStatus: Status.Failed
        }
    }
}

export class SetPackageTypeReloadRequired extends PackageTypeActionPayload {
    constructor (public readonly isReloadRequired: boolean) { super() }

    public reduce (state: PackageTypeState): PackageTypeState {
        return {
            ...state,
            isReloadRequired: this.isReloadRequired
        }
    }
}
