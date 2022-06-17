import path from 'path'
import chalk from 'chalk'
import MASTER_CONFIG from '../build.config.js'
import execAsync from './utils/exec-async/index.js'

const STATICS_CONFIG = MASTER_CONFIG.statics
const buildName = process.argv[2]
const THIS_BUILD_CONFIG = STATICS_CONFIG.builds.find(conf => conf.name === buildName)
if (THIS_BUILD_CONFIG === undefined) throw new Error(`No config found for a build named ${buildName}`)

const __dirname = process.cwd()

const tempDirRelPath = MASTER_CONFIG.temp.rel_path

const prevBuildableSourceDirName = THIS_BUILD_CONFIG.temp_source_reference_dir_name
const prevBuildableSourceDirRelPath = `${tempDirRelPath}/${prevBuildableSourceDirName}`
const prevBuildableSourceDirPath = path.join(__dirname, prevBuildableSourceDirRelPath)

const prevBuiltOutputDirName = THIS_BUILD_CONFIG.temp_build_reference_dir_name
const prevBuiltOutputDirRelPath = `${tempDirRelPath}/${prevBuiltOutputDirName}`
const prevBuiltOutputDirPath = path.join(__dirname, prevBuiltOutputDirRelPath)

console.log(chalk.bold(`Clearing cache...`))
await execAsync(`rm -rf ${prevBuildableSourceDirPath}`)
await execAsync(`rm -rf ${prevBuiltOutputDirPath}`)
console.log(chalk.grey(`cleared.`))
