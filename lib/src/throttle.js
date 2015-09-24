import * as baton from './baton'
import * as slack from './slack'
import moment from 'moment'

const limit     = 4  // max requests
const frequency = 1  // second
const clients   = {} // ip -> requests 

export const net = (fn: Function) => (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress

  if (!clients[clientIp]) {
    clients[clientIp] = []
  }

  const clientTries     = clients[clientIp] || []
  const clientFirst     = clientTries[0] || {} 
  const clientFirstTime = moment(clientFirst.timestamp)
  const clientTimeGap   = moment().diff(clientFirstTime, 'seconds')

  if (clientTimeGap >= frequency) {
    if (clientTries.length >= limit) {
      clients[clientIp].shift()
    }

    clients[clientIp].push(stamped(req))
  } else {
    if (clientTries.length < limit) {
      clients[clientIp].push(stamped(req))
    } else {
      return busted(req, res)
    }
  }

  return fn(req, res)
}

export const stamped = (req)      => Object.assign({timestamp: moment()}, req)
export const busted  = (req, res) => res.status(420).json(slack.err(req, `API throttle limit reached`))
