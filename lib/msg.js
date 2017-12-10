'use strict'

const coding = require('./coding')
const dingding = require('./dingding')

exports.sendMsgs = async (before) => {
  let msgs = await coding.getMsgs(before)

  if (msgs && msgs.length > 0) {
    await dingding.send(msgs)
  }
}
