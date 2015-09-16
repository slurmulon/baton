'use strict'

// https://www.rethinkdb.com/docs/sql-to-reql/python/

// import * as db from './db'
import * as r from 'rethinkdb'
import request from 'request'

// db goodness
const db = r.db('main')
const table = db.table('batons')

let dbConn = null
r.connect((err, conn) => {
  if (err) throw err;
  dbConn = conn
})

// create a new baton
export function pass(baton: Object, notify: Boolean = false) {
  return new Promise((resolve, reject) => {
    table.insert(baton).run(dbConn, (err, body) => {
      if (!err) {
        const dbBaton = Object.assign(baton, body)

        console.log('Passed baton', dbBaton)

        // TODO - poke link to validate it before saving (also match against url regex)

        resolve(dbBaton)
      } else {
        console.log(`[baton] Failed to pass baton: ${err}`)

        reject(err)
      }
    })
  })
}

// find a baton by its id
export function byId(id: String, notify: Boolean = false) {
  return new Promise((resolve, reject) => {
    table.filter({id}).run(dbConn, (err, baton) => {
      if (!err) {
        console.log('Fetched baton', id, baton)
        resolve(baton)
      } else {
        console.log(`[baton] Failed to acquire baton ${id}: ${err}`)
        reject(err)
      }
    })
  })
}

// delete a baton
export function drop(id: String, notify: Boolean = false) {
  return new Promise((resolve, reject) => {
    table.filter({id}).delete().run(err, body) => {
      if (!err) {
        console.log('Dropped baton', id, body)
        resolve(body)
      } else {
        console.log(`[baton] Failed to drop baton ${id}: ${err}`)
        reject(err)
      }
    })
  })
}

// determines if a baton's link is still active, deleting it and optionally notifying the team if not
export function poke(id: Baton, notify: Boolean = false) {
  byId(id)
    .then(body => {
      if (!body.link) {
        console.log(`[baton] No link present ${id}`)
        return false
      }

      return request.get(body.link)
        .on('success', () => { return true  })
        .on('error',   () => { return false })
    })
    .catch(err => {
      // TODO - maybe resp with slack err
      return false
    })
}

// returns all batons in the database (TODO - scope by team)
export function all() {
  return new Promise((resolve, reject) => {
    table.run(dbConn, (err, cursor) => {
      if (err) {
        console.log(`[baton] Failed to acquire batons ${err}`)
        reject(err)
      }

      cursor.toArray()
        .then(resolve)
        .error(reject)
    })
  })
}

export function search(tag: String) {
  // TODO
}
