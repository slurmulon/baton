import * as baton from './baton'

export class SlackRequest {
  // token=4VcyyIfV4VDmXUInDjVCg3fr
  // team_id=T0001
  // team_domain=example
  // channel_id=C2147483705
  // channel_name=test
  // timestamp=1355517523.000005
  // user_id=U2147483697
  // user_name=Steve
  // text=googlebot: What is the air-speed velocity of an unladen swallow?
  // trigger_word=googlebot:
  
  constructor({
    token: String,
    teamId: String,
    teamDomain: String,
    channelId: String,
    channelName: String,
    timestamp: String,
    userId: String,
    userName: String,
    text: String,
    triggerWord: String
  }) {
    for (var [key, value] of arguments) {
      this[key] = value
    }
  }
}

export class SlackResponse {

}

export class Slack {

  constructor(token: String, teamId: String, teamDomain: String, channelId: String, channelName: String) {
    for (var [key, value] of arguments) {
      this[key] = value
    }
  }
  
  expressify() {
    (req, res, next) => {
      const userName = req.body.user_name
      const greeting = {
        text : 'Hello, ' + userName + '!'
      }

      // avoid infinite loop
      if (userName !== 'slackbot') {
        return res.status(200).json(greeting)
      } else {
        return res.status(200).end()
      }
    }
  }

}
