import passport from 'koa-passport'
import util from 'util'
import querystring from 'querystring'
import { URL } from 'url'
import { Context, Middleware } from 'koa'
import {
    ExtraVerificationParams,
    Profile,
    Strategy as Auth0Strategy,
    StrategyOption,
    VerifyFunction
} from 'passport-auth0'
import { IncomingMessage } from 'http'
import {
    Logger,
    PublicRoute,
    ErrorRoute,
    UserService,
    Route
} from '@services'
import { ExternalUser, SupportedLanguageCodes } from '@api'
import { PublicRoutes, ErrorRoutes } from '@utils'
import { ActiveUser, Constants, UserType } from '@shared-types'

interface UserApi {
    getUserFromEmail: (
        email: string,
        includeDeletedUsers?: boolean
    ) => Promise<ExternalUser | undefined | Error>
}

type Auth0User = {
    id: string
    displayName: string
    _json: {
        email: string
    }
}

type UserData = {
    id: string
    name: string
    email: string
    language?: string
}

type ExtraVerificationParamsWithJWT = ExtraVerificationParams & {
    // eslint-disable-next-line camelcase
    id_token: string
}

type AuthControllerOptions = {
    auth0Domain: string,
    auth0ClientId: string,
    auth0ClientSecret: string,
    redirectInternalUrl: string | Route,
    redirectExternalUrl: string | Route,
    clientUrl: string,
    clientPort: number,
    jwtCookieName?: string
}

export class AuthController {
    private readonly options: AuthControllerOptions
    private readonly userApi: UserApi

    constructor (options: AuthControllerOptions, userApi: UserApi) {
        this.options = options
        this.userApi = userApi
    }

    public configAuthMiddleware (): Array<Middleware> {
        const authConfig: StrategyOption = {
            domain: this.options.auth0Domain,
            clientID: this.options.auth0ClientId,
            clientSecret: this.options.auth0ClientSecret,
            callbackURL: `${this.options.clientUrl}:${this.options.clientPort}${PublicRoutes.LoginCallback.getPath()}`
        }

        // accessToken is the token to call Auth0 API (not needed in the most cases)
        // extraParams.id_token has the JSON Web Token
        // profile has all the information from the user
        const verifyFunc: VerifyFunction = (accessToken: string, refreshToken: string, extraParams: ExtraVerificationParams, profile: Profile, callback: (error: Error | null, user: Profile, jwtToken: string) => void) => {
            const jsonWebToken = (extraParams as ExtraVerificationParamsWithJWT).id_token

            return callback(null, profile, jsonWebToken)
        }

        passport.use(new Auth0Strategy(authConfig, verifyFunc))

        passport.deserializeUser(async (
            req: IncomingMessage,
            userData: UserData,
            done: (err: any, user: ActiveUser | ErrorRoute | PublicRoute) => void
        ) => {
            if (!userData) return done(null, ErrorRoutes.InternalServerError)

            const userEmail = userData.email
            if (UserService.isInternalUser(userEmail)) {
                const user: ActiveUser = {
                    type: UserType.Internal,
                    email: userEmail,
                    // Internal user default language is English
                    language: SupportedLanguageCodes.English
                }
                return done(null, user)
            }

            const externalUser = await this.userApi.getUserFromEmail(userEmail)

            if (externalUser === undefined) return done(null, ErrorRoutes.Unauthorised)
            if (externalUser instanceof Error) return done(null, ErrorRoutes.NotAvailable)

            const user: ActiveUser = {
                type: UserType.External,
                externalUser: externalUser,
                email: externalUser.email,
                language: externalUser.language
            }
            return done(null, user)
        })

        return [
            passport.initialize(),
            passport.session()
        ]
    }

    public ensureAuth (ctx: Context, next: () => Promise<void>) {
        if (ctx.isAuthenticated()) return next()

        // Save intended path before authentication
        if (ctx.session) ctx.session.redirectRoute = ctx.originalUrl

        ctx.redirect(PublicRoutes.Login.getPath())
    }

    public async ensureInternalUser (ctx: Context, next: () => Promise<void>) {
        const userEmail = ctx.state?.user?.email

        if (userEmail && UserService.isInternalUser(userEmail)) {
            return next()
        }

        ctx.redirect(ErrorRoutes.Unauthorised.getPath())
    }

    public async handleLogin (ctx: Context, next: () => Promise<void>) {
        const authMiddleware = passport.authenticate('auth0', {
            scope: 'openid email profile',
            prompt: 'login'
        })
        return authMiddleware(ctx, next)
    }

    public async handleCallback (ctx: Context, next: (data?: any) => Promise<void>) {
        const authMiddleware = passport.authenticate('auth0', async (err, user, authResponse) => {
            if (err || ['unauthorised', 'unauthorized'].includes(authResponse)) {
                ctx.logout()
                return ctx.redirect(ErrorRoutes.Unauthorised.getPath())
            }

            if (!user) return ctx.redirect(PublicRoutes.Login.getPath())

            // save JWT in cookie to pass to grafana auth proxy
            const jwtExpiresIn = 1000 * 60 * 60 * 24 * 30 // 30 days
            const jsonWebToken = authResponse

            const clientUrl = new URL(this.options.clientUrl)
            const harvestDomainName = clientUrl.host

            if (this.options.jwtCookieName !== undefined) {
                ctx.cookies.set(this.options.jwtCookieName, jsonWebToken, {
                    maxAge: jwtExpiresIn,
                    httpOnly: true,
                    sameSite: 'strict',
                    domain: harvestDomainName
                })
            }

            ctx.status = 201
            ctx.body = { success: true }

            try {
                await ctx.login(user)
            } catch (err) {
                return next(err)
            }

            // Redirect to the intended path prior
            // to the authentication
            if (ctx.session && ctx.session.redirectRoute) {
                const redirectRoute = ctx.session.redirectRoute
                delete ctx.session.redirectRoute

                return ctx.redirect(redirectRoute)
            }

            return ctx.redirect('/')
        })
        return authMiddleware(ctx, next)
    }

    public async redirectToValidUrl (ctx: Context) {
        const activeUser = ctx.state.user

        if (activeUser === undefined) {
            // return ctx.redirect(ErrorRoutes.InternalServerError.getPath())
            return
        }

        if (!UserService.isActiveUser(activeUser)) {
            return ctx.redirect(activeUser.getPath())
        }

        if (activeUser.type === UserType.Unknown) {
            // return ctx.redirect(ErrorRoutes.InternalServerError.getPath())
        }

        if (activeUser.type === UserType.Internal) {
            const internalRoute = typeof this.options.redirectInternalUrl === 'string'
                ? this.options.redirectInternalUrl
                : this.options.redirectInternalUrl.replaceDynamicRoutes([Constants.OKRA_DESCO_NAME.toLowerCase()])
            return ctx.redirect(internalRoute)
        }

        if (!activeUser.externalUser) {
            Logger.error(new Error('User not found.'))
            // return ctx.redirect(ErrorRoutes.InternalServerError.getPath())
            return
        }

        const externalRoute = typeof this.options.redirectExternalUrl === 'string'
            ? this.options.redirectExternalUrl
            : this.options.redirectExternalUrl.replaceDynamicRoutes([activeUser.externalUser.descoUrlSlug])
        return ctx.redirect(externalRoute)
    }

    public async handleLogout (ctx: Context) {
        ctx.logout()

        const logoutRedirect = `${this.options.clientUrl}:${this.options.clientPort}`

        const logoutURL = new URL(
            util.format('https://%s/v2/logout', this.options.auth0Domain)
        )

        const searchString = querystring.stringify({
            client_id: this.options.auth0ClientId,
            returnTo: logoutRedirect
        })

        logoutURL.search = searchString

        ctx.redirect(logoutURL.toString())
    }

    public ensureNonMatchingPathIsValid (ctx: Context, next: () => Promise<void>) {
        // Note: https://github.com/ZijianHe/koa-router/issues/231
        // Koa router has an issue where it matches all overlapping paths
        // e.g. '/users/' and '/[invalid-path]' would match. So as a
        // workaround, if there is any '/['path-name']' structure that would
        // match with `PublicRoutes.All` it will be considered invalid.
        const invalidRegex = /^\/[^/.]+$/
        if (ctx.request.url.match(invalidRegex)) {
            return ctx.redirect(ErrorRoutes.NotFound.getPath())
        }

        return next()
    }
}
