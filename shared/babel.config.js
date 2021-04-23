module.exports = {
    presets: [
        ['@babel/preset-env', { targets: { node: 'current', browsers: 'defaults' } }],
        ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
        '@babel/preset-react'
    ],
    plugins: [
        '@babel/plugin-proposal-class-properties',
        ['@babel/plugin-transform-runtime', { regenerator: true }],
        [
            'module-resolver', {
                root: ['./'],
                alias: {
                    '@api': './services/api',
                    '@services': './services',
                    '@apollo': './services/apollo',
                    '@controllers': './controllers',
                    '@components': './components',
                    '@utils': './utils',
                    '@shared-types': './types',
                    '@state': './state',
                    '@mock-data': './tests/__mocks__/data'
                }
            }
        ],
        ['@babel/plugin-transform-typescript', { allowNamespaces: true }]
    ]
}
