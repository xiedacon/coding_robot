'use strict'

exports.get = (obj, path, defaultVal) => {
  if (!obj) return defaultVal
  if (typeof path === 'string') path = path.split('.')
  if (!Array.isArray(path)) return defaultVal

  for (let prop of path) {
    obj = obj[prop]
    if (!obj) return defaultVal
  }

  return obj
}

exports.set = (obj, path, val) => {
  if (!obj) return obj
  if (typeof path === 'string') path = path.split('.')
  if (!Array.isArray(path)) return obj

  if (path.length === 0) return obj
  if (path.length === 1) {
    obj[path[0]] = val
    return obj
  } else {
    let key = path.shift()
    obj[key] = obj[key] || {}

    return exports.set(obj[key], path, val)
  }
}
