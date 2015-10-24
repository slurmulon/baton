export const api = (app: Object) => {
  // const resources = {
  //   '/v1/batons' : auth.required((req, res) => {
  //     baton.all()
  //       // .then(btns => res.json(slack.items(req, btns)))
  //       .then(res.json)
  //       .catch(errorResp(res))
  //   })
  // }

  app.get('/v1/batons', auth.required((req, res) => {
    baton.all()
      .then(res.json)
      .catch(errorResp(res))
  }))

  app.post('/v1/batons', auth.required((req, res) => {
    return baton.pass(req.body)
      .then(res.json)
      .catch(errorResp(req, res))
  }))

  app.get('/v1/batons/find', auth.required((req, res) => {
    baton.byTag(req.body.tag)
      .then(res.json)
      .catch(errorResp(res))
  }))

  app.delete('/v1/batons/:id', auth.required((req, res) => {
    baton.drop(req.params.id)
      .then(res.status(204).send)
      .catch(errorResp(res))
  }))

  app.get('/v1/tags', auth.required((req, res) => {
    baton.allTags()
      .then(tags => res.json(tags))
      .then(res.json)
      .catch(errorResp(res))
  }))

  app.post('/v1/teams', (req, res) => {
    baton.register(req.body.token, req.body.team_id, req.body.team_domain)
      .then(auth => res.json(auth))
      .catch(err => res.status(400).json())
  })

  return app
}
