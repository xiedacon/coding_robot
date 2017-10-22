'use strict'

const Promise = require('bluebird')

const coding = require('./coding')
const dingding = require('./dingding')
const { core } = require('../config')

const limit = core.interval / 60 * core.limit

let excute
let wait = Date.now()

exports.sendMsgs = async function sendMsgs (before) {
  console.log('wait:', (Date.now() - wait) / 1000, 'ms')
  excute = Date.now()

  console.log(new Date(before))
  let activities = await coding.getActivities(before)

  let msgs = (await Promise.mapSeries(activities, (activity) => {
    let method = coding[activity.target_type]

    if (method) return method(activity)
    else return coding.newType(activity)
  })).filter(m => m)

  if (msgs && msgs.length > 0) {
    if (msgs.length > limit) {
      let _msgs = msgs
      msgs = new Array(limit)

      while (_msgs.length !== 0) {
        for (let i = 0; i < limit; i++) {
          if (_msgs.length === 0) break

          let msg = msgs[i]
          msgs[i] = msg ? dingding.mergeMarkdown(msg, _msgs.shift()) : msg = _msgs.shift()
        }
      }
    }

    await dingding.send(msgs)
  }

  console.log('excute:', (Date.now() - excute) / 1000, 'ms', '\n')
  wait = Date.now()
}
