'use strict'

import express      from 'express'
import path         from 'path'
import favicon      from 'serve-favicon'
// import logger       from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser   from 'body-parser'

import * as baton from './lib/src/baton'
import * as slack from './lib/src/slack'

//   ____             __ _       
//  / ___|___  _ __  / _(_) __ _ 
// | |   / _ \| '_ \| |_| |/ _` |
// | |__| (_) | | | |  _| | (_| |
//  \____\___/|_| |_|_| |_|\__, |
//                         |___/
 
const app  = express()
const port = process.env.PORT || 3000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

//  ____             _            
// |  _ \ ___  _   _| |_ ___  ___ 
// | |_) / _ \| | | | __/ _ \/ __|
// |  _ < (_) | |_| | ||  __/\__ \
// |_| \_\___/ \__,_|\__\___||___/
//

app.get('/', (req, res) => {
  res.send(slack.resp(req, 'Commands: config pass drop relate help'))
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
    pass   : 'Keyword: ```pass```\nExample: ```pass https://api.slack.com/bot-users [slack, bots, api]```',
    drop   : 'How to drop a baton',
    relate : 'How to relate tags',
    search : 'How to search by tag',
    error  : 'Command must be specified'
  }[req.params.cmd || 'error'] || 'Unsupported command'))
})

//  ____              _       _                   
// | __ )  ___   ___ | |_ ___| |_ _ __ __ _ _ __  
// |  _ \ / _ \ / _ \| __/ __| __| '__/ _` | '_ \ 
// | |_) | (_) | (_) | |_\__ \ |_| | | (_| | |_) |
// |____/ \___/ \___/ \__|___/\__|_|  \__,_| .__/ 
//                                         |_|    

app.use(/\?slack$/, (req, res, next) => {
  req.body = slack.cmd(req)
  next()
})

app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500).send(err.message)
  })
}

app.use((err, req, res, next) => {
  res.status(err.status || 500)
})

// export
module.exports = app

// listen
app.listen(port, () => {
  console.log('Baton Bot server listening...')
})
