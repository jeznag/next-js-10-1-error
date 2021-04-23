import {
    UtilityRoute,
    InternalRoute,
    PublicRoute,
    ErrorRoute
} from '@services/Route'

export const UtilityRoutes = {
    Api: new UtilityRoute('/api'),
    Apollo: new UtilityRoute('/apollo'),
    Auth0: new UtilityRoute('/auth0'),
    Broker: new UtilityRoute('/broker'),
    AllBroker: new UtilityRoute('/broker/:splat*'),
    AllApi: new UtilityRoute('/api/:splat*'),
    AllApollo: new UtilityRoute('/apollo/:splat*')
}

/*
* These routes are protected by authentication & authorisation
* They can be accessed by internal users only.
*/
export const InternalRoutes = {
    Users: new InternalRoute('/users'),
    AllAuth0: new InternalRoute('/auth0/:splat*')
}

/*
* These Routes are public and not protected by any auth
*/
export const PublicRoutes = {
    Login: new PublicRoute('/login'),
    LoginCallback: new PublicRoute('/callback'),
    Logout: new PublicRoute('/logout'),
    HealthCheck: new PublicRoute('/healthz'),
    All: new PublicRoute('(.*)')
}

/*
* These Routes are public and not protected by any auth
*/
export const ErrorRoutes = {
    ErrorIndex: new ErrorRoute('/error/[error-code]'),
    Unauthorised: new ErrorRoute('/error/401'),
    NotAvailable: new ErrorRoute('/error/503'),
    InternalServerError: new ErrorRoute('/error/500'),
    NotFound: new ErrorRoute('/error/404'),
    InvalidRequest: new ErrorRoute('/error/400')
}
