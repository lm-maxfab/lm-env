import nodemon from 'nodemon'
import path from 'path'
import chalk from 'chalk'
import MASTER_CONFIG from '../build.config.js'

const STATICS_CONFIG = MASTER_CONFIG.statics
const buildName = process.argv[2]
const THIS_BUILD_CONFIG = STATICS_CONFIG.builds.find(conf => conf.name === buildName)
if (THIS_BUILD_CONFIG === undefined) throw new Error(`No config found for a build named ${buildName}`)

const __dirname = process.cwd()
const distDirRelPath = THIS_BUILD_CONFIG.build_output_rel_path
const distDirPath = path.join(__dirname, distDirRelPath)

nodemon({
  exec: `node scripts/statics.serve.js ${buildName}`,
  watch: distDirPath,
  ext: THIS_BUILD_CONFIG.build_watched_extensions.join(','),
  delay: '200'
}).on('start', () => {
  console.log(chalk.bgBlack.white.bold(`STATICS SERVE: nodemon watches ${distDirRelPath}/`))
}).on('restart', () => {
  console.log(chalk.bgBlack.white.bold('STATICS SERVE: nodemon restarts'))
}).on('crash', () => {
  console.log(chalk.bold.white.bgRed('STATICS SERVE: nodemon crashed'))
})
