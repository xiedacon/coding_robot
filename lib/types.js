'use strict'

const toMarkdown = require('to-markdown')

const coding = require('./coding')

const { coding: codingConfig, core } = require('../config')

const base = `https://${codingConfig.domain}`

let types = {}

types.CommitLineNote = async ({ action, newType, data }, activity) => {
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

  return { newType, data }
}

types.Depot = async ({ action, newType, data }, activity) => {
  data.branch = activity.ref

  switch (action) {
    case 'new':
    case 'create':
    case 'push':
    case 'delete':
    case 'restore':
      break
    default:
      newType = true
  }

  return { newType, data }
}

types.Wiki = async ({ action, newType, data }, activity) => {
  data.title = activity.wiki_title
  data.link = base + activity.wiki_path

  switch (action) {
    case 'create':
    case 'update':
    case 'delete':
      break
    default:
      newType = true
  }

  return { newType, data }
}

types.Task = async ({ action, newType, data }, activity) => {
  switch (action) {
    case 'create':
    case 'update':
    case 'update_label':
    case 'update_description':
    case 'update_priority':
    case 'update_deadline':
    case 'add_milestone':
    case 'remove_milestone':
    case 'add_watcher':
    case 'remove_watcher':
    case 'reassign':
    case 'commit_refer':
    case 'finish':
    case 'delete':
    case 'restore':
      break
    default:
      newType = true
  }

  return { newType, data }
}

types.TaskComment = async ({ action, newType, data }, activity) => {
  data.content = toMarkdown(activity.taskComment.content)

  switch (action) {
    case 'create':
    case 'delete':
      break
    default:
      newType = true
  }

  return { newType, data }
}

types.MergeRequestBean = async ({ action, newType, data }, activity) => {
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
    case 'create':
    case 'update_title':
    case 'update_content':
      break
    case 'add_reviewer':
      data.reviewer = activity.reviewer.name
      break
    case 'del_reviewer':
    case 'review':
    case 'review_undo':
    case 'grant':
    case 'grant_undo':
    case 'push':
    case 'merge':
    case 'refuse':
      break
    default:
      newType = true
  }

  return { newType, data }
}

types.ProjectFile = async ({ action, newType, data }, activity) => {
  data.file = activity.file

  switch (action) {
    case 'create':
    case 'rename':
    case 'create_dir':
    case 'update_dir':
    case 'upload_file':
    case 'delete_file':
    case 'move_file_or_dir':
      break
    default:
      newType = true
  }

  return { newType, data }
}

types.Milestone = async ({ action, newType, data }, activity) => {
  data.title = activity.milestone.name
  data.link = `${base}/p/${codingConfig.project}/milestone/${activity.milestone.id}`
  data.description = activity.milestone.description
  data.startDate = activity.milestone.start_date
  data.pulishDate = activity.milestone.publish_date

  switch (action) {
    case 'create':
    case 'update':
    case 'publish':
    case 'delete':
      break
    default:
      newType = true
  }

  return { newType, data }
}

types.ProjectTweet = async ({ action, newType, data }, activity) => {
  data.content = activity.content

  switch (action) {
    case 'create':
    case 'update':
      break
    default:
      newType = true
  }

  return { newType, data }
}

types.ProjectMember = async ({ action, newType, data }, activity) => {
  data.member = activity.target_user.name

  switch (action) {
    case 'add':
      break
    default:
      newType = true
  }

  return { newType, data }
}

types.Project = async ({ action, newType, data }, activity) => {
  switch (action) {
    case 'create':
    case 'update':
      break
    default:
      newType = true
  }

  return { newType, data }
}

types.newType = async ({ action, newType, data }, activity) => {
  let project = await coding.getProject()
  data.managers = core.managers
  data.title = activity.id
  data.link = `${base}/api/project/${project.id}/activities?last_id=${parseInt(activity.id) + 1}`

  return { data }
}

types.error = async ({ action, newType, data }, activity) => {
  data.managers = core.managers

  return { data }
}

async function taskData (activity) {
  let { type, action, newType, data } = await baseData(activity)
  data.title = activity.task.title
  data.link = base + activity.task.path

  let watchers = await coding.getWatchers(activity.task.id)
  watchers = watchers.map(watcher => watcher.name)
  data.watchers = watchers

  return { type, action, newType, data }
}

async function baseData (activity) {
  let action = activity.action
  let newType = false
  let type = activity.target_type
  let data = {
    user: activity.user.name
  }

  return { type, action, newType, data }
}

let taskActions = ['TaskComment', 'Task']

Object.keys(types).forEach((key) => {
  exports[key] = async (activity) => {
    if (key === 'error') activity = { action: 'error', user: {} }
    if (key === 'newType') activity = { action: 'newType', user: {} }
    if (key === 'CommitLineNote') activity.action = activity.line_note.noteable_type
    if (key === 'Depot') activity.action = activity.push_type

    let base
    if (taskActions.indexOf(activity.target_type) < 0) base = await baseData(activity)
    else base = await taskData(activity)

    let { action, type } = base
    let { newType, data } = await types[key].call(null, base, activity)

    return { newType, data, action, type }
  }
})
