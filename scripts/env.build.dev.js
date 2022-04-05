import execAsync from './utils/exec-async/index.js'
import { v4 as uuid } from 'uuid'
import chalk from 'chalk'
import path from 'path'

/* * * * * * * * * * * * * * * * * * * * * *
 *
 * CONFIG
 * 
 * * * * * * * * * * * * * * * * * * * * * */
const __dirname = process.cwd()

const srcFolderRelPath = 'src'
const srcFolderPath = path.join(__dirname, srcFolderRelPath)

const tempFolderName = `${Date.now()}-${uuid().replace(/-[a-f0-9-]*$/igm, '')}`
const tempFolderRelPath = `.temp/${tempFolderName}`
const tempFolderPath = path.join(__dirname, tempFolderRelPath)

const distFolderRelPath = 'dist/dev/env'
const distFolderPath = path.join(__dirname, distFolderRelPath)

async function cleanup (tempFolderPath) {
  await execAsync(`rm -rf ${tempFolderPath}`)
}

/* * * * * * * * * * * * * * * * * * * * * *
 *
 * PROCESS INTERRUPTION HANDLERS
 * 
 * * * * * * * * * * * * * * * * * * * * * */
process.on('SIGINT', handleProcessInterruption.bind(null, 'SIGINT', tempFolderPath))
process.on('SIGUSR1', handleProcessInterruption.bind(null, 'SIGUSR1', tempFolderPath))
process.on('SIGUSR2', handleProcessInterruption.bind(null, 'SIGUSR2', tempFolderPath))
process.on('uncaughtException', handleProcessInterruption.bind(null, 'uncaughtException', tempFolderPath))

async function handleProcessInterruption (reason, tempFolderPath) {
  console.log(chalk.white.bgRed.bold(reason))
  await cleanup(tempFolderPath)
}

/* * * * * * * * * * * * * * * * * * * * * *
 *
 * BUILD PROCESS
 * 
 * * * * * * * * * * * * * * * * * * * * * */
try {
  // Create temp directory
  console.log(chalk.bold(`Creating ${tempFolderRelPath}...`))
  try {
    const { err, stderr } = await execAsync(`mkdir -p ${tempFolderPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`created.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Create output directory if needed
  console.log(chalk.bold(`Ensure ${distFolderRelPath} exists...`))
  try {
    const { err, stderr } = await execAsync(`mkdir -p ${distFolderPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`ensured.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Copy source in temp
  console.log(chalk.bold(`Copying source files to ${tempFolderRelPath}...`))
  try {
    const { err, stderr } = await execAsync(`cp -r ${srcFolderPath}/ ${tempFolderPath} && find ${tempFolderPath}/ -maxdepth 100 -type f -name \"*.ts\" -delete`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`copied.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Transpile source's typescript
  console.log(chalk.bold(`Transpiling source's ts files to ${tempFolderRelPath}...`))
  try {
    const { err, stderr } = await execAsync(`tsc -p ./tsconfig.json --outDir ${tempFolderPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`transpiled.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Rsync temp to dist
  console.log(chalk.bold(`Rsyncing temp files to ${distFolderRelPath}...`))
  try {
    const { err, stdout, stderr } = await execAsync(`rsync --archive --verbose --delete ${tempFolderPath}/ ${distFolderPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(stdout))
    console.log(chalk.grey(`rsynced.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Remove temp directory
  console.log(chalk.bold(`Removing ${tempFolderRelPath}...`))
  await cleanup(tempFolderPath)
  console.log(chalk.grey(`removed.`))

} catch (err) {
  await cleanup(tempFolderPath)
  throw new Error(err)
}
