const fs = require('fs')
const path = require('path')
const lessToJS = require('less-vars-to-js')
const withPWA = require('next-pwa')
const withLess = require('@zeit/next-less')
const TerserPlugin = require('terser-webpack-plugin')
const withTM = require('next-transpile-modules')([
    'koa',
    'koa-router',
    'koa-compose',
    'koa-bodyparser',
    'koa-convert',
    'react-feather',
    'dotenv',
    'shared/components',
    'shared/controllers',
    'shared/services',
    'shared/utils',
    'shared/types',
    'koa-session',
    'asn1.js',
    'terser',
    'dayjs'
])

// fix: prevents error when .less files are required by node
if (typeof require !== 'undefined') {
    require.extensions['.less'] = () => { }
}

const themeVariables = lessToJS(
    fs.readFileSync(path.resolve(__dirname, './src/assets/antd-custom.less'), 'utf8')
)

const clientBuildtimeConfig = {
    GA_TRACKING_ID: process.env.GA_TRACKING_ID || '' // Not used in dev
}

const config = {
    serverRuntimeConfig: { /* Do not use this, see config.ts for runtime config */ },
    publicRuntimeConfig: { ...clientBuildtimeConfig },
    pwa: {
         dest: 'public',
         swSrc: 'service-worker.js',
         maximumFileSizeToCacheInBytes: 4000000
    },
    lessLoaderOptions: {
        javascriptEnabled: true,
        modifyVars: themeVariables // make your antd custom effective
    },
    webpack: (config, { dev, isServer }) => {
        if (!isServer) {
            // Fixes npm packages that depend on 'fs' module
            // Ref: https://github.com/zeit/next.js/issues/7755
            config.node = {
                fs: 'empty',
                net: 'empty',
                tls: 'empty'
            }
        }

        if (isServer) {
            const antStyles = /antd\/.*?\/style.*?/

            const origExternals = [...config.externals]
            const isExternalFunction = typeof origExternals[0] === 'function'

            config.externals = [
                (context, request, callback) => {
                    if (request.match(antStyles)) return callback()
                    if (isExternalFunction) {
                        origExternals[0](context, request, callback)
                    } else {
                        callback()
                    }
                },
                ...(isExternalFunction ? [] : origExternals)
            ]

            config.module.rules.unshift({
                test: antStyles,
                use: 'null-loader'
            })
        }

        if (!dev) {
            // Nextjs minifies the code in production builds which causes unexpected behaviour with some typescript functionality
            // Mainly `this.constructor.name` won't work as expected when class/function names are minified/uglified
            // The follow code overrides the default Webpack minify config
            // By default webpack already uses Terser except we override it so we can set custom Terser options
            // Ref: https://webpack.js.org/configuration/optimization/
            config.optimization.minimizer = [new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: true, // Must be set to true if using source-maps in production
                terserOptions: {
                    // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                    keep_classnames: true,
                    keep_fnames: true
                }
            })]
        }

        // For GrommetUI
        config.module.rules.push({
            test: /\.scss$/,
            use: [
                {
                    loader: 'style-loader'
                },
                {
                    loader: 'css-loader'
                },
                {
                    loader: 'sass-loader',
                    options: {
                        includePaths: ['./node_modules', './node_modules/grommet/node_modules']
                    }
                }
            ]
        })

        return config
    }
}

module.exports = withTM(withPWA(withLess(config)))
