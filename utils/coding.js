'use strict'

const toMarkdown = require('to-markdown')

const request = require('../request')
const { coding } = require('../config')
const dingding = require('./dingding')

const base = `https://${coding.domain}`
const projectUrl = `${base}/api/user/${coding.user}/project/${coding.project}`

exports.CommitLineNote = async function (activity) {
  switch (activity.line_note.noteable_type) {
    case 'MergeRequestBean':
      let mergeId = activity.line_note.noteable_url.split('/').pop()

      let merge = await getMerge(mergeId)
      if (!merge) return

      return dingding.markdown(
        activity.line_note.noteable_title,
        base + activity.line_note.noteable_url,
        toMarkdown(activity.line_note.content),
        [merge.merge_request.author.name]
      )
    case 'Commit':
      let commitId = activity.line_note.commit_id

      let comment = await getCommit(commitId)
      if (!comment) return

      return dingding.markdown(
        activity.line_note.noteable_title,
        base + activity.line_note.noteable_url,
        toMarkdown(activity.line_note.content),
        [comment.commitDetail.committer.name]
      )
    default:
      console.log(activity)
  }
}

exports.Depot = function (activity) {
  switch (activity.push_type) {
    case 'delete':
    case 'push':
    case 'create':
    case 'new':
      return
    default:
      console.log(activity)
  }
}

exports.Wiki = function (activity) {
  switch (activity.action) {
    case 'update':
    case 'create':
      return
    default:
      console.log(activity)
  }
}

exports.Task = function (activity) {
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
      console.log(activity)
  }
}

exports.TaskComment = function (activity) {
  switch (activity.action) {
    case 'create':
      return dingding.markdown(
        activity.task.title,
        base + activity.task.path,
        toMarkdown(activity.taskComment.content)
      )
    case 'delete':
      return
    default:
      console.log(activity)
  }
}

exports.MergeRequestBean = function (activity) {
  switch (activity.action) {
    case 'merge':
    case 'grant':
    case 'review':
    case 'update_content':
    case 'review_undo':
    case 'grant_undo':
    case 'del_reviewer':
    case 'update_title':
    case 'refuse':
      return
    case 'create':
    case 'push':
      return dingding.markdown(
        activity.merge_request_title,
        base + activity.merge_request_path,
        `**${activity.user.name}** ${activity.action_msg} [${activity.merge_request_title}](${base + activity.merge_request_path})`,
        coding.developers.filter(d => d !== activity.user.name)
      )
    case 'add_reviewer':
      return dingding.markdown(
        activity.merge_request_title,
        base + activity.merge_request_path,
        `**${activity.user.name}** ${activity.action_msg} **${activity.reviewer.name}**`,
        [activity.reviewer.name]
      )
    default:
      console.log(activity)
  }
}

exports.ProjectFile = function (activity) {
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
      console.log(activity)
  }
}

exports.Milestone = function (activity) {
  switch (activity.action) {
    case 'create':
    case 'publish':
    case 'delete':
    case 'update':
      return
    default:
      console.log(activity)
  }
}

exports.ProjectTweet = function (activity) {
  switch (activity.action) {
    case 'update':
    case 'create':
      return
    default:
      console.log(activity)
  }
}

exports.ProjectMember = function (activity) {
  switch (activity.action) {
    case 'add':
      return
    default:
      console.log(activity)
  }
}

exports.Project = function (activity) {
  switch (activity.action) {
    case 'update':
    case 'create':
      return
    default:
      console.log(activity)
  }
}

let mergeCache = Object.create(null)
async function getMerge (id) {
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
async function getCommit (id) {
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
