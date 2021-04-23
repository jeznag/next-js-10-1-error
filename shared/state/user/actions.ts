import { Status, ActionPayload, UserType, ActiveUser } from '@shared-types'
import { ExternalUser, Desco } from '@api'

export type UserState = {
    activeUser: ActiveUser
    users: ExternalUser[]
    isReloadRequired: boolean
    currentStatus: Status
    error?: Error,
}

export const defaultUserState: UserState = {
    activeUser: {
        type: UserType.Unknown,
        email: '',
        externalUser: undefined,
        currentLocation: undefined
    },
    users: [],
    isReloadRequired: true,
    currentStatus: Status.Idle
}

export const isUserAction = (payload: any): payload is UserActionPayload => {
    return payload?.stateName === 'user'
}

export class UserActionPayload extends ActionPayload<UserState> {
    protected readonly _stateName = 'user'
}

export class SetExternalUserAction extends UserActionPayload {
    constructor (public readonly externalUser: ExternalUser) { super() }

    public reduce (state: UserState): UserState {
        return {
            ...state,
            activeUser: {
                type: UserType.External,
                externalUser: this.externalUser,
                email: this.externalUser.email
            }
        }
    }
}

export class SetInternalUserAction extends UserActionPayload {
    constructor (public readonly email: string) { super() }

    public reduce (state: UserState): UserState {
        return {
            ...state,
            activeUser: {
                type: UserType.Internal,
                email: this.email
            }
        }
    }
}

export class FetchUsersAction extends UserActionPayload {
    constructor (public readonly desco: Desco) { super() }

    public reduce (state: UserState): UserState {
        return { ...state, currentStatus: Status.InProgress }
    }
}

export class FetchUsersSuccessAction extends UserActionPayload {
    constructor (public readonly users: ExternalUser[]) { super() }

    public reduce (state: UserState): UserState {
        return {
            ...state,
            users: this.users,
            isReloadRequired: false,
            currentStatus: Status.Success
        }
    }
}

export class FetchUsersFailedAction extends UserActionPayload {
    constructor (public readonly error: Error) {
        super()
        this.error = error
    }

    public reduce (state: UserState): UserState {
        return {
            ...state,
            error: this.error,
            isReloadRequired: true,
            currentStatus: Status.Failed
        }
    }
}

export class SetUserReloadRequired extends UserActionPayload {
    constructor (public readonly isReloadRequired: boolean) {
        super()
    }

    public reduce (state: UserState): UserState {
        return {
            ...state,
            isReloadRequired: this.isReloadRequired
        }
    }
}
