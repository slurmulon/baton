import * as baton from './baton'
import {url} from './url'
import Slack from 'node-slack'

export const slack = new Slack(process.env.BATON_HOST || 'http://baton.apps.madhax.io')
export const username = 'baton'

export const msg = (req: Object, text: String, icon_emoji: String) => {
  return slack.respond(req.body, () => { return {text, username, icon_emoji} })
}

export const err = (req: Object, text: String) => {
  return slack.respond(req.body, () => Object.assign(req.body, {text, username, icon_emoji: 'boom'}))
}

// formats a collection of batons into "pretty" text for use in slack
export const items = (req: Object, batons: Array) => {
  return slack.respond(req.body, () => { 
    let text = ''

    batons.forEach(btn => {
      text += btn.label ?
               `* _${btn.label}_ <${btn.link}>` :
               `* <${btn.link}>`

      if (btn.tags) {
        text += ' | ' + btn.tags.map(t => ` ${t}`)
      }

      text += '\n'
    })

    return {text, icon_emoji: 'bookmark'}
  })
}

// formats baton into "pretty" text for use in slack
export const item = (req: Object, baton: Object) => items(req, [baton])

// parses a slack command into a slack-flavored instance of a baton object
export const cmd = (req: Object) => {
  const command = req.body.command || req.body.text

  if (!command) {
    return err(req, 'Missing required command or text field in slack request')
  }

  const matches = {
    link  : command.match(url),
    label : command.match(/(?:pass|drop|find|browse) (.*?)[\.!\?](?:\s|$)/), // use sentence following command (WIP)
    tags  : command.match(/(\[[^[\]]*\])/),
  }

  if (!matches.link) {
    return err(req, 'A valid URL is required!')
  }

  const team  = {teamId: req.body.team_id, teamDomain: req.body.team_domain}
  const user  = {userId: req.body.user_id, userName:   req.body.user_name}
  const label = null // TODO - matches.label[0]
  const link  = matches.link[0]
  const tags  = matches.tags ? JSON.parse(matches.tags[0]) : []
  
  return Object.assign({user, link, tags}, req.body)
}
