import path from 'path'
import chalk from 'chalk'
import { v4 as uuid } from 'uuid'
import execAsync from './utils/exec-async/index.js'
import MASTER_CONFIG from '../build.config.js'

const ENV_CONFIG = MASTER_CONFIG.env
const THIS_BUILD_CONFIG = ENV_CONFIG.builds.find(conf => conf.name === 'dev')

/* * * * * * * * * * * * * * * * * * * * * *
 *
 * INIT
 * 
 * * * * * * * * * * * * * * * * * * * * * */
const startTime = Date.now()

const __dirname = process.cwd()

const tempDirRelPath = MASTER_CONFIG.temp.rel_path

const srcDirRelPath = ENV_CONFIG.src_rel_path
const srcDirPath = path.join(__dirname, srcDirRelPath)

const sourceCopyDirNamePrefix = THIS_BUILD_CONFIG.temp_source_copy_dir_name_prefix
const sourceCopyDirName = `${sourceCopyDirNamePrefix}-${Date.now()}-${uuid().replace(/-[a-f0-9-]*$/igm, '')}`
const sourceCopyDirRelPath = `${tempDirRelPath}/${sourceCopyDirName}`
const sourceCopyDirPath = path.join(__dirname, sourceCopyDirRelPath)

const distDirRelPath = THIS_BUILD_CONFIG.build_output_rel_path
const distDirPath = path.join(__dirname, distDirRelPath)

async function cleanup (sourceCopyDirPath) {
  await execAsync(`rm -rf ${sourceCopyDirPath}`)
}

/* * * * * * * * * * * * * * * * * * * * * *
 *
 * PROCESS INTERRUPTION HANDLERS
 * 
 * * * * * * * * * * * * * * * * * * * * * */
process.on('SIGINT', handleProcessInterruption.bind(null, 'SIGINT', sourceCopyDirPath))
process.on('SIGUSR1', handleProcessInterruption.bind(null, 'SIGUSR1', sourceCopyDirPath))
process.on('SIGUSR2', handleProcessInterruption.bind(null, 'SIGUSR2', sourceCopyDirPath))
process.on('uncaughtException', handleProcessInterruption.bind(null, 'uncaughtException', sourceCopyDirPath))

async function handleProcessInterruption (reason, sourceCopyDirPath) {
  console.log(chalk.white.bgRed.bold(reason))
  await cleanup(sourceCopyDirPath)
}

/* * * * * * * * * * * * * * * * * * * * * *
 *
 * BUILD PROCESS
 * 
 * * * * * * * * * * * * * * * * * * * * * */
try {
  // Create temp directory
  console.log(chalk.bold(`Creating ${sourceCopyDirRelPath}...`))
  try {
    const { err, stderr } = await execAsync(`mkdir -p ${sourceCopyDirPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`created.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Create output directory if needed
  console.log(chalk.bold(`Ensure ${distDirRelPath} exists...`))
  try {
    const { err, stderr } = await execAsync(`mkdir -p ${distDirPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`ensured.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Copy source in temp
  console.log(chalk.bold(`Copying source files to ${sourceCopyDirRelPath}...`))
  try {
    const { err, stderr } = await execAsync(`cp -r ${srcDirPath}/ ${sourceCopyDirPath} && find ${sourceCopyDirPath}/ -maxdepth 100 -type f -name \"*.ts\" -delete`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`copied.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Transpile source's typescript
  console.log(chalk.bold(`Transpiling source's ts files to ${sourceCopyDirRelPath}...`))
  try {
    const { err, stderr, stdout } = await execAsync(`tsc -p ./tsconfig.json --outDir ${sourceCopyDirPath}`)
    if (err) throw { err, stderr, stdout }
    console.log(chalk.grey(`transpiled.`))
  } catch (err) {
    console.log(err.err)
    console.log(err.stderr)
    console.log(err.stdout)
    throw new Error(err)
  }

  // Rsync temp to dist
  console.log(chalk.bold(`Rsyncing temp files to ${distDirRelPath}...`))
  try {
    const { err, stdout, stderr } = await execAsync(`rsync --archive --verbose --delete ${sourceCopyDirPath}/ ${distDirPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(stdout))
    console.log(chalk.grey(`rsynced.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Remove temp directory
  console.log(chalk.bold(`Removing ${sourceCopyDirRelPath}...`))
  await cleanup(sourceCopyDirPath)
  console.log(chalk.grey(`removed.`))

  // Done
  console.log(chalk.bgGreen.bold(`Built in ${(Date.now() - startTime) / 1000} seconds.`))

} catch (err) {
  await cleanup(sourceCopyDirPath)
  throw new Error(err)
}
