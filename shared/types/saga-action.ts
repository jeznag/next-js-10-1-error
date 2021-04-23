import { Action } from 'redux'

export interface IAction<ActionPayload> extends Action<string> {
    type: string
    payload: ActionPayload
}

export abstract class ActionPayload<T> {
    protected readonly _stateName: string = 'action'
    public get stateName () { return this._stateName }
    public reduce (state: T): T { return state }
    public create (): IAction<this> { return { type: this.constructor.name, payload: this } }
}
