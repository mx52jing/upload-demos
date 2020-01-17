const path = require('path')
const shell = require('shelljs')
const argv = require('yargs').argv

const defaultPort = 8100,
    {_, p: port} = argv,
    directoryName = _[0],
    excutePath = path.resolve(__dirname, `../${directoryName}/server`)

shell.env['PORT'] = port || defaultPort

shell
    .cd(excutePath)
    .exec('nodemon index.js')

