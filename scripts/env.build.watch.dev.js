import nodemon from 'nodemon'
import path from 'path'
import chalk from 'chalk'
import MASTER_CONFIG from '../build.config.js'

const ENV_CONFIG = MASTER_CONFIG.env
const THIS_BUILD_CONFIG = ENV_CONFIG.builds.find(build => build.name === 'dev')

const __dirname = process.cwd()
const srcDirRelPath = ENV_CONFIG.src_rel_path
const srcDirPath = path.join(__dirname, srcDirRelPath)

nodemon({
  script: 'scripts/env.build.dev.js',
  watch: srcDirPath,
  ext: THIS_BUILD_CONFIG.source_watched_extensions.join(','),
  delay: '200'
}).on('start', () => {
  console.log(chalk.bgBlack.white.bold(`ENV BUILD: nodemon watches ${srcDirRelPath}/`))
}).on('restart', () => {
  console.log(chalk.bgBlack.white.bold('ENV BUILD: nodemon restarts'))
}).on('crash', () => {
  console.log(chalk.bold.bgRed('ENV BUILD: nodemon crashed'))
})
