'use strict'

import * as db from './db'
import request from 'request'

// create a new baton
export function pass(baton: Object, notify: Boolean = false) {
  return new Promise((resolve, reject) => {
    db.session().insert(baton, (err, body) => {
      if (!err) {
        const dbBaton = Object.assign(baton, body)

        console.log('Passed baton', dbBaton)

        // TODO - poke link to validate it before saving (also match against url regex)

        resolve(Object.assign(dbBaton, body))
      } else {
        console.log(`[baton] Failed to pass baton: ${err}`)

        reject(err)
      }
    })
  })
}

export function byId(id: String, notify: Boolean = false) {
  return new Promise((resolve, reject) => {
    db.session().get(id, (err, baton) => {
      if (!err) {
        console.log('Fetched baton', id, body)

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

}

// determines if a baton's link is still active, deleting it and optionally notifying the team if not
// TODO - convert to Promise
export function poke(id: Baton, notify: Boolean = false) {
  byId(id)
    .then(body => {
      if (!body.link) {
        console.log(`[baton] No link present ${id}`)

        return false
      }

      return request.get(body.link)
        .on('success', () => {
          return true
        })
        .on('error', () => {
          return false
        })
    })
    .catch(err => {
      // TODO - maybe resp with slack err
      return false
    })
}

export function all() {
  return new Promise((resolve, reject) => {
    return db.session().list({include_docs: true, limit: 10, descending: true}, (err, body) => {
      if (err) {
        console.log(`[baton] Failed to acquire batons ${err}`)

        reject(err)
      }

      body.rows.forEach(function(doc) {
        console.log('Found doc', doc)
      })

      resolve(body.rows)
    })
  })
}

export function search(tag: String) {
  // find like?
  db.session().get({tags: [tag]})
}

// Baton-izes an object (creates a new baton from a POJO)
// export function ized({apiKey, label, link, tags}) {
//   return new Baton(apiKey, label, link, tags)
// }
