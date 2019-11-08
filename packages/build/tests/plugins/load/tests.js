const test = require('ava')

const { runFixture } = require('../../helpers/main')

// eslint-disable-next-line
test.only('Can use local plugins', async t => {
  await runFixture(t, 'local')
})

test('Can use Node module plugins', async t => {
  await runFixture(t, 'module')
})

test('Reports missing plugins', async t => {
  await runFixture(t, 'missing')
})

test('Plugin.id is optional', async t => {
  await runFixture(t, 'optional_id')
})

test('Can override plugins', async t => {
  await runFixture(t, 'override')
})
