import * as winston from 'winston'
import * as SentryJS from '@sentry/browser'
import getConfig from 'next/config'

import { Environment, Config } from '@services'

/*
* This class is used for Client and Server side logging.
* We have two logging methods. both which initialise automatically:
* 1. Sentry is used for logging on both client & server side.
*    It doesn't start working until we are able to initialise using the
*    nextjs runtime config. Sentry is a third party service so we should
*    avoid spamming it with msgs - currently setup to only receive ERROR level.
* 2. Winston is only used for logging on the server side and can be viewed
*    in CloudWatch.
*/
export class Logger {
    private static isSentryInitialised: boolean
    private static winston: winston.Logger | undefined

    private static initSentry (): boolean {
        // Do not log Cypress tests errors in Sentry
        if (Environment.isCypress) {
            return false
        }

        if (Logger.isSentryInitialised) return true

        // Sentry can be used on either client or server
        // Although we can only initialise if we have access to the nextjs runtime config
        const runtimeCofig = getConfig()
        if (!runtimeCofig?.publicRuntimeConfig?.SENTRY_DSN) return false

        SentryJS.init({
            debug: false,
            dsn: runtimeCofig.publicRuntimeConfig.SENTRY_DSN
        })
        Logger.isSentryInitialised = true
        return true
    }

    private static initWinston (): boolean {
        // Winston can only be initialised/used on the server side.
        // This check ensures it will never run on the client.
        if (Environment.isClient) return false

        // Check if winston is already initialised
        if (Logger.winston !== undefined) return true

        const formatForCloudWatchLogs = () => winston.format.printf(info => {
            const { level, message } = info
            // Remove all line breaks to suit CloudWatch formatting
            const msgWithoutLineBreaks = message
                .replace(/\n/g, ' ')
                .replace(/\r/g, ' ')
            return `[${level.toUpperCase()}] ${msgWithoutLineBreaks}`
        })

        const formatForLocalLogs = () => winston.format.printf(info => {
            const { level, timestamp, message } = info
            const levelColourised = winston.format
                .colorize()
                .colorize(level, level.toUpperCase())
            return `[${timestamp} ${levelColourised}] ${message}`
        })

        const logFormat = Config.get('LOG_PLATFORM') === 'cloudwatch'
            ? formatForCloudWatchLogs()
            : formatForLocalLogs()

        Logger.winston = winston.createLogger({
            level: Config.get('LOG_LEVEL'),
            format: winston.format.combine(
                // Note: the order of these is important
                winston.format.timestamp(),
                winston.format.splat(),
                logFormat
                // winston.format.errors({stack: true}), // Open Github issue: https://github.com/winstonjs/winston/issues/1724
            ),
            transports: [new winston.transports.Console()]
        })

        return true
    }

    public static error (error: Error) {
        if (Logger.initSentry()) {
            SentryJS.captureException(error)
        }

        if (Logger.initWinston() && Logger.winston !== undefined) {
            Logger.winston.error('%s', error.stack)
        }
    }

    public static info (message: string) {
        // Don't bother flooding Sentry with info msgs

        if (Logger.initWinston() && Logger.winston !== undefined) {
            Logger.winston.info(message)
        }
    }

    public static warn (message: string) {
        // Don't bother flooding Sentry with warn msgs

        if (Logger.initWinston() && Logger.winston !== undefined) {
            Logger.winston.warn(message)
        }
    }

    public static verbose (message: string) {
        // Don't bother flooding Sentry with verbose msgs

        if (Logger.initWinston() && Logger.winston !== undefined) {
            Logger.winston.verbose(message)
        }
    }
}
