## Heroku Kafka Plugin

[![Build Status](https://travis-ci.org/heroku/heroku-kafka-jsplugin.svg?branch=master)](https://travis-ci.org/heroku/heroku-kafka-jsplugin)
[![Coverage Status](https://coveralls.io/repos/github/heroku/heroku-kafka-jsplugin/badge.svg?branch=master)](https://coveralls.io/github/heroku/heroku-kafka-jsplugin?branch=master)

A plugin to manage Heroku Kafka.

```
kafka:fail [CLUSTER]                                   #  triggers failure on one node in the cluster
kafka:info [CLUSTER]                                   #  display cluster information
kafka:topics [CLUSTER]                                 #  lists available Kafka topics
kafka:topics:compaction TOPIC VALUE [CLUSTER]          #  configures topic compaction in Kafka
kafka:topics:create TOPIC [CLUSTER]                    #  creates a topic in Kafka
kafka:topics:destroy TOPIC [CLUSTER]                   #  deletes a topic in Kafka
kafka:topics:info TOPIC [CLUSTER]                      #  shows information about a topic in Kafka
kafka:topics:replication-factor TOPIC VALUE [CLUSTER]  #  configures topic replication factor in Kafka
kafka:topics:retention-time TOPIC VALUE [CLUSTER]      #  configures topic retention time in Kafka
kafka:topics:tail TOPIC [CLUSTER]                      #  tails a topic in Kafka
kafka:topics:write TOPIC MESSAGE [CLUSTER]             #  writes a message to a Kafka topic
kafka:upgrade [CLUSTER]                                #  upgrades kafka broker version
kafka:wait [CLUSTER]                                   #  waits until Kafka is ready to use
```

## Install

``` sh-session
$ heroku plugins:install heroku-kafka
```

## Development

For normal development, the initial setup is:
``` sh-session
$ npm install
$ heroku plugins:link .
```

If you add a new command, change a command's args/flags or other metadata, you need to re-run `plugins:link`


## Deploying

Check out a new branch, run `npm version X.Y.Z` to bump the version to
whatever is appropriate (following SemVer, fixes should bump the patch
version, new commands should bump the minor, and major and breaking
changes should bump the major). Submit a pull request (make sure to
push with `--tags` so that the git tag generated by `npm version`
makes it to the origin repo) and have it reviewed as any other patch,
then merge it into the `master` branch and run `npm publish`.
