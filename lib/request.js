'use strict'

const superagent = require('superagent')
const { coding } = require('../config')

module.exports = async function request (url) {
  console.log(url)
  let { err, body } = await superagent
    .agent()
    .get(url)
    .set({
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh;q=0.8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Cookie': coding.cookie,
      'Host': coding.domain,
      'Pragma': 'no-cache',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
    })

  if (err) throw err
  if (body.code !== 0) throw new Error(JSON.stringify(body))

  return body.data
}
