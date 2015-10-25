'use strict'

import express      from 'express'
import path         from 'path'
import bodyParser   from 'body-parser'

import * as baton from './lib/src/baton'
import * as slack from './lib/src/slack'
import * as auth  from './lib/src/auth'

import * as coreResources from './lib/src/api/baton'
import * as slackResources from './lib/src/api/slack'
 
const app  = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// routes
app.get('/', (req, res) => {
  res.send(slack.msg(req, 'Welcome to baton, an API for easy resource sharing in Slack! Commands: pass, drop, find, help'))
})

// bind baton API resources
coreResources.api(app)

// bind slack API resources
slackResources.api(app)

app.get('/v1/help/:cmd', (req, res) => {
  res.json(slack.msg(req, {
    pass   : 'Create (pass) a baton: ```pass https://api.slack.com/bot-users ["slack", "bots", "api"]```',
    drop   : 'Delete (drop) a baton: ```drop [id|label|url]```',
    find   : 'Browse batons by tags: ```find [tag]```',
    list   : 'List all team batons: ```list```',
    tags   : 'List all team tags',
    error  : 'Command must be specified'
  }[req.params.cmd || 'error'] || 'Unsupported command'))
})

// export
module.exports = app

// listen
app.listen(port, () => {
  console.log('Baton Bot server listening...')
})
