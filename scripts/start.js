const path = require('path')
const chalk = require('chalk')
const shell = require('shelljs')
const argv = require('yargs').argv

const defaultPort = 8100,
    { _, p: port } = argv,
    directoryName = _[0], // 获取启动文件夹名称
    excutePath = path.resolve(__dirname, `../${directoryName}/server`) // 获取启动文件的绝对路径

shell.env['PORT'] = port || defaultPort

shell.echo(
    chalk.cyan(`启动文件夹:【${directoryName}】\n`),
    // chalk.magenta(`启动文件夹路径:【${excutePath}】\n`),
    chalk.magenta(`启动端口:【${port}】`)
)

shell
    .cd(excutePath)
    .exec('nodemon index.js')

