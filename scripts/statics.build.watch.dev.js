import nodemon from 'nodemon'
import chalk from 'chalk'
import MASTER_CONFIG from '../build.config.js'

nodemon({
  script: 'scripts/statics.build.dev.js',
  watch: MASTER_CONFIG.statics.src_rel_path,
  ext: 'txt,md,html,pug,css,scss,js,ts,json,jpg,jpeg,png,gif,svg'
}).on('start', () => {
  console.log(chalk.bgBlack.white.bold(`STATICS BUILD: nodemon watches ${MASTER_CONFIG.statics.src_rel_path}/`))
}).on('restart', files => {
  console.log(chalk.bgBlack.white.bold('STATICS BUILD: nodemon restarts due to a change in:'))
  console.log(chalk.grey(files.join('\n')))
}).on('crash', () => {
  console.log(chalk.bold.white.bgRed('STATICS BUILD: nodemon crashed'))
})
