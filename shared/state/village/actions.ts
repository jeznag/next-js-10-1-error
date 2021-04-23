import { ActionPayload, Status } from '@shared-types'
import { Village, Desco, UpdatableVillageProperties } from '@api'

export interface VillageState {
    villages: Array<Village>
    selectedVillage?: Village
    currentStatus: Status
    currentProcess: VillageStateProcess
    error?: Error
}

export enum VillageStateProcess {
    Idle = 'Idle',
    Update = 'Update'
}

export const defaultVillageState: VillageState = {
    villages: [],
    selectedVillage: undefined,
    currentStatus: Status.Idle,
    currentProcess: VillageStateProcess.Idle
}

export const isVillageAction = (payload: any): payload is VillageActionPayload => {
    return payload?.stateName === 'village'
}

export abstract class VillageActionPayload extends ActionPayload<VillageState> {
    protected readonly _stateName = 'village'
}

export class FetchAllVillagesFromDescoAction extends VillageActionPayload {
    constructor (public readonly desco: Desco) { super() }
}

export class FetchAllVillagesFromDescoSuccessAction extends VillageActionPayload {
    constructor (public readonly villages: Village[]) { super() }

    public reduce (state: VillageState): VillageState {
        return {
            ...state,
            villages: this.villages,
            // If the villages change, set first village from the list as selected village.
            selectedVillage: this.villages.length > 0 ? this.villages[0] : undefined
        }
    }
}

export class FetchAllVillagesFromDescoFailedAction extends VillageActionPayload {
    public readonly error: Error | undefined

    constructor (error: Error) {
        super()
        this.error = error
    }

    public reduce (state: VillageState): VillageState {
        return { ...state, error: this.error }
    }
}

export class UpdateVillageAction extends VillageActionPayload {
    public readonly currentStatus = Status.InProgress
    constructor (public readonly updateParams: UpdatableVillageProperties) { super() }

    public reduce (state: VillageState): VillageState {
        return {
            ...state,
            currentStatus: this.currentStatus,
            currentProcess: VillageStateProcess.Update
        }
    }
}

export class UpdateVillageSuccessAction extends VillageActionPayload {
    public readonly currentStatus = Status.Success

    constructor (public readonly updatedVillage: Village) { super() }

    public reduce (state: VillageState): VillageState {
        const villages = state.villages.map(villages =>
            this.updatedVillage.villagePk === villages.villagePk ? this.updatedVillage : villages
        )

        return { ...state, villages, currentStatus: this.currentStatus }
    }
}

export class UpdateVillageFailedAction extends VillageActionPayload {
    public readonly currentStatus = Status.Failed
    constructor (public readonly error: Error) { super() }

    public reduce (state: VillageState): VillageState {
        return {
            ...state,
            error: this.error,
            currentStatus: this.currentStatus
        }
    }
}

export class SelectVillageAction extends VillageActionPayload {
    constructor (public readonly village?: Village) { super() }

    public reduce (state: VillageState): VillageState {
        return { ...state, selectedVillage: this.village, error: undefined }
    }
}

export class SetVillagesAction extends VillageActionPayload {
    constructor (public readonly villages: Village[]) { super() }

    public reduce (state: VillageState): VillageState {
        return { ...state, villages: this.villages, error: undefined }
    }
}
