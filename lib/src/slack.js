import * as baton from './baton'
import {url} from './url'
import Slack from 'node-slack'

export const slack = new Slack(process.env.BATON_HOST || 'http://baton.apps.madhax.io')
export const username = 'baton'

export const msg = (req: Object, text: String, icon_emoji: String) => {
  return slack.respond(req.body, () => { return {text, username, icon_emoji} })
}

export const err = (req: Object, text: String) => {
  return slack.respond(req.body, () => { return {text, username, icon_emoji: 'boom'} })
}

export const item = (req: Object, baton: Object) => {
  return slack.respond(req.body, () => { 
    let text = `- *${baton.label}* ${baton.link}`

    if (baton.tags) {
      text += '<br/> -' + baton.tags.map(t => ` ${t}`)
    }

    return {text, icon_emoji: 'bookmark'}
  })
}

export const cmd = (req: Object) => {
  const command = req.body.command || req.body.text
  const matches = {
    link  : command.match(url),
    label : command.match(/(?:pass|drop|find|browse) (.*?)[\.!\?](?:\s|$)/), // use sentence following command (WIP)
    tags  : command.match(/(\[[^[\]]*\])/),
  }

  if (!matches.link) {
    throw 'A valid URL is required!'
  }

  const team  = {teamId: req.body.team_id, teamDomain: req.body.team_domain}
  const user  = {userId: req.body.user_id, userName:   req.body.user_name}
  const label = null // TODO - matches.label[0]
  const link  = matches.link[0]
  const tags  = matches.tags ? JSON.parse(matches.tags[0]) : []

  // return a slack-flavored instance of a baton
  return Object.assign({user, link, tags}, req.body)
}
