module.exports = {
    presets: [
        'next/babel',
        '@babel/preset-typescript'
    ],
    plugins: [
        '@babel/plugin-proposal-class-properties',
        [
            'module-resolver', {
                root: ['./'],
                alias: {
                    '@pages': './src/pages',
                    '@containers': './src/containers',
                    '@lib': './src/lib',
                    '@components': './src/components',
                    '@state': './src/state',
                    '@i18n': './src/i18n.ts'
                }
            }
        ],
        [
            'import',
            {
                libraryName: 'antd',
                style: 'true'
            },
            'ant'
        ],
        [
            'styled-components',
            {
                ssr: true
            }
        ]
    ]
}
