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
  ext: THIS_BUILD_CONFIG.build_watched_extensions.join(','),
  delay: '200'
}).on('start', () => {
  console.log(chalk.bgBlack.white.bold(`ENV SERVE: nodemon watches ${distDirRelPath}/`))
}).on('restart', () => {
  console.log(chalk.bgBlack.white.bold('ENV SERVE: nodemon restarts'))
}).on('crash', () => {
  console.log(chalk.bold.bgRed('ENV SERVE: nodemon crashed'))
})
