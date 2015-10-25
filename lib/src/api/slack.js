import * as baton from '../baton'
import * as slack from '../slack'
import * as auth  from '../auth'

export const api = (app: Object) => {

  app.all('/v1/slack/*', (req, res, next) => {
    const body    = slack.cmd(req)
    const command = body.command
    const method  = req.method.toLowerCase()
    const assume  = req.body.command === '/baton'

    console.log('[baton:slack:api:DEBUG] Incoming slack request', command, req.body)

    if (command &&
        command in commands &&
        (assume || method in commands[command])) {
      req.body = body

      if (assume) {
        const assumedCommand = body.command
        const assumedMethod  = Object.keys(commands[assumedCommand])[0]

        commands[assumedCommand][assumedMethod](req, res, next)
      } else {
        commands[command][method](req, res, next)
      }
    } else {
      next(`:boom: Unsupported command ${command} ${method.toUpperCase()}`)
    }
  })

  const commands = {
    list: {
      'get': auth.required((req, res, next) => {
        return baton.all()
          .then(btns => res.send(slack.items(req, btns)))
          .catch(error(req, res, next))
      })
    },

    pass: {
      'post': auth.required((req, res, next) => {
        return baton.pass(req.body)
          .then(btn => res.send(slack.msg(req, 'Passed a baton!: ' + btn.link, 'sparkles')))
          .catch(error(req, res, next))
      })
    },

    find: {
      'get': auth.required((req, res, next) => {
        return baton.byTag(req.body.tag)
          .then(btns => res.send(slack.items(req, btns)))
          .catch(error(req, res, next))
      })
    },

    drop: {
      'delete': auth.required((req, res, next) => {
        return baton.drop(req.params.id)
          .then(res.status(204).send)
          .catch(error(req, res, next))
      })
    },

    tags: {
      'get': auth.required((req, res, next) => {
        return baton.allTags()
          .then(tags => res.send(slack.msg(req, 'Your team\'s tags: ' + tags.map(t => ` ${t}`), 'bookmark')))
          .catch(error(req, res, next))
      })
    },

    register: {
      'post': (req, res) => {
        return baton.register(req.body.token, req.body.team_id, req.body.team_domain)
          .then(auth => res.json(auth))
          .catch(err => res.status(400).json())
      }
    },

    help: {
      'get': (req, res) => {
        const guide = {
          pass  : 'Create (pass) a baton: ```pass https://api.slack.com/bot-users ["slack", "bots", "api"]```',
          find  : 'Browse batons by tags: ```find [tag]```',
          list  : 'List all team batons: ```list```',
          tags  : 'List all team tags',
          error : 'Command must be specified'
        }

        // send entire help guide when no specific command is provided
        if (!req.body.text) {
          let allCmds = 'All baton commands:\n'

          Object.keys(guide).forEach(cmd => {
            allCmds += `* __cmd__: ${guide[cmd]}\n`
          })

          res.send(allCmds)
        } else {
          const cmd = req.body.text.replace('help ', '')

          res.send(slack.msg(req, guide[cmd || 'error'] || ':boom: Unsupported command'))
        }
      }
    }
  }

  // ensures that express returns final response for each command
  Object.keys(commands).forEach(command => {
    app.get(`/v1/slack/${command}`, (req, res, next) => next)
  })
  
  return app
}

const error = (req, res, next) => (err) => {
  console.log('[baton:slack:api:ERROR] An error occured while formatting API response', err);
  console.log(err.stack)

  next(err)
}
