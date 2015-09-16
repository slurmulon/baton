import * as r from 'rethinkdb'

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
