'use strict'

const Promise = require('bluebird')

const request = require('./request')
const coding = require('./utils/coding')
const dingding = require('./utils/dingding')
const { core, coding: codingConfig } = require('./config')

const interval = core.interval
const limit = core.interval / 60 * core.limit

let before = Date.now();

(function loop () {
  setTimeout(async () => {
    let _before = before
    before = Date.now()
    await sendMsgs(_before)
    loop()
  }, interval * 1000)
})()

let excute
let wait = Date.now()

async function sendMsgs (before) {
  console.log('wait:', (Date.now() - wait) / 1000, 'ms')
  excute = Date.now()

  console.log(new Date(before))
  let activities = await getActivities(before)

  let msgs = (await Promise.mapSeries(activities, (activity) => {
    let method = coding[activity.target_type]

    if (method) return method(activity)
    else console.log(activity)
  })).filter(m => m)

  if (msgs) {
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

  console.log('excute:', (Date.now() - excute) / 1000, 'ms')
  wait = Date.now()
}

async function getActivities (before, lastId = 999999999) {
  let activities = await request(`https://${codingConfig.domain}/api/project/${codingConfig.projectId}/activities?last_id=${lastId}&type=all&user_filter=0`)

  if (activities.length === 0) return []

  if (activities.some(activity => activity.created_at < before)) {
    return activities.filter(activity => activity.created_at >= before)
  }

  return activities.concat(await getActivities(before, activities[activities.length - 1].id))
}
