'use strict'

const fs = require('fs')
const { resolve } = require('path')

const dingding = require('./lib/dingding')
const { sendMsgs } = require('./lib/msg')
const { core } = require('./config')

const interval = core.interval

let before = Date.now();

(function loop () {
  setTimeout(async () => {
    let _before = before
    before = Date.now()
    await sendMsgs(_before)
    loop()
  }, interval * 1000)
})()

process.on('unhandledRejection', (reason, promise) => {
  fs.writeFileSync(resolve(__dirname, './error'), reason.stack)
  let msg = dingding.markdown([
    '####[程序发生错误]()',
    `@${core.manager}`
  ])
  dingding.send(msg)
})

console.log('start app\n')
