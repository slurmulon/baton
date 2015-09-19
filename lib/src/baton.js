'use strict'

import {url} from './url'
import {runPromise} from './db'

import * as r from 'rethinkdb'
import request from 'request'

// db instantiation must reside in this module
export var db = r.db('baton')
export var batons = db.table('batons')
export var teams = db.table('teams')

import {setup} from './db'
setup()

let dbConn = null
r.connect({host: process.env.RDB_HOST})
  .then(conn => {
    dbConn = conn
  })
  .error(err => {
    console.log('Failed to establish connect to db', err)
    throw err
  })

// create a new baton
export function pass(baton: Object) {
  return new Promise((resolve, reject) => {
    if (baton.link && url.test(baton.link)) {
      batons.insert(baton).run(dbConn, (err, res) => {
        if (!err) {
          console.log('[baton] Passed baton', baton)
          // TODO - poke link to validate it before saving (also match against url regex)
          resolve(baton)
        } else {
          console.log(`[baton] Failed to pass baton: ${err}`)
          reject(err)
        }
      })
    } else {
      reject(`Baton link must be a valid URL ${baton.link}`) 
    }
  })
}

// delete a baton
export function drop(label: String) {
  return new Promise((resolve, reject) => {
    batons.filter({label}).delete().run((err, body) => {
      if (!err) {
        console.log('[baton] Dropped baton', label, body)
        resolve(body)
      } else {
        console.log(`[baton] Failed to drop baton ${label}: ${err}`)
        reject(err)
      }
    })
  })
}

// determines if a baton's link is still active
export function poke(label: String) {
  return byId(id)
    .then(body => {
      if (!body.link) {
        console.log(`[baton] No link present ${id}`)
        return false
      }

      return request.get(body.link)
        .on('success', () => true)
        .on('error',   () => { // delete baton if link is inactive (TODO - notify)
          return drop(body.label).finally(() => false)
        })
    })
    .catch(err => {
      return false
    })
}

// returns all batons in the database (TODO - scope by team)
export function all() {
  return new Promise((resolve, reject) => {
    batons.run(dbConn, runPromise.all(resolve, reject))
  })
}

// find a baton by its id
export function byId(id: String) {
  return new Promise((resolve, reject) => {
    batons.filter({id}).run(dbConn, runPromise.one(resolve, reject))
  })
}

// find a baton by its label
export function byLabel(label: String) {
  return new Promise((resolve, reject) => {
    batons.filter({label}).run(dbConn, runPromise.one(resolve, reject))
  })
}

// returns all batons in the database that match either a label or tags
export function find(label: String, tags: Array) {
  return new Promise((resolve, reject) => {
    batons.filter(baton => {
      baton('tags').contains(...tags) || baton('label').eq(label)
    }).run(dbConn, runs.all)
  })
}

// determines expected token for teamId and teamDomain combination
export function token(teamId: String, teamDomain: String) {
  return new Promise((resolve, reject) => {
    if (teamId && teamDomain) {
      teams.filter({teamId, teamDomain}).limit(1).run(dbConn, (err, cursor) => {
        if (!err) {
          cursor.toArray()
            .then(team => resolve(team[0].token))
            .error(err => `Failed to acquire team token ${teamId}:${teamDomain}: ${err}`)
        } else {
          reject(`Failed to acquire team ${teamId}:${teamDomain}: ${err}`)
        }
      })
    } else {
      reject('Missing credentials, require team_id and team_domain')
    }
  })
}

// register a new team with the api
export function register(token: String, teamId: String, teamDomain: String) {
  return new Promise((resolve, reject) => {
    if (token && teamId && teamDomain) {
      teams.insert({token, teamId, teamDomain}).run(dbConn, (err, body) => {
        if (!err) {
          resolve(body)
        }  else {
          reject(`Failed to register team ${teamId}:${teamDomain}: ${err}`)
        }
      })
    } else {
      reject('Missing credentials, require token, team_id and team_domain')
    }
  })
}
