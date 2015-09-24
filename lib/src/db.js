import * as r from 'rethinkdb'

// create/setup db and tables for baton
export const setup = () => {
  r.connect({host: process.env.RDB_HOST}, (err, conn) => {
    if (err) {
      console.log(`Failed to connect to baton database! ${err}`)
      return
    }

    r.dbCreate('baton').run(conn, (err) => {
      if (err) return // ignore, only needs to be run once
      console.log('[baton] created db baton')

      r.db('baton').tableCreate('batons').run(conn, (err, result) => {
        if (err) return // ignore, only needs to be run once
        console.log('[baton] created rethinkdb table batons')
      })

      r.db('baton').tableCreate('teams').run(conn, (err, result) => {
        if (err) return // ignore, only needs to be run once
        console.log('[baton] created table rethinkdb teams')
      })
    })
  })
}

// creates promise wrappers for single and collection db entities
export const runPromise = {
  one: (resolve, reject) => {
    return (err, res) => {
      if (!err) {
        resolve(res)
      } else {
        console.log(`[baton] Failed to acquire stored entity: ${err}`)
        reject(err)
      }
    }
  },

  all: (resolve, reject) => {
    return (err, res) => {
      if (!err) {
        res.toArray()
          .then(resolve)
          .error(reject)
      } else {
        console.log(`[baton] Failed to acquire stored entities ${err}`)
        reject(err)
      }
    }
  }
}
