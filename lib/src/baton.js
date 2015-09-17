'use strict'

import {url} from '../util/url'
import {runPromise} from './db'

import * as r from 'rethinkdb'
import request from 'request'

// db logic must be in this module
const db = r.db('baton')
const table = db.table('batons')

import {setup} from './db'
setup()

let dbConn = null
// r.connect({host: process.env.RDB_HOST, port: process.env.RDB_PORT})
r.connect({host: process.env.RDB_HOST})
  .then(conn => {
    dbConn = conn
  })
  .error(err => {
    console.log('Failed to establish connect to db', err)
    throw err
  })

// create a new baton
export function pass(baton: Object, notify: Boolean = false) {
  return new Promise((resolve, reject) => {
    if (!baton.link || !url.test(baton.link)) {
      reject(`Baton link must be a valid URL ${baton.link}`)
    }

    table.insert(baton).run(dbConn, (err, res) => {
      if (!err) {
        console.log('[baton] Passed baton', res)
        // TODO - poke link to validate it before saving (also match against url regex)
        resolve(baton)
      } else {
        console.log(`[baton] Failed to pass baton: ${err}`)
        reject(err)
      }
    })
  })
}

// delete a baton
export function drop(label: String, notify: Boolean = false) {
  return new Promise((resolve, reject) => {
    table.filter({id}).delete().run((err, body) => {
      if (!err) {
        console.log('[baton] Dropped baton', id, body)
        resolve(body)
      } else {
        console.log(`[baton] Failed to drop baton ${id}: ${err}`)
        reject(err)
      }
    })
  })
}

// determines if a baton's link is still active, deleting it and optionally notifying the team if not
export function poke(label: String, notify: Boolean = false) {
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
    table.run(dbConn, runPromise.all(resolve, reject))
  })
}

// find a baton by its id
export function byId(id: String, notify: Boolean = false) {
  return new Promise((resolve, reject) => {
    table.filter({id}).run(dbConn, runPromise.one(resolve, reject))
  })
}

export function byLabel(label: String, notify: Boolean = false) {
  return new Promise((resolve, reject) => {
    table.filter({label}).run(dbConn, runPromise.one(resolve, reject))
  })
}

// returns all batons in the database that match either a label or tags
export function find({label: String, tags: Array}) {
  return new Promise((resolve, reject) => {
    table.filter(baton => {
      return baton('tags').contains(...tags) || baton('label').eq(label)
    }).run(dbConn, runs.all)
  })
}

