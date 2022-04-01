import execAsync from './utils/exec-async/index.js'
import { v4 as uuid } from 'uuid'
import chalk from 'chalk'

/* * * * * * * * * * * * * * * * * * * * * *
 *
 * CONFIG
 * 
 * * * * * * * * * * * * * * * * * * * * * */
const srcFolderRelPath = 'src'
const tempFolderName = `${new Date().toISOString()}__${uuid()}`
const tempFolderRelPath = `.temp/${tempFolderName}`
const distFolderRelPath = 'dist/dev/env'

async function cleanup (tempFolderRelPath) {
  await execAsync(`rm -rf ${tempFolderRelPath}`)
}

/* * * * * * * * * * * * * * * * * * * * * *
 *
 * PROCESS INTERRUPTION HANDLERS
 * 
 * * * * * * * * * * * * * * * * * * * * * */
process.on('SIGINT', handleProcessInterruption.bind(null, 'SIGINT', tempFolderRelPath))
process.on('SIGUSR1', handleProcessInterruption.bind(null, 'SIGUSR1', tempFolderRelPath))
process.on('SIGUSR2', handleProcessInterruption.bind(null, 'SIGUSR2', tempFolderRelPath))
process.on('uncaughtException', handleProcessInterruption.bind(null, 'uncaughtException', tempFolderRelPath))

async function handleProcessInterruption (reason, tempFolderRelPath) {
  console.log(chalk.white.bgRed.bold(reason))
  await cleanup(tempFolderRelPath)
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
    const { err, stderr } = await execAsync(`mkdir -p ${tempFolderRelPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`created ${tempFolderRelPath}.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Create output directory if needed
  console.log(chalk.bold(`Creating ${distFolderRelPath}...`))
  try {
    const { err, stderr } = await execAsync(`mkdir -p ${distFolderRelPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`created ${distFolderRelPath}.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Copy source in temp
  console.log(chalk.bold(`Copying source files to ${tempFolderRelPath}...`))
  try {
    const { err, stderr } = await execAsync(`cp -r ${srcFolderRelPath}/ ${tempFolderRelPath} && find ${tempFolderRelPath}/ -maxdepth 100 -type f -name \"*.ts\" -delete`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`copied source files to ${tempFolderRelPath}.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Transpile source's typescript
  console.log(chalk.bold(`Transpiling source's ts files to ${tempFolderRelPath}...`))
  try {
    const { err, stderr } = await execAsync(`tsc -p ./tsconfig.json --outDir ${tempFolderRelPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`transpiled source's ts files to ${tempFolderRelPath}.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Rsync temp to dist
  console.log(chalk.bold(`Rsyncing temp files to ${distFolderRelPath}...`))
  try {
    const { err, stdout, stderr } = await execAsync(`rsync --archive --verbose --delete ${tempFolderRelPath}/ ${distFolderRelPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(stdout))
    console.log(chalk.grey(`rsynced temp files to ${distFolderRelPath}.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Remove temp directory
  console.log(chalk.bold(`Removing ${tempFolderRelPath}...`))
  await cleanup(tempFolderRelPath)
  console.log(chalk.grey(`removed ${tempFolderRelPath}.`))

} catch (err) {
  await cleanup(tempFolderRelPath)
  throw new Error(err)
}
