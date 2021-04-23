import { ActionPayload } from '@shared-types'
import { Desco } from '@services/api'

export interface DescoState {
    descos: Array<Desco>
    selectedDesco: Desco
    error?: Error
}

export const defaultDescoState: DescoState = {
    descos: [],
    selectedDesco: {
        descoPk: 0,
        name: '',
        urlSlug: ''
    }
}

export const isDescoAction = (payload: any): payload is DescoActionPayload => {
    return payload?.stateName === 'desco'
}

export abstract class DescoActionPayload extends ActionPayload<DescoState> {
    protected readonly _stateName = 'desco'
}

export class FetchAllDescosAction extends DescoActionPayload { }

export class FetchAllDescosSuccessAction extends DescoActionPayload {
    constructor (public readonly descos: Desco[]) { super() }

    public reduce (state: DescoState): DescoState {
        return { ...state, descos: this.descos }
    }
}

export class FetchAllDescosFailedAction extends DescoActionPayload {
    public readonly error: Error

    constructor (error: Error) {
        super()
        this.error = error
    }

    public reduce (state: DescoState): DescoState {
        return { ...state, error: this.error }
    }
}

export class SelectDescoAction extends DescoActionPayload {
    constructor (public readonly desco: Desco) { super() }

    public reduce (state: DescoState): DescoState {
        return { ...state, selectedDesco: this.desco }
    }
}
