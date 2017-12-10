'use strict'

const utils = require('./utils')
const messages = require('./message')
const { dingding: { robots } } = require('../config')

let robotMap = robots.reduce((robotMap, robot) => {
  robot.actions.forEach((robotAction) => {
    parseRobotAction(robotAction)
      .forEach((path) => {
        let robots = utils.get(robotMap, path, [])
        robots.push(robot.hook)
        utils.set(robotMap, path, robots)
      })
  })

  return robotMap
}, {})

function parseRobotAction (robotAction) {
  return getAllPaths(messages, robotAction.split('.'))
}

function getAllPaths (obj, fragments, i = 0) {
  if (fragments.length > i && typeof obj !== 'object') return []
  if (fragments.length === i) return typeof obj === 'object' ? [] : [[]]

  let fragment = fragments[i]
  let roots = [fragment]

  if (fragment === '*') roots = Object.keys(obj)
  if (fragment === '**') {
    roots = Object.keys(obj)
    i--
  }

  return roots.reduce((res, root) => {
    let childs = getAllPaths(obj[root], fragments, i + 1)

    if (fragment === '**' && childs.length === 0) childs = [[]]

    return res.concat(childs.map(child => [root].concat(child)))
  }, [])
}

module.exports = robotMap
