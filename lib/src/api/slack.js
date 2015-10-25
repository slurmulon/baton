import * as baton from '../baton'
import * as slack from '../slack'
import * as auth  from '../auth'

export const api = (app: Object) => {

//   app.use(function(req,res,next){
//     var _send = res.send;
//     var sent = false;
//     res.send = function(data){
//         if(sent) return;
//         _send.bind(res)(data);
//         sent = true;
//     };
//     next();
// });

  app.all('/v1/slack/*', (req, res, next) => {
    console.log('[baton:slack:api:DEBUG] Incoming slack request', req.body)

    const body    = slack.cmd(req)
    const command = body.command
    const method  = req.method.toLowerCase()

    if (command &&
        command in commands &&
         method in commands[command]) {
      req.body = body

      commands[command][method](req, res, next)
    } else { // ERROR: invalid slack command
      // res.status(404).json(slack.err(req, `Unsupported command ${command}`))
      next(`Unsupported command ${command}`)
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
  
  // format any user error into a slack-friendly object
  app.use(function(err, req, res, next) {
    // res.status(400).json(slack.err(req, err))
    res.status(400).send()
  })

  return app
}

const error = (req, res, next) => (err) => {
  console.log('[baton:slack:api:ERROR] An error occured while formatting API response', err);

  next(err)

  return
  // next(slack.err(req, err))
  // return res.status(400).json(slack.err(req, err))
}
