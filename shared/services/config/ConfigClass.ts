import { AwsEnv, Env } from '@shared-types'
import dotenv from 'dotenv'
export interface IConfig {
    init: () => void
    get: (key: any, defaultValue?: string) => string
}

dotenv.config()

export class ConfigClass implements IConfig {
    private isInitialized = false
    private data = {
        NODE_ENV: Env.LOCAL.toString(),
        ENVIRONMENT_NAME: AwsEnv.NON_PROD.toString(), // AWS Environment Name injected by CDK
        SERVER_URL: 'http://localhost',
        SERVER_PORT: '3000',
        CLIENT_URL: 'http://localhost',
        CLIENT_PORT: '3000',
        OKRA_API_URL: 'http://localhost',
        OKRA_API_PORT: '3333',
        APOLLO_API_URL: 'http://localhost',
        APOLLO_API_PORT: '3001',
        AUTH0_DOMAIN: 'okra-dev.au.auth0.com',
        AUTH0_CLIENT_ID: 'YEEfZ8uQB7sQKDnT3GVcocoZGPQChMiZ',
        AUTH0_CLIENT_SECRET: 'yM1QsNlfpOiJmfGGaQvdd-P3uLYHfNZX7V3plIJrY1kNKtB7D9yinQkH7VnwO7YB',
        MOBILE_AUTH0_CLIENT_ID: 'mM2vqE48qriMaQJYFTrmvfhMEiIyDDgU',
        MOBILE_AUTH0_CLIENT_SECRET: 'lFw2GLzt7MZlpOf5qHrCnw_fka1lls3lslW-dbE6l9U43quLLNgDy-qT7gcyw_O3',
        AUTH0_API_CLIENT_ID: 'zn5HiRpdN0rlofi8F6nerzdQ6Kq6AD85',
        AUTH0_API_CLIENT_SECRET: '5x6ogpIAgliat5bmQDV-Ww-CjKQd0vcOlA40y8fZLRI49jdTfHbZ35dj_UOtriY2',
        AUTH0_SECRET_1: 'harvest secret key',
        AUTH0_SECRET_2: 'another secret key',
        SESSION_COOKIE_NAME: 'harvest:sess',
        MOBILE_SESSION_COOKIE_NAME: 'harvest-mobile.sess',
        JWT_COOKIE_NAME: 'harvest_jwt',
        LOG_PLATFORM: 'local',
        LOG_LEVEL: 'debug',
        BROKER_HOST: 'localhost',
        BROKER_PORT: '1883',
        BROKER_USER: 'admin',
        BROKER_PASS: 'admin',
        CYPRESS_INTERNAL_USER: 'okra.cypress.user@gmail.com',
        DEFAULT_SERVER_TIMEOUT: '120000',
        DEFAULT_SESSION_TIMEOUT: '432000000', /** 5 days in milliseconds */
        DEFAULT_FETCH_TIMEOUT: '60000',
        GHOST_CMS_URL: 'https://cms.harvest.dev.okrasolar.com',
        GHOST_CMS_KEY: 'cf1cd32ae4c347508a11e37040'
    }

    public init () {
        for (const key of Object.keys(this.data)) {
            const configKey = key as keyof ConfigClass['data']
            const overridenValue = process.env[configKey]

            if (overridenValue) {
                this.data[configKey] = overridenValue
            }
        }

        this.isInitialized = true
    }

    public get (key: keyof ConfigClass['data'], defaultValue?: string): string {
        if (!this.isInitialized) {
            this.init()
        }

        // If provided a different default value
        // disregard the Config class's defaults
        if (defaultValue) {
            return process.env[key] ?? defaultValue
        }

        return this.data[key]
    }
}
