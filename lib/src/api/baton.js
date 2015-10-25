import * as baton from '../baton'
import * as auth  from '../auth'

export const api = (app: Object) => {

  // FIXME - strip out slack-specific properties that may be saved. or just don't save them in the
  // first place, whatever.
  // app.use((req, res, next) => {
  //   req.body = _.omit(req.body, ['team_id', 'team_domain', 'token', 'text', 'command'])
  //   next(req, res)
  // })

  app.get('/v1/batons', auth.required((req, res, next) => {
    baton.all()
      .then(batons => res.json(batons))
      .catch(error(req, res, next))
  }))

  app.post('/v1/batons', auth.required((req, res, next) => {
    baton.pass(req.body)
      .then(baton => res.json(baton))
      .catch(error(req, res, next))
  }))

  app.get('/v1/batons/find', auth.required((req, res, next) => {
    baton.byTag(req.body.tag)
      .then(batons => res.json(batons))
      .catch(error(req, res, next))
  }))

  app.delete('/v1/batons/:id', auth.required((req, res, next) => {
    baton.drop(req.params.id)
      .then(res.status(204).send)
      .catch(error(req, res, next))
  }))

  app.get('/v1/tags', auth.required((req, res, next) => {
    baton.allTags()
      .then(tags => res.json(tags))
      .catch(error(req, res, next))
  }))

  app.post('/v1/teams', (req, res, next) => {
    baton.register(req.body.token, req.body.team_id, req.body.team_domain)
      .then(auth => res.json(auth))
      .catch(err => res.status(400).json())
  })

  return app
}

const error = (req, res, next) => (err) => {
  console.log('[baton:core:api:ERROR] An error occured while formatting API response', err);
  console.log(err.stack)

  next(err)
}