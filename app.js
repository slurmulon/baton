'use strict'

import express      from 'express'
import path         from 'path'
import cookieParser from 'cookie-parser'
import bodyParser   from 'body-parser'

import * as baton from './lib/src/baton'
import * as slack from './lib/src/slack'
 
const app    = express()
const port   = process.env.PORT || 3000
const router = express.Router()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// slack middleware. determines if request is made from slack-like client via query param
app.use((req, res, next) => {
  if ('slack' in req.query) {
    req.body = slack.cmd(req)
  }

  next()
})

app.get('/', (req, res) => {
  res.send(slack.resp(req, 'Welcome to baton, an API for easy resource sharing in Slack! Commands: config, pass, drop, relate, help'))
})

app.get('/v1/batons', (req, res) => {
  baton.all()
    .then(btns => res.json(btns.map(btn => slack.item(req, btn))))
    .then(btns => res.json(btns))
    .catch(err => res.status(500).send(slack.err(req, err)))
})

app.post('/v1/batons', (req, res) => {
  console.log('[baton] Passing new baton...', req.body)

  baton.pass(req.body)
    .then(btn  => res.json(slack.resp(req, 'Passed a baton!: ' + btn.label + ' ' + btn.link, 'sparkles')))
    .catch(err => res.status(500).json(slack.err(req, err)))
})

app.get('/v1/batons/find', (req, res) => {
  baton.find({label: req.params.label, tags: req.params.tags})
    .then(btsn => res.json(btsn))
    .catch(err => res.status(500).json(slack.err(req, err)))
})

app.delete('/v1/batons/:id', (req, res) => {
  baton.drop(req.params.id)
  res.status(204).send()
})

app.get('/v1/help/:cmd', (req, res) => {
  res.json(slack.resp(req, {
    pass   : 'Create (pass) a baton: ```pass https://api.slack.com/bot-users [slack, bots, api]```',
    drop   : 'Delete (drop) a baton: ```drop [id|label|url]```',
    find   : 'Browse batons by tags: ```batons [label|tag(s)]```',
    error  : 'Command must be specified'
  }[req.params.cmd || 'error'] || 'Unsupported command'))
})

// export
module.exports = app

// listen
app.listen(port, () => {
  console.log('Baton Bot server listening...')
})
