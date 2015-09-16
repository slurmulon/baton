import * as r from 'rethinkdb'

export const setup = () => {
  r.connect({host: 'localhost', port: 28015}, (err, conn) => {
    if (err) {
      console.log(`Failed to connect to baton database! ${err}`)
      return
    }

    r.dbCreate('main').run(conn, (err) => {
      if (err) return // ignore, only needs to be run once

      r.db('main').tableCreate('batons').run(conn, (err, result) => {
        if (err) return // ignore, only needs to be run once

        console.log(JSON.stringify(result, null, 2))
      })
    })
  })
}

// creates promise wrappers for single and collection db entities
export const runPromise = {
  one: (resolve, reject) => {
    return (err, baton) => {
      if (!err) {
        console.log('Fetched baton by id', id, baton)
        resolve(baton)
      } else {
        console.log(`[baton] Failed to acquire baton ${id}: ${err}`)
        reject(err)
      }
    }
  },

  all: (resolve, reject) => {
    return (err, batons) => {
      if (err) {
        console.log(`[baton] Failed to acquire batons ${err}`)
        reject(err)
      }

      batons.toArray()
        .then(resolve)
        .error(reject)
    }
  }
}
