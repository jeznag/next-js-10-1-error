import Head from 'next/head'
import { useEffect } from 'react'
import { AppContext, AppProps } from 'next/app'
import { IncomingMessage } from 'http'
import {
    ErrorRoute,
} from 'shared/services'
import { ActiveUser } from 'shared/types'
import { useRouter } from 'next/router'

import { GoogleAnalytics } from 'shared/services/GoogleAnalytics'
import '../assets/styles.less'

type AdditionalProps = { userLanguage?: string }
type PageProps = AppContext & AdditionalProps | AdditionalProps

/**
 * These are URLs that don't need checking for a valid user
 * (accessed by a logged user) within the requests.
 */
const SKIPPED_URLS = ['/static', '/error', '/_next', '/_error', '/sw.js']

const HarvestMobileApp = ({ Component, pageProps }: AppProps) => {
    const router = useRouter()

    useEffect(() => {
        GoogleAnalytics.logPageView()
    }, [])

    useEffect(() => {
        GoogleAnalytics.logPageView()
        if (router?.events) {
            router.events.on('routeChangeComplete', GoogleAnalytics.logPageView)
        }
    }, [router?.events])

    const page = (
        <Component {...pageProps} />
    )

    return (
        <>
            <Head>
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no'
                />
                <meta charSet='utf-8' />
                <title>Harvest Mobile</title>
            </Head>
            {page}
        </>
    )
}

HarvestMobileApp.getInitialProps = async ({ Component, ctx }: AppContext) => {
    const { req, res } = ctx

    console.log('papprops98')
    const pageProps: PageProps = Component.getInitialProps
        ? await Component.getInitialProps(ctx)
        : {}

    console.log('papprops103')

    if (SKIPPED_URLS.some(url => req?.url?.includes(url))) {
        return { pageProps }
    }

    console.log('papprops131', pageProps)

    return { pageProps }
}

export default HarvestMobileApp
