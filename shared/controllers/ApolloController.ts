import { Context } from 'koa'
import { Config } from '@services'

export class ApolloController {
    public static async buildUrl (ctx: Context, next: () => Promise<any>) {
        const match = ctx.request.url.match(/(?:apollo)(\/.+$)/)

        if (!match || match.length <= 1) {
            ctx.throw('Requested Apollo endpoint cannot be found.', 500)
            return
        }

        const endpoint = match[1]

        ctx.request.url = `${Config.get('APOLLO_API_URL')}:${Config.get('APOLLO_API_PORT')}${endpoint}`

        return next()
    }
}
