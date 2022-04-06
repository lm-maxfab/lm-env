import nodemon from 'nodemon'
import chalk from 'chalk'
import MASTER_CONFIG from '../build.config.js'

nodemon({
  script: 'scripts/env.build.dev.js',
  watch: MASTER_CONFIG.env.src_rel_path,
  ext: 'txt,md,html,pug,css,scss,js,ts,json,jpg,jpeg,png,gif,svg'
}).on('start', () => {
  console.log(chalk.bgBlack.white.bold(`ENV BUILD: nodemon watches ${MASTER_CONFIG.env.src_rel_path}/`))
}).on('restart', files => {
  console.log(chalk.bgBlack.white.bold('ENV BUILD: nodemon restarts due to a change in:'))
  console.log(chalk.grey(files.join('\n')))
}).on('crash', () => {
  console.log(chalk.bold.bgRed('ENV BUILD: nodemon crashed'))
})
