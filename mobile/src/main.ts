import { Context } from 'koa'
import {
    NextApp,
    ApolloController,
    BaseController,
    AuthController,
    ApiController
} from 'shared/controllers'
import { Env } from 'shared/types'
import { Logger, Server, Config } from 'shared/services'
import { UserApi } from 'shared/services/api'
import { ErrorRoutes, PublicRoutes, UtilityRoutes } from 'shared/utils'
import { PageRoutes } from './lib/utils/routes'

async function main () {
    try {
        const server = new Server({
            sessionCookie: Config.get('MOBILE_SESSION_COOKIE_NAME'),
            secretKeys: [Config.get('AUTH0_SECRET_1'), Config.get('AUTH0_SECRET_2')],
            serverTimeout: Number(Config.get('DEFAULT_SERVER_TIMEOUT')),
            sessionTimeout: Number(Config.get('DEFAULT_SESSION_TIMEOUT'))
        })
        const userApi = new UserApi()
        const authController = new AuthController({
            auth0Domain: Config.get('AUTH0_DOMAIN'),
            auth0ClientId: Config.get('MOBILE_AUTH0_CLIENT_ID'),
            auth0ClientSecret: Config.get('MOBILE_AUTH0_CLIENT_SECRET'),
            redirectInternalUrl: '/',
            redirectExternalUrl: '/',
            clientUrl: Config.get('CLIENT_URL'),
            clientPort: Number(Config.get('CLIENT_PORT', '3002'))
        }, userApi)
        const nextApp = new NextApp(Config.get('NODE_ENV') !== Env.PROD)

        await nextApp.init()

        // Authentication routes
        server.get(PublicRoutes.Login.getPath(), [[authController, authController.handleLogin]])
        server.get(PublicRoutes.LoginCallback.getPath(), [[authController, authController.handleCallback]])
        server.get(PublicRoutes.Logout.getPath(), [[authController, authController.handleLogout]])
        server.get(PublicRoutes.HealthCheck.getPath(), [(ctx: Context) => (ctx.status = 200)])

        // Error routes
        server.all(ErrorRoutes.ErrorIndex.toKoaRoute(), [[nextApp, nextApp.renderError]])

        // Apollo API Routes
        server.all(UtilityRoutes.AllApollo.getPath(), [
            [authController, authController.ensureAuth],
            ApolloController.buildUrl,
            BaseController.forwardRouter
        ])

        // xMySQL API Routes
        server.all(UtilityRoutes.AllApi.getPath(), [
            [authController, authController.ensureAuth],
            ApiController.buildUrl,
            BaseController.forwardRouter
        ])

        // Page Routes
        server.all(
            Object.values(PageRoutes).map(route => route.toKoaRoute()),
            [
                [authController, authController.ensureAuth],
                [nextApp, nextApp.render]
            ]
        )

        // Handle everything else. This enables the page to render properly
        server.get(PublicRoutes.All.getPath(), [
            [authController, authController.ensureNonMatchingPathIsValid],
            [nextApp, nextApp.handleRequest]
        ])

        // Setup middleware in priority order
        server.addSessionMiddleware()
        server.addMiddleware(authController.configAuthMiddleware())
        server.addLoggingMiddleware()

        server.listen(Number(Config.get('SERVER_PORT', '3002')))

        Logger.info(`Server runnning at ${Config.get('SERVER_URL')}:${Config.get('SERVER_PORT', '3002')}`)
        Logger.info(`Visit Harvest Mobile at ${Config.get('CLIENT_URL')}:${Config.get('CLIENT_PORT', '3002')}`)
    } catch (err) {
        Logger.error(err)
        process.exit(1)
    }
}

export default main()
