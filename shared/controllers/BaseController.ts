import { Context } from 'koa'
import { Logger } from '@services'
import { ObjectUtil, fetchWithTimeout } from '@utils'
import { Dictionary } from '@shared-types'

export class BaseController {
    public static async forwardRouter (ctx: Context) {
        const serverUrl = ctx.request.url
        const requestBody = ctx.request.body &&
            (Array.isArray(ctx.request.body) ||
                !ObjectUtil.isEmpty(ctx.request.body)) &&
            JSON.stringify(ctx.request.body)

        const fetchParams: RequestInit = {
            method: ctx.request.method,
            ...(requestBody && {
                body: requestBody
            }),
            headers: {
                ...ctx.response.headers,
                'Content-Type': 'application/json'
            }
        }

        Logger.info(`Sending an API Request from the server: ${serverUrl}`)

        let response: Response
        try {
            response = await fetchWithTimeout(serverUrl, fetchParams)
        } catch (err) {
            err.status = err.statusCode || err.status || 500
            ctx.throw(err.message, err.status)
            return
        }

        const responseText = await response.text()

        // We assume that the response is text if it's
        // not explicitly sent as JSON.
        let responseBody: string | Dictionary = responseText
        if (response.status >= 400) {
            ctx.throw(responseBody, response.status)
            return
        }

        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
            responseBody = responseText !== '' ? JSON.parse(responseText) : responseText
        }

        ctx.type = response.headers.get('content-type') || 'text/html'
        ctx.body = responseBody
        ctx.status = response.status
    }
}
