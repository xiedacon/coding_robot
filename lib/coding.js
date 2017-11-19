'use strict'

const engine = require('art-template')

const request = require('./request')
const dingding = require('./dingding')
const { coding } = require('../config')
const utils = require('./utils')
const types = require('./types')
const messages = require('./message')

const codingUser = coding.domain.split('.')[0]
const base = `https://${coding.domain}`
const projectUrl = `${base}/api/user/${codingUser}/project/${coding.project}`

exports.getMsgs = async (before) => {
  let activities = await exports.getActivities(before)

  let msgs = (await Promise.mapSeries(activities.reverse(), async (activity) => {
    let targetType = activity.target_type
    let method = utils.get(types, targetType, () => {
      return { newType: true }
    })

    let data = await method(activity)
    if (!data) return

    let mk
    if (data.newType) {
      data = await types.newType(activity)
      mk = utils.get(messages, 'newType')
    } else {
      mk = utils.get(messages, [targetType, data.action])
    }

    if (!mk) return

    mk = engine.render(mk.replace(/^\n*/, '').replace(/\n*$/, ''), data.data)
    return dingding.markdown(mk.split(/\n[ ]*\n/))
  })).filter(m => m)

  return msgs
}

let mergeCache = Object.create(null)
exports.getMerge = async (id) => {
  let merge = mergeCache[id]
  try {
    if (!merge) merge = await request(`${projectUrl}/git/merge/${id}`)
  } catch (err) {
    if (err.message.indexOf('1227') < 0) throw err
    else return
  }

  mergeCache[id] = merge
  return merge
}

let commitCache = Object.create(null)
exports.getCommit = async (id) => {
  let commit = commitCache[id]
  try {
    if (!commit) commit = await request(`${projectUrl}/git/commit/${id}`)
  } catch (err) {
    if (err.message.indexOf('1212') < 0) throw err
    else return
  }

  commitCache[id] = commit
  return commit
}

let project
exports.getProject = async () => {
  if (project) return project
  else project = await request(projectUrl)

  return project
}

exports.getActivities = async (before, lastId = 999999999) => {
  let projectId = (await exports.getProject()).id

  let activities = await request(`${base}/api/project/${projectId}/activities?last_id=${lastId}&type=all&user_filter=0`)

  if (activities.length === 0) return []

  if (activities.some(activity => activity.created_at < before)) {
    return activities.filter(activity => activity.created_at >= before)
  }

  return activities.concat(await exports.getActivities(before, activities[activities.length - 1].id))
}

let reviewersCache = Object.create(null)
exports.getReviewers = async (id) => {
  let reviewers = reviewersCache[id]

  try {
    if (!reviewers) {
      reviewers = await request(`${projectUrl}/git/merge/${id}/reviewers`)
      reviewers = reviewers.reviewers.map(reviewer => reviewer.reviewer)
    }
  } catch (err) {
    if (err.message.indexOf('1227') < 0) throw err
    else return []
  }

  reviewersCache[id] = reviewers
  return reviewers
}

let watchersCache = Object.create(null)
exports.getWatchers = async (id) => {
  let watchers = watchersCache[id]

  try {
    if (!watchers) {
      watchers = await request(`${projectUrl}/task/${id}/watchers`)
      watchers = watchers.list
    }
  } catch (err) {
    let exceptError = [1227, 1600]
    if (exceptError.indexOf(JSON.parse(err.message).code) < 0) throw err
    else return []
  }

  watchersCache[id] = watchers
  return watchers
}
