import next from 'next'
import Server from 'next/dist/next-server/server/next-server'
import { Context } from 'koa'
import { IncomingMessage, ServerResponse } from 'http'
import { UrlWithParsedQuery } from 'url'

export class NextApp {
    private readonly app: Server
    private readonly requestHandler: (
        req: IncomingMessage,
        res: ServerResponse,
        parsedUrl?: UrlWithParsedQuery | undefined
    ) => Promise<void>

    constructor (isDevelopment: boolean) {
        this.app = next({ dev: isDevelopment })
        this.requestHandler = this.app.getRequestHandler()
    }

    public async init () {
        await this.app.prepare()
    }

    public async render (ctx: Context): Promise<void> {
        await this.app.render(ctx.req, ctx.res, ctx.path, ctx.query)
        ctx.respond = false
    }

    public async renderError (ctx: Context): Promise<void> {
        const statusCode = parseInt(ctx.params.error_code, 10)

        ctx.res.statusCode = Number.isNaN(statusCode) ? 400 : statusCode
        await this.app.render(ctx.req, ctx.res, '/_error')
        ctx.respond = false
    }

    public async handleRequest (ctx: Context): Promise<void> {
        await this.requestHandler(ctx.req, ctx.res)
        ctx.respond = false
    }
}
