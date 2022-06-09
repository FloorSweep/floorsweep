// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
var setupFilePath =
    process.env.ZZ_TESTS_ENV === '__BUILD__' ?
        '<rootDir>/__tests__/initTests.js'
        : '<rootDir>/__tests__/initTests.ts'
console.info("[SETUP] Using " + setupFilePath + " setup file 🚨 🚨 🚨");
module.exports = {
    verbose: true,

    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,

    // detectLeaks: true,
    detectOpenHandles: true,
    maxConcurrency: 5,
    maxWorkers: 5,
    json: true,
    // An array of glob patterns indicating a set of files for which coverage information should be collected
    // collectCoverageFrom: undefined,

    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',

    // An array of regexp pattern strings used to skip coverage collection
    coveragePathIgnorePatterns: [
        'index.ts',
        '/node_modules/'
    ],

    // An object that configures minimum threshold enforcement for coverage results
    coverageThreshold: {
        global: {
            'branches': 70,
            'functions': 70,
            'lines': 70,
            'statements': 70
        }
    },

    // An array of file extensions your modules use
    moduleFileExtensions: [
        'js',
        'json',
        'jsx',
        'ts',
        'tsx',
        'node'
    ],
    setupFilesAfterEnv: [
        // .ts vs .js
        setupFilePath
    ],
    // The test environment that will be used for testing
    testEnvironment: 'node',

    // The glob patterns Jest uses to detect test files
    testMatch: [
        '**/src/**/__tests__/**/*.[jt]s?(x)',
        '**/src/**/?(*.)+(spec|test).[tj]s?(x)',
        '!**/src/**/__tests__/data/**',
        '!**/src/**/__tests__/helpers.[jt]s?(x)',
        '!**/src/**/__tests__/helpers.d.[jt]s?(x)',
        '!**/src/**/__tests__/initTests.[jt]s?(x)',
        '!**/src/**/__tests__/initTests.d.[jt]s?(x)',
    ],
    // A map from regular expressions to paths to transformers
    transform: {
        '\\.(ts)$': 'ts-jest'
    },
}
