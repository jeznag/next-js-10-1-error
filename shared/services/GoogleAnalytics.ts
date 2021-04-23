import ReactGA from 'react-ga'
import crypto from 'crypto'
import getConfig from 'next/config'

import { Logger } from 'shared/services'
import { Dictionary, Constants } from 'shared/types'

/**
 * Dimensions must be first configured in the GA portal.
 * First navigate to the Harvest Property, then
 * > Admin > Custom Definitions > Custom Dimensions
 */
enum GACustomDimensions {
    DESCO_NAME = 'dimension1'
}

/**
 * Custom events are tracked as Metrics, which can be grouped by Dimensions
 * Consistent naming is very important. Avoid duplicate names unless you want to group event actions.
 * We can not migrate/backfill metrics, so changing names should be done carefully.
 */
enum GAEventCategory {
    PRODUCTS = 'Products',
    CONSUMERS = 'Consumers',
    CONSUMER_DETAIL = 'Consumer Detail',
    MAINTENANCE = 'Maintenance',
    OVERVIEW = 'Overview',
    MOBILE_RECEIVE_PAYMENT = 'Mobile-Payment',
    MOBILE_APPLIANCE = 'Mobile-Appliance',
    MOBILE_SIGNUP = 'Mobile-Signup',
    MOBILE_CONSUMER_DETAIL = 'Mobile-Consumer Details'
}

export class GAEvent {
    private constructor (
        public readonly category: GAEventCategory,
        public readonly action: string
    ) {}

    static readonly BTN_CONSUMER_EXPORT_BOM_CSV = new GAEvent(GAEventCategory.CONSUMERS, 'Exported BOM Csv')
    static readonly BTN_CONSUMER_EXPORT_QR_CODES = new GAEvent(GAEventCategory.CONSUMERS, 'Exported QR Codes')
    static readonly BTN_MAINTENANCE_INSIGHT_LINKED = new GAEvent(GAEventCategory.MAINTENANCE, 'Insight Linked')
    static readonly BTN_MAINTENANCE_INSIGHT_ACTIONED = new GAEvent(GAEventCategory.MAINTENANCE, 'Insight Actioned')
    static readonly BTN_MAINTENANCE_INSIGHT_DISMISSED = new GAEvent(GAEventCategory.MAINTENANCE, 'Insight Dismissed')
    static readonly BTN_MAINTENANCE_ACTION_CREATED = new GAEvent(GAEventCategory.MAINTENANCE, 'Action Created')
    static readonly BTN_MAINTENANCE_ACTION_CLOSED = new GAEvent(GAEventCategory.MAINTENANCE, 'Action Closed')
    static readonly BTN_OVERVIEW_EXPORT_PAYMENT_DATA = new GAEvent(GAEventCategory.OVERVIEW, 'Exported Payment Data')
    static readonly BTN_MOBILE_RECEIVE_PAYMENT = new GAEvent(GAEventCategory.MOBILE_RECEIVE_PAYMENT, 'Received Payment')
    static readonly BTN_MOBILE_ADD_APPLIANCE = new GAEvent(GAEventCategory.MOBILE_APPLIANCE, 'Add Appliance')
    static readonly BTN_MOBILE_NEW_SIGNUP = new GAEvent(GAEventCategory.MOBILE_SIGNUP, 'Sign up consumer')
    static readonly BTN_MOBILE_EDIT_CONSUMER = new GAEvent(GAEventCategory.MOBILE_CONSUMER_DETAIL, 'Edit consumer details')
}

/**
 * This class is used for all Client Side analytics
 * It must be initialised on the client side, so it's unique for each user.
 * Note: The 'set' functions do not send data. Instead they attach data
 * which will be sent with all future 'log' functions.
 */
export class GoogleAnalytics {
    private static isInitialised = false

    // TODO-4053: Refactor to accept the GA Tracking ID
    private static init (): boolean {
        // Ensure that GA will never run server side
        const isServer = typeof window === 'undefined'
        if (isServer) return false

        if (GoogleAnalytics.isInitialised) return true

        const runtimeCofig = getConfig()
        if (!runtimeCofig?.publicRuntimeConfig?.GA_TRACKING_ID) {
            Logger.info('Google Analytics is disabled')
            return false
        }

        ReactGA.initialize(runtimeCofig.publicRuntimeConfig.GA_TRACKING_ID, {
            debug: false,
            gaOptions: {
                siteSpeedSampleRate: 100, // Send 100% of hits - https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#siteSpeedSampleRate
                sampleRate: 100 // Track 100% of users - https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#sampleRate
            }
        })

        GoogleAnalytics.isInitialised = true
        return GoogleAnalytics.isInitialised
    }

    public static logPageView () {
        if (!GoogleAnalytics.init()) return
        ReactGA.pageview(window.location.pathname)
    }

    public static logEvent (event: GAEvent) {
        if (!GoogleAnalytics.init()) return
        ReactGA.event({ category: event.category, action: event.action })
    }

    public static logException (description: string, fatal = false) {
        if (!GoogleAnalytics.init()) return
        ReactGA.exception({ description, fatal })
    }

    public static setInternalUser (email: string) {
        GoogleAnalytics.setUser(email, Constants.OKRA_DESCO_NAME)
    }

    public static setExternalUser (email: string, descoName: string) {
        GoogleAnalytics.setUser(email, descoName)
    }

    private static setUser (email: string, descoName: string) {
        if (!GoogleAnalytics.init()) return

        // The email must first be hashed, as per GA's requirements
        const data: Dictionary<string> = {
            userId: crypto.createHash('sha256').update(email).digest('hex')
        }

        data[GACustomDimensions.DESCO_NAME] = descoName

        ReactGA.set(data)
    }
}
