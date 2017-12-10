'use strict'

const fs = require('fs')
const { resolve } = require('path')
const schedule = require('node-schedule')

const dingding = require('./lib/dingding')
const coding = require('./lib/coding')
const { sendMsgs } = require('./lib/msg')
const { core } = require('./config')

schedule.scheduleJob(core.schedule, async () => {
  await sendMsgs(Date.now())
})

process.on('unhandledRejection', async (reason, promise) => {
  fs.writeFileSync(resolve(__dirname, './error'), reason.stack)
  dingding.send(await coding.error())
})

console.log('start app\n')
