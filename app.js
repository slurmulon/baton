'use strict'

import express      from 'express'
import path         from 'path'
import bodyParser   from 'body-parser'

import * as baton from './lib/src/baton'
import * as slack from './lib/src/slack'
import * as auth  from './lib/src/auth'
 
const app  = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// slack middleware. determines if request is a command/hook made from slack-like client
// app.use((req, res, next) => {
//   if ('slack' in req.query) {
//     console.log('[baton:DEBUG] Incoming slack request', req.body)
//     // TODO - instead redirect to /v1/slack/batons
//     req.body = slack.cmd(req)
//   }

//   next()
// })

// routes
app.get('/', (req, res) => {
  res.send(slack.msg(req, 'Welcome to baton, an API for easy resource sharing in Slack! Commands: pass, drop, find, help'))
})

app.post('/v1/slack-command', (req, res) => {
  const cmd  = req.body.command
  const args = req.body.text

  const resource = {
    pass  : {url: '/v1/batons', method: 'post'},
    // drop  : {url: '/v1/batons:id', method: 'delete'}
    find  : {url: '/v1/batons/find', method: 'get'},
    list  : {url: '/v1/batons', method: 'get'},
    tags  : {url: '/v1/tags', method: 'get'}
    error : ()
  }[cmd || 'error']
})

// app.get('/v1/batons', auth.required((req, res) => {
//   baton.all()
//     .then(btns => res.json(slack.items(req, btns)))
//     .catch(errorResp(res))
// }))

// app.post('/v1/batons', auth.required((req, res) => {
//   return baton.pass(req.body)
//     .then(btn => {
//       res.json(slack.msg(req, 'Passed a baton!: ' + btn.link, 'sparkles'))
//     })
//     .catch(errorResp(req, res))
// }))

// app.get('/v1/batons/find', auth.required((req, res) => {
//   baton.byTag(req.body.tag)
//     .then(btns => res.json(slack.items(req, btns)))
//     .catch(errorResp(res))
// }))

// app.delete('/v1/batons/:id', auth.required((req, res) => {
//   baton.drop(req.params.id)
//     .then(res.status(204).send)
//     .catch(errorResp(res))
// }))

// app.get('/v1/tags', auth.required((req, res) => {
//   baton.allTags()
//     .then(tags => res.json(slack.msg(req, '' + tags.map(t => ` ${t}`))))
//     .catch(errorResp(res))
// }))

// app.post('/v1/teams', (req, res) => {
//   baton.register(req.body.token, req.body.team_id, req.body.team_domain)
//     .then(auth => res.json(auth))
//     .catch(err => res.status(400).json())
// })

// TODO - app.put('/v1/teams/reset')

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

const errorResp = (req, res) => (err) => {
  console.log('[baton:ERROR] An error occured while formatting API response', err);

  return res.status(400).json(slack.err(req, err))
}

// export
module.exports = app

// listen
app.listen(port, () => {
  console.log('Baton Bot server listening...')
})
