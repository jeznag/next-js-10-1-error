import { Currency } from 'dinero.js'

export const UNKNOWN = 'Unknown'

export enum DefaultError {
    NoConnectivity = 'Poor network connectivity. Please check your internet connection.',
    UnexpectedError = 'Something went wrong. Please refresh the page and try again.'
}

/**
 * Used to describe a general "status". It is commonly used in representing
 * status of async operations e.g. fetching data from the database using our API.
 * It's also used to control the UI e.g. displaying a loading backdrop or hiding/showing
 * a React component while an async operation is running.
 */
export enum Status {
    Idle = 'Idle',
    InProgress = 'In Progress',
    Success = 'Success',
    Failed = 'Failed'
}

export enum Env {
    PROD = 'production',
    DEV = 'development',
    LOCAL = 'local'
}

export enum AwsEnv {
    NON_PROD = 'non-prod',
    PROD = 'prod',
}

export enum ActivityType {
    Idle = 'idle',
    NewSignup = 'new_signup',
    EditConsumer = 'edit_consumer',
    NewInstall = 'installed_pod',
    ReplacePod = 'replaced_pod',
    RemovePod = 'removed_pod',
    InstallUpdated = 'install_updated',
    ApplianceUpdated = 'appliance_updated',
    ApplianceAdded = 'appliance_added',
    PaymentReceived = 'payment_received',
}

/*
* These constants can be safely used on the client or server
*/
export const Constants = {
    GOOGLE_MAPS_API_KEY: 'AIzaSyDMdJFlr22N2va-cH-wnDPvErAY15-hS0M',
    OKRA_DESCO_NAME: 'Okra',

    // NOTE: For date format updates, please follow the format table.
    // Reference: https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
    DEFAULT_DATE_FORMAT: 'dd LLL yyyy',
    DEFAULT_DATETIME_FORMAT: 't dd LLL',

    STANDARD_UUID_LENGTH: 7,
    ACTIVITY_UUID_LENGTH: 10,

    CURRENCY_CODE_FALLBACK: 'USD' as Currency
}
