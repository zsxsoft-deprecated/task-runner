task-runner
======================
[![David deps](https://david-dm.org/zsxsoft/task-runner.svg)](https://david-dm.org/zsxsoft/task-runner)

这个项目的本意是做一个贴吧的自动删贴器，没成想，做成了自己试验新技术的平台 + 一个计划任务运行框架了……

config.json支持热更新，每次更新该文件后会自动重新加载系统内模块。

至于cronTime什么意思？https://github.com/ncb000gt/node-cron ←大概这里说的很清楚。

剩下的，懒得写了，反正是给自己用的玩意。

等tsc支持把async编译到es5后就上TypeScript，扔掉babel……

### 开发
```bash
babel --watch src --out-dir build
supervisor -w build index 
```

### 生产
```bash
npm run build
node index
```