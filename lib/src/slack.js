import * as baton from './baton'
import {url} from './url'
import Slack from 'node-slack'

export const node = new Slack(process.env.BATON_HOOK_URL)
export const username = 'baton'

export const msg = (req: Object, text: String, icon_emoji: String) => {
  return node.respond(req.body, () => { return `:${icon_emoji}: ${text}` })
}

export const err = (req: Object, text: String) => {
  return node.respond(req.body, () => { return `:boom: baton error: ${text}` })
}

// formats a collection of batons into "pretty" text for use in slack
export const items = (req: Object, batons: Array) => {
  return node.respond(req.body, () => {
    let text = ''

    batons.forEach(btn => {
      text += btn.label ?
               `* _${btn.label}_ <${btn.link}>` :
               `* <${btn.link}>`

      if (btn.tags) {
        text += ' |' + btn.tags.map(t => ` ${t}`)
      }

      text += '\n'
    })

    return `:link: ${text}`
  })
}

// formats baton into "pretty" text for use in slack
export const item = (req: Object, baton: Object) => items(req, [baton])

// parses a slack command into a slack-flavored instance of a baton object
export const cmd = (req: Object) => {
  const text = req.body.text

  if (!text) {
    return err(req, 'Missing required text field in slack command request')
  }

  const matches = {
    command : text.match(/^(\w*)/), //text.match(/^\/baton (\w*)/),
    link    : text.match(url),
    tags    : text.match(/(\[[^[\]]*\])/)
  }

  const command = matches.command ? matches.command[1] : ''
  const link    = matches.link ? matches.link[0] : ''
  const tags    = matches.tags ? JSON.parse(matches.tags[0]) : []

  console.log(`[baton:slack:DEBUG] Incoming slack command [${command}]: ${link}`)

  const token       = req.body.token
  const team_id     = req.body.team_id
  const team_domain = req.body.team_domain

  return {command, link, tags, token, team_id, team_domain}
}
