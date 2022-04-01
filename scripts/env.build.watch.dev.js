import nodemon from 'nodemon'
import chalk from 'chalk'

nodemon({
  script: 'scripts/env.build.dev.js',
  watch: 'src',
  ext: 'html,pug,css,scss,js,ts,json,jpg,jpeg,png,gif,svg'
}).on('start', () => {
  console.log(chalk.bold('Nodemon watches src/'))
}).on('restart', files => {
  console.log(chalk.bold('Nodemon restarts due to a change in:'))
  console.log(chalk.grey(files.join('\n')))
}).on('crash', () => {
  console.log(chalk.bold.red('Nodemon crashed'))
})
