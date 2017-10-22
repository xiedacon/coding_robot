'use strict'

const toMarkdown = require('to-markdown')

const request = require('./request')
const dingding = require('./dingding')
const { coding, core } = require('../config')

const base = `https://${coding.domain}`
const projectUrl = `${base}/api/user/${coding.user}/project/${coding.project}`

exports.CommitLineNote = async function (activity) {
  switch (activity.line_note.noteable_type) {
    case 'MergeRequestBean':
      let mergeId = activity.line_note.noteable_url.split('/').pop()

      let merge = await getMerge(mergeId)
      if (!merge) return

      return dingding.markdown(
        [
          `#### **[MR]** [${activity.line_note.noteable_title}](${base + activity.line_note.noteable_url})`,
          `@${merge.merge_request.author.name}`,
          `**${activity.user.name}** 在你的 MR 中评论了`,
          toMarkdown(activity.line_note.content)
        ]
      )
    case 'Commit':
      let commitId = activity.line_note.commit_id

      let comment = await getCommit(commitId)
      if (!comment) return

      return dingding.markdown(
        [
          `#### **[Commit]** [${activity.line_note.noteable_title}](${base + activity.line_note.noteable_url})`,
          `@${comment.commitDetail.committer.name}`,
          `**${activity.user.name}** 在你的 Commit 中评论了`,
          toMarkdown(activity.line_note.content)
        ]
      )
    default:
      return newType(activity)
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
      return newType(activity)
  }
}

exports.Wiki = function (activity) {
  switch (activity.action) {
    case 'update':
    case 'create':
      return
    default:
      return newType(activity)
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
      return newType(activity)
  }
}

exports.TaskComment = async function (activity) {
  switch (activity.action) {
    case 'delete':
      return
    case 'create':
      let watchers = await getWatchers(activity.task.id)
      watchers = watchers.map(watcher => watcher.name)

      return dingding.markdown(
        [
          `#### **[Task]** [${activity.task.title}](${base + activity.task.path})`,
          `@${watchers.join(' @')}`,
          `**${activity.user.name}** 评论了你关注的任务`,
          toMarkdown(activity.taskComment.content)
        ]
      )
    default:
      return newType(activity)
  }
}

exports.MergeRequestBean = async function (activity) {
  let mergeId, reviewers
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
      mergeId = activity.merge_request_iid

      reviewers = await getReviewers(mergeId)
      if (reviewers.length === 0) {
        reviewers = coding.developers.filter(d => d !== activity.user.name)
      } else {
        reviewers = reviewers.map(reviewer => reviewer.name)
      }

      return dingding.markdown(
        [
          `#### **[MR]** [${activity.merge_request_title}](${base + activity.merge_request_path})`,
          `@${reviewers.join(' @')}`,
          `**${activity.user.name}** 创建了新的 MR`
        ]
      )
    case 'push':
      mergeId = activity.line_note.noteable_url.split('/').pop()

      reviewers = await getReviewers(mergeId)
      if (reviewers.length === 0) {
        reviewers = coding.developers.filter(d => d !== activity.user.name)
      } else {
        reviewers = reviewers.map(reviewer => reviewer.name)
      }

      return dingding.markdown(
        [
          `#### **[MR]** [${activity.merge_request_title}](${base + activity.merge_request_path})`,
          `@${reviewers.join(' @')}`,
          `**${activity.user.name}** 推送了新的提交到 [${activity.merge_request_title}](${base + activity.merge_request_path})`
        ]
      )
    case 'add_reviewer':
      return dingding.markdown(
        [
          `#### **[MR]** [${activity.merge_request_title}](${base + activity.merge_request_path})`,
          `@${activity.reviewer.name}`,
          `**${activity.user.name}** 添加你为评审者`
        ]
      )
    default:
      return newType(activity)
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
      return newType(activity)
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
      return newType(activity)
  }
}

exports.ProjectTweet = function (activity) {
  switch (activity.action) {
    case 'update':
    case 'create':
      return
    default:
      return newType(activity)
  }
}

exports.ProjectMember = function (activity) {
  switch (activity.action) {
    case 'add':
      return
    default:
      return newType(activity)
  }
}

exports.Project = function (activity) {
  switch (activity.action) {
    case 'update':
    case 'create':
      return
    default:
      return newType(activity)
  }
}

exports.newType = newType
function newType (activity) {
  return dingding.markdown(
    [
      `#### **[Coding]** [发现新类型]()`,
      `@${core.manager.join(' @')}`,
      `[${activity.id}](${base}/api/project/${coding.projectId}/activities?last_id=${parseInt(activity.id) + 1})`
    ]
  )
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

exports.getActivities = async function getActivities (before, lastId = 999999999) {
  let activities = await request(`${base}t/api/project/${coding.projectId}/activities?last_id=${lastId}&type=all&user_filter=0`)

  if (activities.length === 0) return []

  if (activities.some(activity => activity.created_at < before)) {
    return activities.filter(activity => activity.created_at >= before)
  }

  return activities.concat(await getActivities(before, activities[activities.length - 1].id))
}

let reviewersCache = Object.create(null)
async function getReviewers (id) {
  let reviewers = reviewersCache[id]

  try {
    if (!reviewers) {
      reviewers = await request(`${projectUrl}/git/merge/${id}/reviewers`)
      reviewers = reviewers.reviewers.map(reviewer => reviewer.reviewer)
    }
  } catch (err) {
    if (err.message.indexOf('1227') < 0) throw err
    else return
  }

  reviewersCache[id] = reviewers
  return reviewers
}

let watchersCache = Object.create(null)
async function getWatchers (id) {
  let watchers = watchersCache[id]

  try {
    if (!watchers) {
      watchers = await request(`${projectUrl}/task/${id}/watchers`)
      watchers = watchers.list
    }
  } catch (err) {
    if (err.message.indexOf('1227') < 0) throw err
    else return
  }

  watchersCache[id] = watchers
  return watchers
}
