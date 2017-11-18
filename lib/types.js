'use strict'

const toMarkdown = require('to-markdown')

const coding = require('./coding')

const { coding: codingConfig, core } = require('../config')

const base = `https://${codingConfig.domain}`

exports.CommitLineNote = async (activity) => {
  let action = activity.line_note.noteable_type
  let newType = false
  let baseData = {
    title: activity.line_note.noteable_title,
    link: base + activity.line_note.noteable_url,
    user: activity.user.name,
    content: toMarkdown(activity.line_note.content)
  }

  let extendData = {}
  switch (action) {
    case 'MergeRequestBean':
      let mergeId = activity.line_note.noteable_url.split('/').pop()

      let merge = await coding.getMerge(mergeId)
      if (!merge) return

      extendData.merge = merge
      extendData.author = merge.merge_request.author.name
      break
    case 'Commit':
      let commitId = activity.line_note.commit_id

      let comment = await coding.getCommit(commitId)
      if (!comment) return

      extendData.comment = comment
      extendData.author = comment.commitDetail.committer.name
      break
    default:
      newType = true
  }

  return {
    action,
    newType,
    data: Object.assign({}, baseData, extendData)
  }
}

exports.Depot = async (activity) => {
  let newType = false

  switch (activity.push_type) {
    case 'delete':
    case 'push':
    case 'create':
    case 'new':
    case 'restore':
      return
    default:
      newType = true
  }

  return {
    newType
  }
}

exports.Wiki = async (activity) => {
  let newType = false

  switch (activity.action) {
    case 'update':
    case 'create':
    case 'delete':
      return
    default:
      newType = true
  }

  return {
    newType
  }
}

exports.Task = async (activity) => {
  let newType = false

  switch (activity.action) {
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
      return
    default:
      newType = true
  }

  return {
    newType
  }
}

exports.TaskComment = async (activity) => {
  let action = activity.action
  let newType = false
  let baseData = {
    title: activity.task.title,
    link: base + activity.task.path,
    user: activity.user.name,
    content: toMarkdown(activity.taskComment.content)
  }

  let extendData = {}
  switch (action) {
    case 'delete':
      return
    case 'create':
      let watchers = await coding.getWatchers(activity.task.id)
      watchers = watchers.map(watcher => watcher.name)

      extendData.watchers = watchers
      break
    default:
      newType = true
  }

  return {
    action,
    newType,
    data: Object.assign({}, baseData, extendData)
  }
}

exports.MergeRequestBean = async (activity) => {
  let action = activity.action
  let newType = false
  let baseData = {
    title: activity.merge_request_title,
    link: base + activity.merge_request_path,
    user: activity.user.name,
    content: ''
  }

  let extendData = {}

  let reviewers = await coding.getReviewers(activity.merge_request_iid)
  if (reviewers.length === 0) {
    reviewers = codingConfig.developers.filter(d => d !== activity.user.name)
  } else {
    reviewers = reviewers.map(reviewer => reviewer.name)
  }
  extendData.reviewers = reviewers

  switch (action) {
    case 'grant':
    case 'update_content':
    case 'review_undo':
    case 'grant_undo':
    case 'del_reviewer':
    case 'update_title':
    case 'refuse':
      return
    case 'merge':
    case 'review':
    case 'create':
    case 'push':
      break
    case 'add_reviewer':
      extendData.reviewer = activity.reviewer.name
      break
    default:
      newType = true
  }

  return {
    action,
    newType,
    data: Object.assign({}, baseData, extendData)
  }
}

exports.ProjectFile = async (activity) => {
  let newType = false

  switch (activity.action) {
    case 'upload_file':
    case 'move_file_or_dir':
    case 'delete_file':
    case 'rename':
    case 'create_dir':
    case 'update_dir':
    case 'create':
      return
    default:
      newType = true
  }

  return {
    newType
  }
}

exports.Milestone = async (activity) => {
  let newType = false

  switch (activity.action) {
    case 'create':
    case 'publish':
    case 'delete':
    case 'update':
      return
    default:
      newType = true
  }

  return {
    newType
  }
}

exports.ProjectTweet = async (activity) => {
  let newType = false

  switch (activity.action) {
    case 'update':
    case 'create':
      return
    default:
      newType = true
  }

  return {
    newType
  }
}

exports.ProjectMember = async (activity) => {
  let newType = false

  switch (activity.action) {
    case 'add':
      return
    default:
      newType = true
  }

  return {
    newType
  }
}

exports.Project = async (activity) => {
  let newType = false

  switch (activity.action) {
    case 'update':
    case 'create':
      return
    default:
      newType = true
  }

  return {
    newType
  }
}

exports.newType = async (activity) => {
  let project = await coding.getProject()
  return {
    data: {
      managers: core.managers,
      title: activity.id,
      link: `${base}/api/project/${project.id}/activities?last_id=${parseInt(activity.id) + 1}`,
      project
    }
  }
}
