import * as baton from './baton'
import Slack from 'node-slack'

export const slack = new Slack('http://baton-bot.herokuapp.com')

// https://api.slack.com/bot-users
// https://api.slack.com/#basics

export const msg = (req: Object, text: String, icon: String) => slack.respond(req.body, () => { 
  return {text: text, username: 'Baton Bot', icon_emoji: icon}
})

export const err = (req: Object, text: String) => slack.respond(req.body, () => { 
  return {text: text, username: 'Baton Bot', icon_emoji: 'boom'}
})

export const item = (req, baton: Object) => slack.respond(req.body, () => {
  let text = '- *' + baton.label + '* ' + baton.link

  if (baton.tags) {
    text += '\n\t- ' + baton.tags
  }

  return {text, icon_emoji: 'bookmark'}
})
