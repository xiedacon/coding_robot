'use strict'

const toMarkdown = require('to-markdown')

const coding = require('./coding')

const { coding: codingConfig, core } = require('../config')

const base = `https://${codingConfig.domain}`

exports.CommitLineNote = async (activity) => {
  activity.action = activity.line_note.noteable_type
  let { action, newType, data } = await baseData(activity)
  data.title = activity.line_note.noteable_title
  data.link = base + activity.line_note.noteable_url
  data.content = toMarkdown(activity.line_note.content)

  switch (action) {
    case 'MergeRequestBean':
      let mergeId = activity.line_note.noteable_url.split('/').pop()

      let merge = await coding.getMerge(mergeId)
      if (!merge) return

      data.merge = merge
      data.author = merge.merge_request.author.name
      break
    case 'Commit':
      let commitId = activity.line_note.commit_id

      let comment = await coding.getCommit(commitId)
      if (!comment) return

      data.comment = comment
      data.author = comment.commitDetail.committer.name
      break
    default:
      newType = true
  }

  return {
    action,
    newType,
    data
  }
}

exports.Depot = async (activity) => {
  let { action, newType, data } = await baseData(activity)
  data.branch = activity.ref

  switch (activity.push_type) {
    case 'delete':
    case 'push':
    case 'create':
    case 'new':
    case 'restore':
      break
    default:
      newType = true
  }

  return {
    action,
    newType,
    data
  }
}

exports.Wiki = async (activity) => {
  let { action, newType, data } = await baseData(activity)
  data.title = activity.wiki_title
  data.link = base + activity.wiki_path

  switch (activity.action) {
    case 'update':
    case 'create':
    case 'delete':
      break
    default:
      newType = true
  }

  return {
    action,
    newType,
    data
  }
}

exports.Task = async (activity) => {
  let { action, newType, data } = await taskData(activity)

  switch (action) {
    case 'commit_refer':
    case 'reassign':
    case 'update_deadline':
    case 'finish':
    case 'update_priority':
    case 'create':
    case 'update_description':
    case 'update_label':
    case 'delete':
    case 'restore':
    case 'add_milestone':
    case 'add_watcher':
    case 'remove_watcher':
    case 'remove_milestone':
    case 'update':
      break
    default:
      newType = true
  }

  return {
    action,
    newType,
    data
  }
}

exports.TaskComment = async (activity) => {
  let { action, newType, data } = await taskData(activity)
  data.content = toMarkdown(activity.taskComment.content)

  switch (action) {
    case 'delete':
    case 'create':
      break
    default:
      newType = true
  }

  return {
    action,
    newType,
    data
  }
}

exports.MergeRequestBean = async (activity) => {
  let { action, newType, data } = await baseData(activity)
  data.title = activity.merge_request_title
  data.link = base + activity.merge_request_path

  let reviewers = await coding.getReviewers(activity.merge_request_iid)
  if (reviewers.length === 0) {
    reviewers = codingConfig.developers.filter(d => d !== activity.user.name)
  } else {
    reviewers = reviewers.map(reviewer => reviewer.name)
  }
  data.reviewers = reviewers

  switch (action) {
    case 'grant':
    case 'update_content':
    case 'review_undo':
    case 'grant_undo':
    case 'del_reviewer':
    case 'update_title':
    case 'refuse':
    case 'merge':
    case 'review':
    case 'create':
    case 'push':
      break
    case 'add_reviewer':
      data.reviewer = activity.reviewer.name
      break
    default:
      newType = true
  }

  return {
    action,
    newType,
    data
  }
}

exports.ProjectFile = async (activity) => {
  let { action, newType, data } = await baseData(activity)
  data.file = activity.file

  switch (activity.action) {
    case 'upload_file':
    case 'move_file_or_dir':
    case 'delete_file':
    case 'rename':
    case 'create_dir':
    case 'update_dir':
    case 'create':
      break
    default:
      newType = true
  }

  return {
    action,
    newType,
    data
  }
}

exports.Milestone = async (activity) => {
  let { action, newType, data } = await baseData(activity)
  data.title = activity.milestone.name
  data.link = `${base}/p/${codingConfig.project}/milestone/${activity.milestone.id}`
  data.description = activity.milestone.description
  data.startDate = activity.milestone.start_date
  data.pulishDate = activity.milestone.publish_date

  switch (activity.action) {
    case 'create':
    case 'publish':
    case 'delete':
    case 'update':
      break
    default:
      newType = true
  }

  return {
    action,
    newType,
    data
  }
}

exports.ProjectTweet = async (activity) => {
  let { action, newType, data } = await baseData(activity)
  data.content = activity.content

  switch (activity.action) {
    case 'update':
    case 'create':
      break
    default:
      newType = true
  }

  return {
    action,
    newType,
    data
  }
}

exports.ProjectMember = async (activity) => {
  let { action, newType, data } = await baseData(activity)
  data.member = activity.target_user.name

  switch (activity.action) {
    case 'add':
      break
    default:
      newType = true
  }

  return {
    action,
    newType,
    data
  }
}

exports.Project = async (activity) => {
  let { action, newType, data } = await baseData(activity)

  switch (activity.action) {
    case 'update':
    case 'create':
      break
    default:
      newType = true
  }

  return {
    action,
    newType,
    data
  }
}

exports.newType = async (activity) => {
  let { action, newType, data } = await baseData({ action: 'newType', user: {} })

  let project = await coding.getProject()
  data.managers = core.managers
  data.title = activity.id
  data.link = `${base}/api/project/${project.id}/activities?last_id=${parseInt(activity.id) + 1}`

  return {
    action,
    newType,
    data
  }
}

exports.error = async () => {
  let { action, newType, data } = baseData({ action: 'error', user: {} })

  data.managers = core.managers

  return {
    action,
    newType,
    data
  }
}

async function taskData (activity) {
  let { action, newType, data } = await baseData(activity)
  data.title = activity.task.title
  data.link = base + activity.task.path

  let watchers = await coding.getWatchers(activity.task.id)
  watchers = watchers.map(watcher => watcher.name)
  data.watchers = watchers

  return { action, newType, data }
}

async function baseData (activity) {
  let action = activity.action
  let newType = false
  let data = {
    user: activity.user.name
  }

  return { action, newType, data }
}
