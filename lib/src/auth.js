import * as baton    from './baton'
import * as slack    from './slack'
import * as throttle from './throttle'

// TODO - maybe make this use oauth2 or something, not very secure but good enough for now
export const authorized = (req: Object) => {
  const actualToken = req.body.token || req.query.token

  return baton.token(req.body.team_id, req.body.team_domain)
    .then(expectedToken => {
      if (!expectedToken) {
        console.log('[baton:ERROR] No slack token configured!')
        return false
      }

      return actualToken === expectedToken
    })
    .catch(err => {
      console.log('[baton:ERROR] Failed to find registered slack token for team ' + req.body.team_id)
      return false
    })
}

export const required = (fn: Function) => throttle.net((req, res) => {
  return authorized(req)
    .then(authed => {
      if (authed && fn) {
        return fn(req, res)
      } else {
        res.status(401).json(slack.err(req, 'Unauthorized to perform action')).send()
      }
    })
    .catch(() => {
      res.status(401).json(slack.err(req, 'Failed to permit authorization'))
    })
})
