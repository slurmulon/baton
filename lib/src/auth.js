import * as baton    from './baton'
import * as slack    from './slack'
import * as throttle from './throttle'

// determines if a request is authorized given the credentials
// TODO - maybe make this use oauth2 or something, not very secure but good enough for now
export const authorized = (req: Object) => {
  const actualToken = req.body.token || req.query.token

  return baton.token(req.body.team_id, req.body.team_domain)
    .then(expectedToken => {
      if (!expectedToken) {
        console.log('[baton:auth:ERROR] No slack token configured!')
        return false
      }

      return actualToken === expectedToken
    })
    .catch(err => {
      console.log('[baton:auth:ERROR] Failed to find registered slack token for team ' + req.body.team_id)
      return false
    })
}

// wraps a function with a protected and throttled promise
export const required = (fn: Function) => throttle.net((req, res, next) => {
  return authorized(req)
    .then(authed => {
      if (authed) {
        if (fn) {
          return fn(req, res, next)
        } else {
          next('No action to perform')
        }
      } else {
        next('Unauthorized to perform action')
      }
    })
    .catch(err => {
      console.log('[baton:auth:ERROR] Failed to permit request action', err)

      next(err)
    })
})
