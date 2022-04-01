import execAsync from './utils/exec-async/index.js'
import { v4 as uuid } from 'uuid'
import chalk from 'chalk'
import dircompare from 'dir-compare'

/* * * * * * * * * * * * * * * * * * * * * *
 *
 * CONFIG
 * 
 * * * * * * * * * * * * * * * * * * * * * */
const srcFolderRelPath = 'lm-statics/src'
const firstTempFolderName = `first-${new Date().toISOString()}__${uuid()}`
const firstTempFolderRelPath = `.temp/${firstTempFolderName}`
const tempBuildableRefRelPath = `.temp/statics-dev-buildable-reference`
const secondTempFolderName = `second-${new Date().toISOString()}__${uuid()}`
const secondTempFolderRelPath = `.temp/${secondTempFolderName}`
const distFolderRelPath = 'dist/dev/statics'

async function cleanup (path) {
  await execAsync(`rm -rf ${path}`)
}

/* * * * * * * * * * * * * * * * * * * * * *
 *
 * PROCESS INTERRUPTION HANDLERS
 * 
 * * * * * * * * * * * * * * * * * * * * * */
process.on('SIGINT', handleProcessInterruption.bind(null, 'SIGINT', firstTempFolderRelPath, secondTempFolderRelPath))
process.on('SIGUSR1', handleProcessInterruption.bind(null, 'SIGUSR1', firstTempFolderRelPath, secondTempFolderRelPath))
process.on('SIGUSR2', handleProcessInterruption.bind(null, 'SIGUSR2', firstTempFolderRelPath, secondTempFolderRelPath))
process.on('uncaughtException', handleProcessInterruption.bind(null, 'uncaughtException', firstTempFolderRelPath, secondTempFolderRelPath))

async function handleProcessInterruption (reason, firstTempFolderRelPath, secondTempFolderRelPath) {
  console.log(chalk.white.bgRed.bold(reason))
  await cleanup(firstTempFolderRelPath)
  await cleanup(secondTempFolderRelPath)
}

/* * * * * * * * * * * * * * * * * * * * * *
 *
 * BUILD PROCESS
 * 
 * * * * * * * * * * * * * * * * * * * * * */

try {
  // Create first temp directory
  console.log(chalk.bold(`Creating ${firstTempFolderRelPath}...`))
  try {
    const { err, stderr } = await execAsync(`mkdir -p ${firstTempFolderRelPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`created ${firstTempFolderRelPath}.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Create second temp directory
  console.log(chalk.bold(`Creating ${firstTempFolderRelPath}...`))
  try {
    const { err, stderr } = await execAsync(`mkdir -p ${firstTempFolderRelPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`created ${firstTempFolderRelPath}.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Create buildable reference directory if needed
  console.log(chalk.bold(`Creating ${tempBuildableRefRelPath}...`))
  try {
    const { err, stderr } = await execAsync(`mkdir -p ${tempBuildableRefRelPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`created ${tempBuildableRefRelPath}.`))
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
  console.log(chalk.bold(`Copying source files to ${firstTempFolderRelPath}...`))
  try {
    const { err, stderr } = await execAsync(`cp -r ${srcFolderRelPath}/ ${firstTempFolderRelPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`copied source files to ${firstTempFolderRelPath}.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Get diff between temp and reference
  console.log(chalk.bold(`Getting diff between ${firstTempFolderRelPath} and ${tempBuildableRefRelPath}...`))
  try {
    const res = await dircompare.compare(
      firstTempFolderRelPath,
      tempBuildableRefRelPath,
      { compareContent: true }
    )
    const createdDiffs = []
    const deletedDiffs = []
    const changedDiffs = []
    res.diffSet.forEach(diff => {
      if (diff.state === 'equal') return
      if (diff.state === 'left') return createdDiffs.push(diff)
      else if (diff.state === 'right') return deletedDiffs.push(diff)
      else if (diff.state === 'distinct') return changedDiffs.push(diff)
    })

    console.log('CREATED:')
    console.log(createdDiffs)

    console.log('DELETED:')
    console.log(deletedDiffs)

    console.log('CHANGED:')
    console.log(changedDiffs)
    
    
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Remove temp directory
  console.log(chalk.bold(`Removing ${firstTempFolderRelPath} and ${secondTempFolderRelPath}...`))
  await cleanup(firstTempFolderRelPath)
  await cleanup(secondTempFolderRelPath)
  console.log(chalk.grey(`removed ${firstTempFolderRelPath} and ${secondTempFolderRelPath}.`))

} catch (err) {
  await cleanup(firstTempFolderRelPath)
  throw new Error(err)
}
