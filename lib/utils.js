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
