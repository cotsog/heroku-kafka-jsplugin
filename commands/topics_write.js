'use strict'

const cli = require('heroku-cli-util')
const co = require('co')
const kafka = require('no-kafka')

const debug = require('../lib/debug')
const clusterConfig = require('../lib/shared').clusterConfig
const isPrivate = require('../lib/shared').isPrivate
const deprecated = require('../lib/shared').deprecated
const withCluster = require('../lib/clusters').withCluster

const CLIENT_ID = 'heroku-write-producer'
const IDLE_TIMEOUT = 1000

function * write (context, heroku) {
  yield withCluster(heroku, context.app, context.args.CLUSTER, function * (addon) {
    if (isPrivate(addon)) {
      cli.exit(1, '`kafka:topics:write` is not available in Heroku Private Spaces')
    }

    let appConfig = yield heroku.get(`/apps/${context.app}/config-vars`)
    let attachment = yield heroku.get(`/apps/${context.app}/addon-attachments/${addon.name}`)
    let config = clusterConfig(attachment, appConfig)

    let producer = new kafka.Producer({
      idleTimeout: IDLE_TIMEOUT,
      clientId: CLIENT_ID,
      connectionString: config.url,
      ssl: {
        clientCert: config.clientCert,
        clientCertKey: config.clientCertKey
      },
      logger: {
        logLevel: 0
      }
    })
    try {
      yield producer.init()
    } catch (e) {
      debug(e)
      cli.exit(1, 'Could not connect to kafka')
    }

    const topicName = context.args.TOPIC
    const partition = parseInt(context.flags.partition) || 0
    const key = context.flags.key

    const message = { value: context.args.MESSAGE }
    if (key) {
      message.key = key
    }

    const payload = {
      topic: topicName,
      partition: partition,
      message: message
    }

    try {
      yield producer.send(payload)
      producer.end()
    } catch (e) {
      debug(e)
      cli.exit(1, 'Could not write to topic')
    }
  })
}

let cmd = {
  topic: 'kafka',
  command: 'topics:write',
  description: '(only outside Private Spaces) writes a message to a Kafka topic',
  args: [
    { name: 'TOPIC' },
    { name: 'MESSAGE' },
    { name: 'CLUSTER', optional: true }
  ],
  flags: [
    { name: 'key', description: 'the key for this message', hasValue: true },
    { name: 'partition', description: 'the partition to write to', hasValue: true }
  ],
  help: `
    Writes a message to the specified Kafka topic. Note: kafka:tail is not available in Heroku Private Spaces.

    Examples:

    $ heroku kafka:topics:write page_visits "1441025138,www.example.com,192.168.2.13"
    $ heroku kafka:topics:write page_visits "1441025138,www.example.com,192.168.2.13" kafka-aerodynamic-32763
`,
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(write))
}

module.exports = {
  cmd,
  deprecated: Object.assign({}, cmd, { command: 'write',
                                       hidden: true,
                                       run: cli.command(co.wrap(deprecated(write, cmd.command))) })
}
