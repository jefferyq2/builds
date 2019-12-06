const isPlainObj = require('is-plain-obj')
const { cyan } = require('chalk')

const { LIFECYCLE, LEGACY_LIFECYCLE } = require('../lifecycle')

const { isString, isBoolean, validProperties, deprecatedProperties } = require('./helpers')

// List of validations performed on the configuration file.
// Validation are performed in order: parent should be before children.
// Each validation is an object with the following properties:
//   - `property` {string}: dot-delimited path to the property.
//     Can contain `*` providing a previous check validates the parent is an
//     object or an array.
//   - `required` {boolean}
//   - `check` {(value) => boolean}: validation check function
//   - `message` {string}: error message
//   - `example` {string}: example of correct code
//   - `warn` {boolean}: whether to print a console message or throw an error
// We use this instead of JSON schema (or others) to get nicer error messages.
const VALIDATIONS = [
  {
    property: 'plugins',
    check: value => Array.isArray(value) && value.every(isPlainObj),
    message: 'must be an array of objects.',
    example: {
      plugins: [{ type: 'netlify-plugin-one' }, { type: 'netlify-plugin-two' }],
    },
  },
  {
    property: 'plugins.*',
    ...validProperties(['id', 'type', 'enabled', 'config']),
    example: {
      plugins: [{ id: 'one', type: 'netlify-plugin-one', enabled: false, config: { port: 80 } }],
    },
  },
  {
    property: 'plugins.*.id',
    check: isString,
    message: 'must be an string.',
    example: { plugins: [{ id: 'one', type: 'netlify-plugin-one' }] },
  },
  {
    property: 'plugins.*.type',
    required: true,
    check: isString,
    message: 'must be a string.',
    example: { plugins: [{ type: 'netlify-plugin-one' }] },
  },
  {
    property: 'plugins.*.enabled',
    check: isBoolean,
    message: 'must be a boolean.',
    example: { plugins: [{ type: 'netlify-plugin-one', enabled: false }] },
  },
  {
    property: 'plugins.*.config',
    check: isPlainObj,
    message: 'must be a plain object.',
    example: { plugins: [{ type: 'netlify-plugin-one', config: { port: 80 } }] },
  },
  {
    property: 'build',
    check: isPlainObj,
    message: 'must be a plain object.',
    example: { build: { lifecycle: { onBuild: 'npm run build' } } },
  },
  {
    property: 'build.publish',
    check: isString,
    message: 'must be a string.',
    example: { build: { publish: 'dist' } },
  },
  {
    property: 'build.functions',
    check: isString,
    message: 'must be a string.',
    example: { build: { functions: 'functions' } },
  },
  {
    property: 'build.command',
    check: value => isString(value) || (Array.isArray(value) && value.every(isString)),
    message: 'must be a string or an array of strings.',
    example: { build: { command: ['npm run build', 'npm test'] } },
  },
  {
    property: 'build.command',
    check: (value, key, { lifecycle }) => lifecycle === undefined,
    message: `must not be defined when ${cyan.bold('build.lifecycle')} is also defined.
Please rename ${cyan.bold('build.command')} to ${cyan.bold('build.lifecycle.onBuild.')}`,
    example: { build: { lifecycle: { onBuild: 'npm run build' } } },
  },
  {
    property: 'build.lifecycle',
    check: isPlainObj,
    message: 'must be a plain object.',
    example: { build: { lifecycle: { onBuild: 'npm run build' } } },
  },
  {
    property: 'build.lifecycle',
    ...validProperties(LIFECYCLE, Object.keys(LEGACY_LIFECYCLE)),
    example: { build: { lifecycle: { onBuild: 'npm run build' } } },
  },
  {
    property: 'build.lifecycle.*',
    ...deprecatedProperties(LEGACY_LIFECYCLE, event => ({ build: { lifecycle: { [event]: 'npm run build' } } })),
    warn: true,
  },
  {
    property: 'build.lifecycle.*',
    check: value => isString(value) || (Array.isArray(value) && value.every(isString)),
    message: 'must be a string or an array of strings.',
    example: { build: { lifecycle: { onBuild: ['npm run build', 'npm test'] } } },
  },
]

module.exports = { VALIDATIONS }
