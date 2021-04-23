import { runSaga, stdChannel } from 'redux-saga'
import { Dictionary, IAction, ActionPayload } from '@shared-types'
import { HttpClient } from '@services/HttpClient'

type ResponseErrorType = {
    error: {
        code: string
        errno: number
        sqlMessage: string
        sqlState: string
        index: number
        sql: string
    }
}

export type ResponseType<T = Dictionary> = Error
| ResponseErrorType
| string
| Dictionary<string | number | string[] | number[]>
| Dictionary<string | number | string[] | number[]>[][]
| Dictionary<string | number | string[] | number[]>[]
| T[]

export function expectHttpResponses<T = Dictionary> (responses: ResponseType<T>[]) {
    let httpGetMock = jest.spyOn(HttpClient.prototype, 'get')

    // This allows us to chain multiple mock responses from the Http Client
    for (const response of responses) {
        httpGetMock = httpGetMock.mockResolvedValueOnce(response)
    }
}

export function expectHttpPostResponses (responses: ResponseType[]) {
    let httpPostMock = jest.spyOn(HttpClient.prototype, 'post')

    // This allows us to chain multiple mock responses from the Http Client
    for (const response of responses) {
        httpPostMock = httpPostMock.mockResolvedValueOnce(response)
    }
}

export function expectHttpPatchResponses (responses: ResponseType[]) {
    let httpPatchMock = jest.spyOn(HttpClient.prototype, 'patch')

    // This allows us to chain multiple mock responses from the Http Client
    for (const response of responses) {
        httpPatchMock = httpPatchMock.mockResolvedValueOnce(response)
    }
}

export function expectHttpDeleteResponses (responses: ResponseType[]) {
    let httpDeleteMock = jest.spyOn(HttpClient.prototype, 'delete')

    // This allows us to chain multiple mock responses from the Http Client
    for (const response of responses) {
        httpDeleteMock = httpDeleteMock.mockResolvedValueOnce(response)
    }
}

export class SagaRunner<State = any, Payload = ActionPayload<State>> {
    private readonly saga: (...args: any[]) => any
    private readonly sagaArgs: any[]
    private state: Dictionary = {}
    private awaitedActions: IAction<Payload>[] = []

    constructor (saga: (...args: any[]) => any, ...sagaArgs: any[]) {
        this.saga = saga
        this.sagaArgs = sagaArgs
    }

    public addState (state: Dictionary) {
        this.state = state
    }

    public addActionForDispatch (action: IAction<Payload>) {
        this.awaitedActions.push(action)
    }

    public async run (): Promise<Array<IAction<Payload>>> {
        // The channel enables you to mimic another saga
        // dispatching an action that your provided saga
        // is dependent on.
        const channel = this.awaitedActions.length > 0 ? stdChannel() : undefined
        const dispatched: Array<IAction<Payload>> = []

        const runningSaga = runSaga(
            {
                dispatch: (action: IAction<Payload>) =>
                    dispatched.push(action),
                getState: () => this.state,
                ...channel && { channel }
            },
            this.saga,
            ...this.sagaArgs
        ).toPromise()

        if (channel) {
            for (const action of this.awaitedActions) {
                channel.put(action)
            }
        }

        await runningSaga

        return dispatched
    }
}
