/*
  Jest & TypeScript help:
  https://github.com/basarat/typescript-book/blob/master/docs/testing/jest.md
  https://jestjs.io/docs/en/getting-started
  https://github.com/ahnpnl/ts-jest-babel-example/blob/master/jest.config.js
*/

module.exports = {
    testRegex: '(tests/*.*.test).tsx?$',
    collectCoverage: true,
    collectCoverageFrom: [
        '**/*.{ts,tsx}'
    ],
    coverageReporters: [
        'html'
    ],
    moduleFileExtensions: [
        'ts',
        'tsx',
        'json',
        'node',
        'js'
    ],
    transformIgnorePatterns: [
        'node_modules/(?!(jest-)?react-feather)'
    ],
    restoreMocks: true // NOTE: this only restores mocks created using jest.spyOn
}
