'use strict'

import express      from 'express'
import path         from 'path'
import favicon      from 'serve-favicon'
// import logger       from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser   from 'body-parser'

import * as baton from './lib/src/baton'

//   ____             __ _       
//  / ___|___  _ __  / _(_) __ _ 
// | |   / _ \| '_ \| |_| |/ _` |
// | |__| (_) | | | |  _| | (_| |
//  \____\___/|_| |_|_| |_|\__, |
//                         |___/
 
const app = express()
const port = process.env.PORT || 3000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// response format
function slackMsg(text: String, status: String = '200') { return {status, text: `[baton] ${text}`} }
function slackErr(text: String, status: String = '400') { return {status, text: `[baton:ERROR:${status}] ${text}`} }

//  ____             _            
// |  _ \ ___  _   _| |_ ___  ___ 
// | |_) / _ \| | | | __/ _ \/ __|
// |  _ < (_) | |_| | ||  __/\__ \
// |_| \_\___/ \__,_|\__\___||___/
//

app.get('/', (req, res) => {
  res.send(slackMsg('Commands: config pass drop relate help'))
})

app.get('/v1/batons', (req, res) => {
  baton.all()
    .then(btns => {
      res.send(btns.map(b => b.doc))
    })
    .catch(err => {
      res.send(slackErrMsg(err))
    })
})

app.post('/v1/batons', (req, res) => {
  baton.pass(req.body)
    .then(btn => {
      res.send(slackMsg('✨ Created new baton!: ' + btn.label + ' ' + btn.link))
    })
    .catch(err => {
      res.send(slackErr(err))
    })
})

app.delete('/v1/batons/:id', (req, res) => {
  baton.drop(req.params.id)

  res.send(204)
})

app.get('/v1/help/:cmd', (req, res) => {
  res.send(slackMsg({
    pass   : 'How to pass a baton',
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

app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    // res.render('error', {
    //   message: err.message,
    //   error: err
    // })
  })
}

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send({
    message: err.message,
    error: {}
  })
})

// export
module.exports = app

// listen
app.listen(port, () => {
  // console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env)
})
