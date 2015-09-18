import * as baton from './baton'
import {url} from '../util/url'
import Slack from 'node-slack'

export const slack = new Slack('http://baton.apps.madhax.io')
export const username = 'baton'

export const resp = (req: Object, text: String, icon_emoji: String) => protect(req, () => {
  return slack.respond(req.body, () => { return {text, username, icon_emoji}})
})

export const err = (req: Object, text: String) => protect(req, () => {
  return slack.respond(req.body, () => { return {text, username, icon_emoji: 'boom'}})
})

export const item = (req: Object, baton: Object) => protect(req, () => {
  return slack.respond(req.body, () => { 
    let text = '- *' + baton.label + '* ' + baton.link

    if (baton.tags) {
      text += '\n\t-' + baton.tags.map(t => ` ${t}`)
    }

    return {text, icon_emoji: 'bookmark'}
  })
})

export const cmd = (req: Object) => protect(req, () => {
  const command = req.body.command || req.body.text
  const matches = {
    label : 'TODO :O',
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

  // return a slack-flavored instance of a baton (for auth validation and sane debugging)
  return Object.assign({label, link, tags}, req.body)
})

export const authorized = (req: Object) => {
  const expectedToken = process.env.SLACK_TOKEN
  const actualToken   = req.body.token || req.query.token

  if (!expectedToken) {
    console.log('[baton:ERROR] No slack token configured!')
    return false
  }

  return actualToken === expectedToken
}

export const protect = (req: Object, fn: Function) => {
  if (authorized(req)) {
    return fn(req)
  }

  throw 'Invalid application token!'
}
