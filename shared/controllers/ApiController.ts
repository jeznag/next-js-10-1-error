import { Context } from 'koa'
import { Config } from 'shared/services'

export class ApiController {
    public static async buildUrl (ctx: Context, next: () => Promise<any>) {
        // TECHDEBT: TODO: Once the user is authenticated, they can abuse the api in their browser.
        // They essentially have access to every endpoint. We need to add some authorisation here.
        // which prevents a user from sending API requests which don't match their DESCO

        const endpoint = ctx.request.url.match(/\/api\/.+$/g)

        if (!endpoint) {
            ctx.throw('Requested API endpoint cannot be found.', 500)
            return
        }

        const serverUrl = `${Config.get('OKRA_API_URL')}:${Config.get('OKRA_API_PORT')}${endpoint}`

        ctx.request.url = serverUrl
        return next()
    }
}
