import Koa, { Context } from 'koa'
import session from 'koa-session'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'

import { Logger } from '@services'

type RouterMiddleware = Router.Middleware<Context, any>
type ServerMiddleware = Koa.Middleware

export type ServerConfig = {
    secretKeys: string[]
    sessionCookie: string
    serverTimeout: number
    sessionTimeout: number
}

type ClassMiddlewareTuple = [classInstance: unknown, middleware: RouterMiddleware]

export class Server {
    private readonly server: Koa
    private readonly router: Router
    private readonly sessionCookie: string
    private readonly serverTimeout: number
    private readonly sessionTimeout: number

    constructor (config: ServerConfig, server?: Koa, router?: Router) {
        this.server = server || new Koa()
        this.router = router || new Router()
        this.server.keys = config.secretKeys
        this.sessionCookie = config.sessionCookie
        this.serverTimeout = config.serverTimeout
        this.sessionTimeout = config.sessionTimeout
    }

    private processMiddlewares (handlers: Array<RouterMiddleware | ClassMiddlewareTuple>): RouterMiddleware[] {
        const middlewares: RouterMiddleware[] = []
        for (const handler of handlers) {
            if (Array.isArray(handler)) {
                const classInstance = handler[0]
                const middleware = handler[1]
                const bindedMiddleware = middleware.bind(classInstance)

                middlewares.push(bindedMiddleware)
                continue
            }

            middlewares.push(handler)
        }

        return middlewares
    }

    public get (path: string | string[], handlers: Array<RouterMiddleware | ClassMiddlewareTuple>) {
        const middlewares = this.processMiddlewares(handlers)

        this.router.get(path, ...middlewares)
    }

    public post (path: string | string[], handlers: Array<RouterMiddleware | ClassMiddlewareTuple>) {
        const middlewares = this.processMiddlewares(handlers)

        this.router.post(path, ...middlewares)
    }

    public all (path: string | string[], handlers: Array<RouterMiddleware | ClassMiddlewareTuple>) {
        const middlewares = this.processMiddlewares(handlers)

        this.router.all(path, ...middlewares)
    }

    public redirect (source: string, destination: string, statusCode = 301) {
        this.router.redirect(source, destination, statusCode)
    }

    public addSessionMiddleware () {
        this.addMiddleware([this.createSession(), bodyParser()])
    }

    public addLoggingMiddleware () {
        this.addMiddleware([this.loggingMiddleware, this.tryCatchMiddleware])
    }

    public addMiddleware (middlewares: Array<ServerMiddleware>) {
        for (const middleware of middlewares) {
            this.server.use(middleware)
        }
    }

    public listen (port: number) {
        const server = this.server
            .use(this.setDefaultStatusMiddleware)
            .use(this.router.routes())
            .use(this.router.allowedMethods())
            .listen(port)

        server.setTimeout(this.serverTimeout)
    }

    // Returns the session as middleware
    // See koa-session/index.js for more details
    private createSession (): ServerMiddleware {
        const sessionConfig = {
            key: this.sessionCookie,
            maxAge: this.sessionTimeout
        }

        return session(sessionConfig, this.server)
    }

    /**
     * Log every request that comes through the server
     */
    private async loggingMiddleware (ctx: Koa.ParameterizedContext, next: Koa.Next) {
        const start = Date.now()
        await next()
        const durationMilliseconds = Date.now() - start
        Logger.verbose(`${ctx.method} ${ctx.url} - ${durationMilliseconds}ms`)
    }

    /**
     * Reference: https://github.com/koajs/koa/wiki/Error-Handling
     * Catch all server related errors
     */
    private async tryCatchMiddleware (ctx: Koa.ParameterizedContext, next: Koa.Next) {
        try {
            await next()
        } catch (err) {
            Logger.error(err)
            ctx.status = err.status || 500
            ctx.body = err.message
            ctx.app.emit('error', err, ctx)
        }
    }

    /**
     * Koa doesn't do this by default causing requests to return 404 as the default
     * You can see they do this in the official nextjs + koa example
     * https://github.com/vercel/next.js/blob/canary/examples/custom-server-koa/server.js
     * Issue was raised here https://github.com/vercel/next.js/issues/677
     */
    private async setDefaultStatusMiddleware (ctx: Koa.ParameterizedContext, next: Koa.Next) {
        ctx.res.statusCode = 200
        await next()
    }
}
