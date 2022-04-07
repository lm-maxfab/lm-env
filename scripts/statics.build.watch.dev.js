import nodemon from 'nodemon'
import path from 'path'
import chalk from 'chalk'
import MASTER_CONFIG from '../build.config.js'

const STATICS_CONFIG = MASTER_CONFIG.statics
const THIS_BUILD_CONFIG = STATICS_CONFIG.builds.find(build => build.name === 'dev')

const __dirname = process.cwd()
const srcDirRelPath = STATICS_CONFIG.src_rel_path
const srcDirPath = path.join(__dirname, srcDirRelPath)

nodemon({
  script: 'scripts/statics.build.dev.js',
  watch: srcDirPath,
  ext: THIS_BUILD_CONFIG.source_watched_extensions.join(','),
  delay: '200'
}).on('start', () => {
  console.log(chalk.bgBlack.white.bold(`STATICS BUILD: nodemon watches ${srcDirRelPath}/`))
}).on('restart', () => {
  console.log(chalk.bgBlack.white.bold('STATICS BUILD: nodemon restarts'))
}).on('crash', () => {
  console.log(chalk.bold.white.bgRed('STATICS BUILD: nodemon crashed'))
})
