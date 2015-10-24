export const api = (app: Object) => {

  // const cmdProxy = (req, res, next) => 
  //   const cmd  = req.body.command
  //   const args = req.body.text

  //   const resource = {
  //     pass  : {url: '/v1/slack/batons', method: 'post'},
  //     // drop  : {url: '/v1/batons:id', method: 'delete'}
  //     find  : {url: '/v1/slack/batons/find', method: 'get'},
  //     list  : {url: '/v1/slack/batons', method: 'get'},
  //     tags  : {url: '/v1/slack/tags', method: 'get'}
  //     error : ()
  //   }[cmd || 'error']

  //   // TODO - redirect
  // }

  app.all('/v1/slack/*', (req, res, next) => {
    console.log('[baton:DEBUG] Incoming slack request', req.body)

    req.body = slack.cmd(req)

    if (req.body instanceof Object) {
      next()
    } else {
      // ERROR: invalid slack command
    }
  }, (req, res, next) => {
    const cmd  = req.body.command
    const args = req.body.args
    const meth = res.method

    if (cmd  in commands &&
        meth in commands[cmd]) {
      commands[cmd][meth](...arguments)
    }
  })

  // app.post('/v1/slack/command', (req, res) => {
  //   const cmd  = req.body.command
  //   const args = req.body.text

  //   const resource = {
  //     pass  : {url: '/v1/slack/batons', method: 'post'},
  //     // drop  : {url: '/v1/batons:id', method: 'delete'}
  //     find  : {url: '/v1/slack/batons/find', method: 'get'},
  //     list  : {url: '/v1/slack/batons', method: 'get'},
  //     tags  : {url: '/v1/slack/tags', method: 'get'}
  //     error : ()
  //   }[cmd || 'error']

  //   // TODO - redirect
  // })


  // app.get('/v1/slack/batons', auth.required((req, res) => {
  //   baton.all()
  //     .then(btns => res.json(slack.items(req, btns)))
  //     .catch(errorResp(res))
  // }))

  // app.post('/v1/slack/batons', auth.required((req, res) => {
  //   return baton.pass(req.body)
  //     .then(btn => res.json(slack.msg(req, 'Passed a baton!: ' + btn.link, 'sparkles')))
  //     .catch(errorResp(req, res))
  // }))

  // app.get('/v1/slack/batons/find', auth.required((req, res) => {
  //   baton.byTag(req.body.tag)
  //     .then(btns => res.json(slack.items(req, btns)))
  //     .catch(errorResp(res))
  // }))

  // app.delete('/v1/slack/batons/:id', auth.required((req, res) => {
  //   baton.drop(req.params.id)
  //     .then(res.status(204).send)
  //     .catch(errorResp(res))
  // }))

  // app.get('/v1/slack/tags', auth.required((req, res) => {
  //   baton.allTags()
  //     .then(tags => res.json(slack.msg(req, '' + tags.map(t => ` ${t}`))))
  //     .then(res.json)
  //     .catch(errorResp(res))
  // }))

  // app.post('/v1/slack/teams', (req, res) => {
  //   baton.register(req.body.token, req.body.team_id, req.body.team_domain)
  //     .then(auth => res.json(auth))
  //     .catch(err => res.status(400).json())
  // })


  const commands = {
    list: {
      get: auth.required((req, res) => {
        baton.all()
          .then(btns => res.json(slack.items(req, btns)))
          .catch(errorResp(res))
      })
    },

    pass: {
      post: auth.required((req, res) => {
        return baton.pass(req.body)
          .then(btn => res.json(slack.msg(req, 'Passed a baton!: ' + btn.link, 'sparkles')))
          .catch(errorResp(req, res))
      })
    },

    find: {
      get: auth.required((req, res) => {
        baton.byTag(req.body.tag)
          .then(btns => res.json(slack.items(req, btns)))
          .catch(errorResp(res))
      })
    },

    drop: {
      delete: auth.required((req, res) => {
        baton.drop(req.params.id)
          .then(res.status(204).send)
          .catch(errorResp(res))
      })
    },

    tags: {
      get: auth.required((req, res) => {
        baton.allTags()
          .then(tags => res.json(slack.msg(req, '' + tags.map(t => ` ${t}`))))
          .then(res.json)
          .catch(errorResp(res))
      })
    },

    register: {
      post: (req, res) => {
        baton.register(req.body.token, req.body.team_id, req.body.team_domain)
          .then(auth => res.json(auth))
          .catch(err => res.status(400).json())
      })
    }
  }

  // app.get('/v1/slack/batons', auth.required((req, res) => {
  //   baton.all()
  //     .then(btns => res.json(slack.items(req, btns)))
  //     .catch(errorResp(res))
  // }))

  // app.post('/v1/slack/batons', auth.required((req, res) => {
  //   return baton.pass(req.body)
  //     .then(btn => res.json(slack.msg(req, 'Passed a baton!: ' + btn.link, 'sparkles')))
  //     .catch(errorResp(req, res))
  // }))

  // app.get('/v1/slack/batons/find', auth.required((req, res) => {
  //   baton.byTag(req.body.tag)
  //     .then(btns => res.json(slack.items(req, btns)))
  //     .catch(errorResp(res))
  // }))

  // app.delete('/v1/slack/batons/:id', auth.required((req, res) => {
  //   baton.drop(req.params.id)
  //     .then(res.status(204).send)
  //     .catch(errorResp(res))
  // }))

  // app.get('/v1/slack/tags', auth.required((req, res) => {
  //   baton.allTags()
  //     .then(tags => res.json(slack.msg(req, '' + tags.map(t => ` ${t}`))))
  //     .then(res.json)
  //     .catch(errorResp(res))
  // }))

  // app.post('/v1/slack/teams', (req, res) => {
  //   baton.register(req.body.token, req.body.team_id, req.body.team_domain)
  //     .then(auth => res.json(auth))
  //     .catch(err => res.status(400).json())
  // })

  return app
}
