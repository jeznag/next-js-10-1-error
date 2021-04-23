import querystring from 'querystring'

import { ObjectUtil } from '@utils'

const ACCEPTED_SPECIAL_CHARACTERS = '-@!*=&?_:%.\\s'

export class Route {
    protected readonly _path: string

    constructor (path: string) {
        const cleanPath = Route.cleanPath(path)
        if (!Route.isValid(cleanPath)) throw new Error(`Invalid path: ${cleanPath}`)

        this._path = cleanPath
    }

    public static isValid (route: string): boolean {
        const decodedRoute = decodeURIComponent(route)

        if (decodedRoute === '/' || decodedRoute === '(.*)') return true

        const routeRegex = new RegExp(
            `^/(?:\\[?[-\\w]+\\]?\\/)*?(?:\\[?([${ACCEPTED_SPECIAL_CHARACTERS}\\w]+?)\\]?)$`
        )

        const match = decodedRoute.match(routeRegex)

        return !ObjectUtil.isUndefinedOrNull(match)
    }

    public static cleanPath (route: string) {
        const trimTrailingSlashRegex = /([^/]+)\/+$/

        return route.replace(trimTrailingSlashRegex, '$1').trim()
    }

    public static getQueryParams (path: string): querystring.ParsedUrlQuery | undefined {
        const match = path.split(/[?#]/)

        if (!match || match.length < 1) {
            return undefined
        }

        return querystring.parse(match[1])
    }

    public getPath (excludeQueryParams = false): string {
        if (excludeQueryParams) {
            return this._path.split(/[?#]/)[0]
        }

        return this._path
    }

    public replaceDynamicRoutes (params: string[] = []) {
        const routeMatches = this._path.match(/\[[-\w]+\]/g)
        let newRoute = this._path

        if (!routeMatches) {
            return this._path
        }

        if (routeMatches.length !== params.length) {
            throw new Error(
                'The number of parameters provided does ' +
                'not match the dynamic routes found.'
            )
        }

        for (const [index, path] of routeMatches.entries()) {
            newRoute = newRoute.replace(path, params[index])
        }

        if (!Route.isValid(newRoute)) {
            throw new Error(`Invalid route: ${newRoute}`)
        }

        return newRoute
    }

    public toKoaRoute (): string {
        const dynamicPathRegex = /\[[^\]]+\]/

        return this._path
            .split('/')
            .map(part => {
                if (!part.match(dynamicPathRegex)) return part

                return part.replace(/\[/g, ':').replace(/-/g, '_').replace(/\]/g, '').trim()
            })
            .join('/')
    }
}

export class ErrorRoute extends Route { }
export class UtilityRoute extends Route { }
export class InternalRoute extends Route { }
export class PublicRoute extends Route { }
