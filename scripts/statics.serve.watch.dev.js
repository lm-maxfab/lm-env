import nodemon from 'nodemon'
import path from 'path'
import chalk from 'chalk'
import MASTER_CONFIG from '../build.config.js'

const STATICS_CONFIG = MASTER_CONFIG.statics
const THIS_BUILD_CONFIG = STATICS_CONFIG.builds.find(build => build.name === 'dev')

const __dirname = process.cwd()
const distDirRelPath = THIS_BUILD_CONFIG.build_output_rel_path
const distDirPath = path.join(__dirname, distDirRelPath)

nodemon({
  script: 'scripts/statics.serve.dev.js',
  watch: distDirPath,
  ext: 'txt,md,html,pug,css,scss,js,ts,json,jpg,jpeg,png,gif,svg',
  delay: '200'
}).on('start', () => {
  console.log(chalk.bgBlack.white.bold(`STATICS SERVE: nodemon watches ${distDirRelPath}/`))
}).on('restart', files => {
  console.log(chalk.bgBlack.white.bold('STATICS SERVE: nodemon restarts due to a change in:'))
  console.log(chalk.grey(files.join('\n')))
}).on('crash', () => {
  console.log(chalk.bold.white.bgRed('STATICS SERVE: nodemon crashed'))
})
