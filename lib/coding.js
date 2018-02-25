'use strict'

const engine = require('art-template')
const Promise = require('bluebird')

const request = require('./request')
const dingding = require('./dingding')
const { coding, store } = require('../config')
const utils = require('./utils')
const types = require('./types')
const messages = require('./message')

const codingUser = coding.domain.split('.')[0]
const base = `https://${coding.domain}`
const projectUrl = `${base}/api/user/${codingUser}/project/${coding.project}`

exports.getMsgs = async (before) => {
  let activities = await exports.getActivities(before)

  let msgs = (await Promise.mapSeries(activities, async (activity) => {
    let targetType = activity.target_type
    let method = utils.get(types, targetType, () => {
      return { newType: true }
    })

    let data = await method(activity)
    if (!data) return

    let content
    if (data.newType) {
      data = await types.newType(activity)
      content = utils.get(messages, 'newType')
    } else {
      content = utils.get(messages, [targetType, data.action])
    }

    if (!content) return

    content = engine.render(content.replace(/^\n*/, '').replace(/\n*$/, ''), data.data, { escape: false })
    return {
      message: dingding.render(data.data.title, content.split(/\n[ ]*\n/)),
      raw: data
    }
  })).filter(m => m)

  return msgs
}

exports.getMerge = async (id) => {
  return requestWrapper(`merge-${id}`, `${projectUrl}/git/merge/${id}`, 1227)
}

exports.error = async () => {
  let data = await types.error({})
  let content = utils.get(messages, 'error')

  content = engine.render(content.replace(/^\n*/, '').replace(/\n*$/, ''), data.data)
  return {
    message: dingding.render('程序发生错误', content.split(/\n[ ]*\n/)),
    raw: data
  }
}

exports.getCommit = async (id) => {
  return requestWrapper(`commit-${id}`, `${projectUrl}/git/commit/${id}`, 1212)
}

exports.getProject = async () => {
  return requestWrapper(`project`, projectUrl)
}

exports.getActivities = async (before, lastId = 999999999) => {
  let project = await exports.getProject()
  let activities = await requestWrapper(undefined, `${base}/api/project/${project.id}/activities?last_id=${lastId}&type=all&user_filter=0`)

  if (activities.length === 0) return []
  if (activities[activities.length - 1].created_at < before) {
    return activities.filter(activity => activity.created_at >= before)
  }

  return activities.concat(await exports.getActivities(before, activities[activities.length - 1].id))
}

exports.getReviewers = async (id) => {
  let reviewers = await requestWrapper(`merge-${id}-reviewers`, `${projectUrl}/git/merge/${id}/reviewers`, 1227, { reviewers: [] })

  reviewers = reviewers.reviewers.map(reviewer => reviewer.reviewer)

  return reviewers
}

exports.getWatchers = async (id) => {
  if (!id) return []
  let watchers = await requestWrapper(`task-${id}-watchers`, `${projectUrl}/task/${id}/watchers`, [1227, 1600], { list: [] })

  watchers = watchers.list

  return watchers
}

async function requestWrapper (key, url, exceptCodes = [], defaultVal) {
  if (!key) return tryCatch(() => request(url), Array.isArray(exceptCodes) ? exceptCodes : [exceptCodes], defaultVal)

  let val = await store.get(key)
  if (val) return val

  val = await tryCatch(() => request(url), Array.isArray(exceptCodes) ? exceptCodes : [exceptCodes], defaultVal)
  await store.set(key, val)

  return val
}

async function tryCatch (fn, exceptCodes, defaultVal) {
  try {
    return await fn()
  } catch (err) {
    if (exceptCodes.indexOf(JSON.parse(err.message).code) < 0) throw err
    else return Promise.resolve(defaultVal)
  }
}
