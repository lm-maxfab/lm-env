import nodemon from 'nodemon'
import path from 'path'
import chalk from 'chalk'
import MASTER_CONFIG from '../build.config.js'

const ENV_CONFIG = MASTER_CONFIG.env
const THIS_BUILD_CONFIG = ENV_CONFIG.builds.find(build => build.name === 'dev')

const __dirname = process.cwd()
const distDirRelPath = THIS_BUILD_CONFIG.build_output_rel_path
const distDirPath = path.join(__dirname, distDirRelPath)

nodemon({
  script: 'scripts/env.serve.dev.js',
  watch: distDirPath,
  ext: 'txt,md,html,pug,css,scss,js,ts,json,jpg,jpeg,png,gif,svg',
  delay: '200'
}).on('start', () => {
  console.log(chalk.bgBlack.white.bold(`ENV SERVE: nodemon watches ${distDirRelPath}/`))
}).on('restart', () => {
  console.log(chalk.bgBlack.white.bold('ENV SERVE: restarts'))
}).on('crash', () => {
  console.log(chalk.bold.bgRed('ENV SERVE: crashed'))
})
