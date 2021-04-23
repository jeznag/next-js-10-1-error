import
Document, {
    Html,
    Head,
    Main,
    NextScript,
    DocumentContext,
    DocumentInitialProps
} from 'next/document'

import { ServerStyleSheet } from 'styled-components'
import { Config, Logger } from 'shared/services'
import { AwsEnv } from 'shared/types'

type CustomProps = {
    isDevEnv: boolean
}

class HarvestDocument extends Document<CustomProps> {
    static async getInitialProps (ctx: DocumentContext): Promise<DocumentInitialProps & CustomProps> {
        // ENVIRONMENT_NAME is injected by CDK and reflects the AWS account (i.e non-prod, prod, master, etc)
        // We can access this variable here because `Document.getInitialProps` is always called on the server.
        // This variable is used to dynamically change the manifest.json per environment
        const ENVIRONMENT_NAME = Config.get('ENVIRONMENT_NAME')
        const isDevEnv = ENVIRONMENT_NAME === AwsEnv.NON_PROD
        Logger.info(`AWS ENV: ${ENVIRONMENT_NAME}`)

        const sheet = new ServerStyleSheet()
        const originalRenderPage = ctx.renderPage

        try {
            ctx.renderPage = () =>
                originalRenderPage({
                    enhanceApp: (App) => props =>
                        sheet.collectStyles(<App {...props} />)
                })

            const initialProps = await Document.getInitialProps(ctx)

            return {
                ...initialProps,
                isDevEnv,
                styles: (
                    <>
                        {initialProps.styles}
                        {sheet.getStyleElement()}
                    </>
                )
            }
        } finally {
            sheet.seal()
        }
    }

    render () {

        return (
            <Html>
                <Head>
                    <meta name='theme-color' content='#ffffff' />
                    {
                        this.props.isDevEnv
                            ? <link rel='manifest' href='/static/manifest-dev.json' />
                            : <link rel='manifest' href='/static/manifest.json' />
                    }
                    <link href='https://fonts.googleapis.com/css?family=Anonymous+Pro:400,700' rel='stylesheet' />

                    <link rel='icon' href='/favicon.ico' />
                    <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
                    <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
                    <link rel='icon' type='image/svg+xml' href='/static/okra-icon.svg' />
                    <link rel='shortcut icon' href='/static/okra-icon.svg' />
                    <link rel='apple-touch-icon' sizes='192x192' href='/static/okra-icon-192-192.png' />
                    <link rel='mask-icon' href='/static/okra-icon-mask.svg' color='#5bbad5' />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default HarvestDocument
