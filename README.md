# coding_robot

[![Build Status](https://travis-ci.org/xiedacon/coding_robot.svg?branch=master)](https://travis-ci.org/xiedacon/coding_robot)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/xiedacon/coding_robot/blob/master/LICENSE)

## Usage

```shell
git clone https://github.com/xiedacon/coding_robot.git

cd ./coding_robot
cp ./config.example.js ./config.js
cp ./messages.example.md ./messages.md

修改 config.js: 
  dingding.hook => 钉钉机器人 webhook 地址
  coding.cookie => Coding 的 Cookie
  coding.domain => Coding 企业版域名
  coding.project => 需要添加机器人的项目名

node app.js

到对应的项目发个任务或者 MR 即可
```

## Config

```js
exports.dingding = {
  robots: [
    {
      actions: ['机器人需要监听的消息类型匹配'],
      hook: '钉钉机器人 webhook 地址',
      remark: 'develop'
    },
    ...
  ],
  users: [
    { realname: '钉钉昵称', name: '钉钉手机号' }
  ],
  Render: "钉钉消息渲染函数，默认：require('./render/markdown')"
}

exports.coding = {
  cookie: 'Coding 的 Cookie',
  domain: 'Coding 企业版域名',
  project: '需要添加机器人的项目名',
  developers: ['开发者']
}

exports.core = {
  schedule: 'node-schedule 的时间格式',
  managers: ['Coding 机器人管理员']
}

exports.messagesPath = resolve(__dirname, './messages.md')
```

### Render

需要提供 ``render`` 和 ``merge`` 两个函数，``render`` 函数用于将消息文本转换为 [钉钉支持的数据格式](https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.tX66v4&treeId=257&articleId=105735&docType=1#s2)，``merge`` 函数用于将 [超出频率限制](https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.tX66v4&treeId=257&articleId=105735&docType=1#s5) 的消息合并

### messages.md

钉钉消息模板，格式为：

```md
---
Coding 动态类型
---

markdown 提醒
```

## API

|Coding 消息类型|发生情况|可用变量|
|--|--|--|
|CommitLineNote.MergeRequestBean|在 MergeRequest 中评论|user, title, link, content, merge, author|
|CommitLineNote.Commit|在 Commit 中评论|user, title, link, content, commit, author|
|Depot.new||user, brach|
|Depot.create||user, brach|
|Depot.push||user, brach|
|Depot.delete||user, brach|
|Depot.restore||user, brach|
|Wiki.create|创建项目 Wiki|user, title, link|
|Wiki.update|更新项目 Wiki|user, title, link|
|Wiki.delete|删除项目 Wiki|user, title, link|
|Task.create|创建任务|user, title, link, watchers|
|Task.update|更新任务|user, title, link, watchers|
|Task.update_label|更新任务标签|user, title, link, watchers|
|Task.update_description|更新任务描述|user, title, link, watchers|
|Task.update_priority|更新任务紧急程度|user, title, link, watchers|
|Task.update_deadline|更新任务截止日期|user, title, link, watchers|
|Task.add_milestone|添加任务版本|user, title, link, watchers|
|Task.remove_milestone|移除任务版本|user, title, link, watchers|
|Task.add_watcher|添加任务关注者|user, title, link, watchers|
|Task.remove_watcher|移除任务关注者|user, title, link, watchers|
|Task.reassign|指派任务给 xx|user, title, link, watchers|
|Task.commit_refer|xx 在代码中提到了这个任务|user, title, link, watchers|
|Task.finish|完成任务|user, title, link, watchers|
|Task.delete|删除任务|user, title, link, watchers|
|Task.restore|恢复任务|user, title, link, watchers|
|TaskComment.create|添加任务评论|user, title, link, content, watchers|
|TaskComment.delete|删除任务评论|user, title, link, content, watchers|
|MergeRequestBean.create|创建 MergeRequest|user, title, link, reviewers|
|MergeRequestBean.update_title|更新 MergeRequest 的标题|user, title, link, reviewers|
|MergeRequestBean.update_content|更新 MergeRequest 的描述|user, title, link, reviewers|
|MergeRequestBean.add_reviewer|添加评审者|user, title, link, reviewers, reviewer|
|MergeRequestBean.del_reviewer|删除评审者|user, title, link, reviewers|
|MergeRequestBean.review|允许合并|user, title, link, reviewers|
|MergeRequestBean.review_undo|撤销允许合并|user, title, link, reviewers|
|MergeRequestBean.grant|授权 MergeRequest|user, title, link, reviewers|
|MergeRequestBean.grant_undo|撤销授权|user, title, link, reviewers|
|MergeRequestBean.push|推送到 MergeRequest|user, title, link, reviewers|
|MergeRequestBean.merge|合并 MergeRequest|user, title, link, reviewers|
|MergeRequestBean.refuse|拒绝 MergeRequest|user, title, link, reviewers|
|ProjectFile.create|||
|ProjectFile.rename|||
|ProjectFile.create_dir|||
|ProjectFile.update_dir|||
|ProjectFile.upload_file|||
|ProjectFile.delete_file|||
|ProjectFile.move_file_or_dir|||
|Milestone.create|创建版本|user, title, link, description, startDate, pulishDate|
|Milestone.update|更新版本|user, title, link, description, startDate, pulishDate|
|Milestone.publish|发布版本|user, title, link, description, startDate, pulishDate|
|Milestone.delete|删除版本|user, title, link, description, startDate, pulishDate|
|ProjectTweet.create||user, content|
|ProjectTweet.update||user, content|
|ProjectMember.add|添加项目成员|user, member|
|Project.create|创建项目|user|
|Project.update|更新项目|user|
|newType|发现新类型 ( 可无视 ) |managers, title, link|

## TODO

* 错误处理策略
* 控制策略
* test
* web 端可视化配置
* serverless
* 使用 class 语法重构

## License

[MIT License](https://github.com/xiedacon/coding_robot/blob/master/LICENSE)

Copyright (c) 2017 xiedacon