import { Store } from 'redux'

import { Config, Logger, ErrorRoute } from '@services'
import { ActiveUser, UserType, Constants } from '@shared-types'
import { ErrorRoutes } from '@utils'
import { SetExternalUserAction, SetInternalUserAction } from '@state'

/**
 * Contains shared static methods that deals with user
 * management. Once redux-saga actions has been moved
 * to the shared package as well, we'll merge the UserManagement
 * class with this class.
 */
export class UserService {
    public setActiveUser (user: ActiveUser, store: Store, descoSlug?: string): ErrorRoute | undefined {
        // First, setup the user
        switch (user.type) {
            case UserType.Internal:
                store.dispatch(new SetInternalUserAction(user.email).create())
                break
            case UserType.External:
                if (user.externalUser === undefined) return ErrorRoutes.InternalServerError
                if (!descoSlug || descoSlug !== user.externalUser.descoUrlSlug) return ErrorRoutes.Unauthorised
                store.dispatch(new SetExternalUserAction(user.externalUser).create())
                break
            default:
                Logger.error(new Error(`Invalid user: ${user.email}`))
                return ErrorRoutes.InternalServerError
        }
    }

    public static isInternalUser (email: string): boolean {
        return email.toLowerCase().endsWith('@okrasolar.com') || email === Config.get('CYPRESS_INTERNAL_USER')
    }

    // User state type guard
    // Reference: https://basarat.gitbook.io/typescript/type-system/typeguard
    public static isActiveUser (user: any): user is ActiveUser {
        return user !== undefined && user.type !== undefined && user.email !== undefined
    }

    public static getDescoSlug (user: ActiveUser) {
        if (UserService.isInternalUser(user.email)) {
            return Constants.OKRA_DESCO_NAME.toLowerCase()
        }

        const externalUser = user.externalUser

        if (!externalUser) throw new Error('External user not found.')

        return externalUser.descoUrlSlug
    }
}
