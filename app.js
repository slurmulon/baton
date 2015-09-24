'use strict'

import express      from 'express'
import path         from 'path'
import cookieParser from 'cookie-parser'
import bodyParser   from 'body-parser'

import * as baton from './lib/src/baton'
import * as slack from './lib/src/slack'
import * as auth  from './lib/src/auth'
 
const app  = express()
const port = process.env.PORT || 3000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// slack middleware. determines if request is a command/hook made from slack-like client
app.use((req, res, next) => {
  if ('slack' in req.query) {
    req.body = slack.cmd(req)
  }

  next()
})

// routes
app.get('/', (req, res) => {
  res.send(slack.msg(req, 'Welcome to baton, an API for easy resource sharing in Slack! Commands: pass, drop, find, help'))
})

app.get('/v1/batons', auth.required((req, res) => {
  baton.all()
    .then(btns => res.json(btns.map(btn => slack.item(req, btn))))
    .catch(errorResp(res))
}))

app.post('/v1/batons', auth.required((req, res) => {
  return baton.pass(req.body)
    .then(btn => {
      res.json(slack.msg(req, 'Passed a baton!: ' + btn.link, 'sparkles'))
    })
    .catch(errorResp(req, res))
}))

app.get('/v1/batons/find', auth.required((req, res) => {
  baton.byTag(req.body.tag)
    .then(btsn => res.json(btsn))
    .catch(errorResp(res))
}))

app.delete('/v1/batons/:id', auth.required((req, res) => {
  baton.drop(req.params.id)
    .then(res.status(204).send)
    .catch(errorResp(res))
}))

// TODO -app.get('/v1/tags')

app.post('/v1/teams', (req, res) => {
  baton.register(req.body.token, req.body.team_id, req.body.team_domain)
    .then(auth => res.json(auth))
    .catch(err => res.status(400).json())
})

// TODO - app.put('/v1/teams/reset')

app.get('/v1/help/:cmd', (req, res) => {
  res.json(slack.msg(req, {
    pass   : 'Create (pass) a baton: ```pass https://api.slack.com/bot-users [slack, bots, api]```',
    drop   : 'Delete (drop) a baton: ```drop [id|label|url]```',
    find   : 'Browse batons by tags: ```batons [label|tag(s)]```',
    error  : 'Command must be specified'
  }[req.params.cmd || 'error'] || 'Unsupported command'))
})

const errorResp = (req, res) => (err) => res.status(400).json(slack.err(req, err))

// export
module.exports = app

// listen
app.listen(port, () => {
  console.log('Baton Bot server listening...')
})
