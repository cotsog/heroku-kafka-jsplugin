'use strict'

const expect = require('chai').expect
const mocha = require('mocha')
const describe = mocha.describe
const it = mocha.it
const beforeEach = mocha.beforeEach
const afterEach = mocha.beforeEach
const proxyquire = require('proxyquire')
const expectExit = require('../expect_exit')

const cli = require('heroku-cli-util')
const nock = require('nock')

const withCluster = function * (heroku, app, cluster, callback) {
  yield callback({ name: 'kafka-1' })
}

const cmd = proxyquire('../../commands/jmx', {
  '../lib/clusters': {
    withCluster
  }
})

describe('kafka:jmx', () => {
  let kafka

  let configUrl = (cluster) => {
    return `/client/kafka/v0/clusters/${cluster}/jmx`
  }

  beforeEach(() => {
    kafka = nock('https://kafka-api.heroku.com:443')
    cli.mockConsole()
    cli.exit.mock()
  })

  afterEach(() => {
    nock.cleanAll()
    kafka.done()
  })

  describe('with unknown value specified', () => {
    it('shows an error and exits', () => {
      return expectExit(1, cmd.run({app: 'myapp', args: { VALUE: 'yep' }}))
        .then(() => expect(cli.stdout).to.be.empty)
        .then(() => expect(cli.stderr).to.equal(` ▸    Unknown value 'yep': must be 'on' or 'enable' to enable, or 'off' or
 ▸    'disable' to disable
`))
    })
  })

  const validEnable = [ 'enable', 'on' ]
  validEnable.forEach((value) => {
    it(`turns JMX on with argument ${value}`, () => {
      kafka.post(configUrl('kafka-1'), { enabled: true }).reply(200)

      return cmd.run({app: 'myapp', args: { VALUE: value }})
                .then(() => expect(cli.stderr).to.equal('Enabling JMX access... done\n'))
                .then(() => expect(cli.stdout).to.be.empty)
    })
  })

  const validDisable = [ 'disable', 'off' ]
  validDisable.forEach((value) => {
    it(`turns JMX off with argument ${value}`, () => {
      kafka.post(configUrl('kafka-1'), { enabled: false }).reply(200)

      return cmd.run({app: 'myapp', args: { VALUE: value }})
                .then(() => expect(cli.stderr).to.equal('Disabling JMX access... done\n'))
                .then(() => expect(cli.stdout).to.be.empty)
    })
  })
})
