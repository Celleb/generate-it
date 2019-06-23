#!/usr/bin/env node
require('colors')
const path = require('path')
const cli = require('./commander')()
const codegen = require('./lib')
const inquirer = require('inquirer')

console.log('All looks good, give me a moment to generate the server for you!'.yellow)

const go = (mockServer) => {
  codegen({
    swaggerFilePath: cli.swaggerFile,
    target_dir: cli.program.output,
    template: cli.program.template,
    handlebars_helper: cli.program.handlebars ? path.resolve(process.cwd(), cli.program.handlebars) : undefined,
    ignoredModules: cli.program.ignoredModules ? cli.program.ignoredModules.split(',') : [],
    mockServer: mockServer || false
  }).then(() => {
    console.log('Done! ✨'.green)
    console.log('Check out your shiny new API at '.yellow + cli.program.output.magenta + '.'.yellow)
  }).catch(err => {
    console.error('Aaww 💩. Something went wrong:'.red)
    console.error(err.stack.red || err.message.red)
  })
}

let question = 'All src/http/nodegen files will be replaced. Are you sure you want to continue? Press Y to continue.'
if (cli.program.mocked){
  question = 'All src/http/nodegen and src/domains/__mocks__ files will be replaced. Are you sure you want to continue? Press Y to continue.'
}
const questions = [{
  type: 'confirm',
  name: 'installConfirm',
  message: question,
  default: false
}]
inquirer.prompt(questions)
  .then((answers) => {
    if (answers.installConfirm) {
      go(true)
    } else {
      console.log('Aborted')
    }
  })
  .catch((e) => {
    console.error(e)
  })

process.on('unhandledRejection', (err) => console.error(err))