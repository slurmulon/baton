import * as baton from '../baton'
import * as slack from '../slack'
import * as auth  from '../auth'

export const api = (app: Object) => {

  app.all('/v1/slack/*', (req, res, next) => {
    const body    = slack.cmd(req)
    const command = body.command
    const method  = req.method.toLowerCase()

    console.log('[baton:slack:api:DEBUG] Incoming slack request', command, req.body)

    if (command &&
        command in commands &&
         (req.body.command === '/baton' || method in commands[command])) {
      if (req.body.command === '/baton') {
        req.body = body

        const assumedCommand = body.command
        const assumedMethod  = Object.keys(commands[assumedCommand])[0]

        commands[assumedCommand][assumedMethod](req, res, next)
      } else {
        commands[command][method](req, res, next)
      }
    } else {
      next(`Unsupported command ${command} ${method}`)
    }
  })

  const commands = {
    list: {
      'get': auth.required((req, res, next) => {
        return baton.all()
          .then(btns => res.json(slack.items(req, btns)))
          .catch(error(req, res, next))
      })
    },

    pass: {
      'post': auth.required((req, res, next) => {
        return baton.pass(req.body)
          .then(btn => res.json(slack.msg(req, 'Passed a baton!: ' + btn.link, 'sparkles')))
          .catch(error(req, res, next))
      })
    },

    find: {
      'get': auth.required((req, res, next) => {
        return baton.byTag(req.body.tag)
          .then(btns => res.json(slack.items(req, btns)))
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
          .then(tags => res.json(slack.msg(req, '' + tags.map(t => ` ${t}`), 'link')))
          .catch(error(req, res, next))
      })
    },

    register: {
      'post': (req, res) => {
        return baton.register(req.body.token, req.body.team_id, req.body.team_domain)
          .then(auth => res.json(auth))
          .catch(err => res.status(400).json())
      }
    }
  }

  // ensures that express returns final response for each command
  Object.keys(commands).forEach(command => {
    app.get(`/v1/slack/${command}`, (req, res, next) => next)
  })
  
  // FIXME - conflicts with core baton api, no bueno (shouldn't need next(err))
  // formats any user error into a slack-friendly object
  // app.use(function(err, req, res, next) {
  //   if (err && /\/v1\/slack/.test(req.originalUrl)) {
  //     res.status(400).json(slack.err(req, err))
  //   } else {
  //     next(err)
  //   }
  // })

  return app
}

const error = (req, res, next) => (err) => {
  console.log('[baton:slack:api:ERROR] An error occured while formatting API response', err);
  console.log(err.stack)

  next(err)
}
