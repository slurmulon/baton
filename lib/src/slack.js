import * as baton from './baton'
import {url} from '../util/url'
import Slack from 'node-slack'

export const slack = new Slack('http://baton.apps.madhax.io')

// https://api.slack.com/bot-users
// https://api.slack.com/#basics

export const resp = (req: Object, text: String, icon: String) => protect(req, () => {
  return slack.respond(req.body, () => { return {text: text, username: 'Baton Bot', icon_emoji: icon}})
})

export const err = (req: Object, text: String) => protect(req, () => {
  return slack.respond(req.body, () => { return {text: text, username: 'Baton Bot', icon_emoji: 'boom'}})
})

export const item = (req: Object, baton: Object) => protect(req, () => {
  return slack.respond(req.body, () => { 
    let text = '- *' + baton.label + '* ' + baton.link

    if (baton.tags) {
      text += '\n\t- ' + baton.tags
    }

    return {text, icon_emoji: 'bookmark'}
  })
})

export const cmd = (req: Object) => protect(req, () => {
  const command = req.body.command
  const matches = {
    label : 'TODO',
    link  : command.match(url),
    tags  : command.match(/(\[[^[\]]*\])/),
  }

  if (!matches.link) {
    throw 'A valid URL is required!'
  }

  const user  = {id: req.body.user_id, name: req.body.user_name}
  const label = matches.label
  const link  = matches.link[0]
  const tags  = matches.tags ? JSON.parse(matches.tags[0]) : []

  return {label, link, tags}
})

export const authorized = (req: Object) => {
  const token = process.env.SLACK_TOKEN

  if (!token) {
    console.log('[baton:WARN] No slack token provided, allowing action!')
    return true // TODO - make this secure, prevent actions
  }

  return token && req.body.token === token
}

export const protect = (req: Object, fn: Function) => {
  if (authorized(req)) {
    return fn(req)
  }

  throw 'Invalid application token!'
}
