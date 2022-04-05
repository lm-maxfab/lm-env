import execAsync from './utils/exec-async/index.js'
import { v4 as uuid } from 'uuid'
import chalk from 'chalk'
import dircompare from 'dir-compare'
import path from 'path'
import deepLs from './utils/deep-ls/index.js'
import fse from 'fs-extra'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { JSDOM } from 'jsdom'
import sass from 'sass'
import CleanCSS from 'clean-css'
import buildConfig from './statics.build.dev.config.js'

/* * * * * * * * * * * * * * * * * * * * * *
 *
 * CONFIG
 * 
 * * * * * * * * * * * * * * * * * * * * * */
const __dirname = process.cwd()

const srcFolderPath = path.join(__dirname, 'lm-statics/src')

const prevBuildableSourceDirName = 'statics-dev-source-reference'
const prevBuildableSourceDirRelPath = `.temp/${prevBuildableSourceDirName}`
const prevBuildableSourceDirPath = path.join(__dirname, prevBuildableSourceDirRelPath)

const fullSourceCopyDirName = `statics-dev-source-copy-${Date.now()}-${uuid().replace(/-[a-f0-9-]*$/igm, '')}`
const fullSourceCopyDirRelPath = `.temp/${fullSourceCopyDirName}`
const fullSourceCopyDirPath = path.join(__dirname, fullSourceCopyDirRelPath)

const diffedSourceDirName = `statics-dev-source-diff-to-ref-${Date.now()}-${uuid().replace(/-[a-f0-9-]*$/igm, '')}`
const diffedSourceDirRelPath = `.temp/${diffedSourceDirName}`
const diffedSourceDirPath = path.join(__dirname, diffedSourceDirRelPath)

const distDirRelPath = 'dist/dev/statics'
const distDirPath = path.join(__dirname, distDirRelPath)

async function cleanup (path) {
  await execAsync(`rm -rf ${path}`)
}

/* * * * * * * * * * * * * * * * * * * * * *
 *
 * PROCESS INTERRUPTION HANDLERS
 * 
 * * * * * * * * * * * * * * * * * * * * * */
process.on('SIGINT', handleProcessInterruption.bind(null, 'SIGINT', fullSourceCopyDirPath, diffedSourceDirPath))
process.on('SIGUSR1', handleProcessInterruption.bind(null, 'SIGUSR1', fullSourceCopyDirPath, diffedSourceDirPath))
process.on('SIGUSR2', handleProcessInterruption.bind(null, 'SIGUSR2', fullSourceCopyDirPath, diffedSourceDirPath))
process.on('uncaughtException', handleProcessInterruption.bind(null, 'uncaughtException', fullSourceCopyDirPath, diffedSourceDirPath))

async function handleProcessInterruption (reason, fullSourceCopyDirPath, diffedSourceDirPath) {
  console.log(chalk.white.bgRed.bold(reason))
  await cleanup(fullSourceCopyDirPath)
  await cleanup(diffedSourceDirPath)
}

/* * * * * * * * * * * * * * * * * * * * * *
 *
 * BUILD PROCESS
 * 
 * * * * * * * * * * * * * * * * * * * * * */
try {
  // Create buildable reference directory if needed
  console.log(chalk.bold(`Ensuring ${prevBuildableSourceDirRelPath} exists...`))
  try {
    const { err, stderr } = await execAsync(`mkdir -p ${prevBuildableSourceDirPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`exists.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Create first temp directory
  console.log(chalk.bold(`Creating ${fullSourceCopyDirRelPath}...`))
  try {
    const { err, stderr } = await execAsync(`mkdir -p ${fullSourceCopyDirPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`created.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Create second temp directory
  console.log(chalk.bold(`Creating ${diffedSourceDirRelPath}...`))
  try {
    const { err, stderr } = await execAsync(`mkdir -p ${diffedSourceDirPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`created.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Create output directory if needed
  console.log(chalk.bold(`Ensuring ${distDirRelPath} exists...`))
  try {
    const { err, stderr } = await execAsync(`mkdir -p ${distDirPath}`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`exists.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Copy source in temp and delete all .DS_Store files
  console.log(chalk.bold(`Copying source files to ${fullSourceCopyDirRelPath}, deleting all .DS_Store...`))
  try {
    const { err, stderr } = await execAsync(`cp -r ${srcFolderPath}/ ${fullSourceCopyDirPath} && find ${fullSourceCopyDirPath}/ -maxdepth 100 -type f -name \".DS_Store\" -delete`)
    if (err) throw new Error(err)
    if (stderr) throw new Error(stderr)
    console.log(chalk.grey(`copied and cleaned.`))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Push diff between source and prev build source in diffedSource
  console.log(chalk.bold('Pushing diff...'))
  console.log(`  from: ${fullSourceCopyDirRelPath}`)
  console.log(`  and:  ${prevBuildableSourceDirRelPath}`)
  console.log(`  to:   ${diffedSourceDirRelPath}`)
  try {
    const res = await dircompare.compare(
      fullSourceCopyDirPath,
      prevBuildableSourceDirPath,
      { compareContent: true }
    )

    const reducedDiffSet = res.diffSet.reduce((reduced, diff) => {
      if (diff.state === 'left' && diff.type1 !== 'directory') reduced.changed.push(diff)
      else if (diff.state === 'distinct' && diff.type1 !== 'directory') reduced.changed.push(diff)
      else if (diff.state === 'right' && diff.type2 !== 'directory') reduced.deleted.push(diff)
      return reduced
    }, { changed: [], deleted: [] })


    for (const changedDiff of reducedDiffSet.changed) {
      const relPath = path.join(changedDiff.relativePath ?? '', changedDiff.name1 ?? '')
      const srcPath = path.join(fullSourceCopyDirPath, relPath)
      const dstDirectory = path.join(diffedSourceDirPath, changedDiff.relativePath)
      const dstPath = path.join(diffedSourceDirPath, relPath)
      const { err } = await execAsync(`mkdir -p ${dstDirectory} && cp ${srcPath} ${dstPath}`)
      console.log(chalk.grey(relPath))
      if (err !== null) {
        console.log(chalk.bold.bgRed.white('Error while pushing files'))
        console.log(chalk.grey(srcPath))
        console.log(err)
      }
    }

  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Replacing templates in diff files
  console.log(chalk.bold('Replacing templates in diff files...'))
  try {
    const filePaths = await deepLs(diffedSourceDirPath)
    for (const filePath of filePaths) {
      const fileRelPathFromDiffedSourceDir = path.relative(diffedSourceDirPath, filePath)
      const fileContent = await fse.readFile(filePath, 'utf-8')
      let newFileContent = fileContent

      // {{LINE_KEEP:<build-name>}}
      const lineKeepRegexp = /\{\{LINE_KEEP:([^\}]|(\}[^\}]))+\}\}/gm
      const lineKeepMatch = newFileContent.match(lineKeepRegexp)
      if (lineKeepMatch) {
        const fileLines = newFileContent.split('\n')
        const newLines = fileLines.filter(fileLine => {
          const hasLineKeep = fileLine.match(lineKeepRegexp)
          if (!hasLineKeep) return true
          const shouldKeep = fileLine.match(new RegExp(`\{\{LINE_KEEP:${buildConfig.build_name}\}\}`, 'gm'))
          if (shouldKeep) return true
          return false
        })
        newFileContent = newLines.join('\n')
      }

      // {{LINE_STRIP:<build-name>}}
      const lineStripRegexp = /\{\{LINE_STRIP:([^\}]|(\}[^\}]))+\}\}/gm
      const lineStripMatch = newFileContent.match(lineStripRegexp)
      if (lineStripMatch) {
        const fileLines = newFileContent.split('\n')
        const newLines = fileLines.filter(fileLine => {
          const hasLineStrip = fileLine.match(lineStripRegexp)
          if (!hasLineStrip) return true
          const shouldStrip = fileLine.match(new RegExp(`\{\{LINE_STRIP:${buildConfig.build_name}\}\}`, 'gm'))
          if (shouldStrip) return false
          return true
        })
        newFileContent = newLines.join('\n')
      }

      // {{ROOT_URL}}
      const rootUrl = buildConfig.root_url
      newFileContent = newFileContent.replace(new RegExp(buildConfig.ROOT_URL_TEMPLATE, 'gm'), rootUrl)
      
      // {{THIS_URL}}
      const thisUrl = `${rootUrl}/${fileRelPathFromDiffedSourceDir}`
      newFileContent = newFileContent.replace(new RegExp(buildConfig.THIS_URL_TEMPLATE, 'gm'), thisUrl)
      
      // {{PARENT_URL}}
      const parentUrl = `${rootUrl}/${path.join(fileRelPathFromDiffedSourceDir, '..').replace(/^\.$/gm, '')}`
      newFileContent = newFileContent.replace(new RegExp(buildConfig.PARENT_URL_TEMPLATE, 'gm'), parentUrl)

      if (newFileContent !== fileContent) await fse.writeFile(filePath, newFileContent)
    }
    
    console.log(chalk.grey('replaced.'))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Transforming README.md into README.html
  console.log(chalk.bold('Transforming README.md into README.html'))
  try {
    const filePaths = await deepLs(diffedSourceDirPath)
    const readmeMdPaths = filePaths.filter(filePath => path.basename(filePath) === 'README.md')

    for (const filePath of readmeMdPaths) {
      const fileRelPath = path.relative(diffedSourceDirPath, filePath)
      const fileRelPathArr = fileRelPath.split('/')
      const breadcrumb = fileRelPathArr.map((chunk, pos) => {
        const currRelPath = fileRelPathArr.slice(0, pos + 1).join('/')
        return `[${chunk}](${buildConfig.root_url}/${currRelPath})`
      }).join('/') + '\n'
      const fileContent = await fse.readFile(filePath, 'utf-8')
      const htmlContent = marked.parse(breadcrumb + fileContent, {
        gfm: true,
        highlight: (code, lang) => {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext'
          return hljs.highlight(code, { language }).value
        },
        langPrefix: 'hljs language-',
        smartLists: true
      })
      const htmlFilePath = path.join(filePath, '../README.html')
      const $htmlJsdom = new JSDOM(htmlContent)
      $htmlJsdom.window.document.head.innerHTML += `
        <style>
          body { padding: 50px; font-family: "Marr-Sans"; }
          h1 { font-family: "Marr-Sans-Condensed"; font-size: 3em; }
          p { font-family: "The-Antiqua-B"; }
        </style>
        <link rel="stylesheet" href="${buildConfig.root_url}/styles/fonts.css">
        <link rel="stylesheet" href="${buildConfig.root_url}/styles/variables.css">
        <link rel="stylesheet" href="${buildConfig.root_url}/lib/highlightjs/v11.5.0/material-palenight.min.css">`
      $htmlJsdom.window.document.body.classList.add('lm-page')
      const newHtmlContent = $htmlJsdom.window.document.documentElement.outerHTML
      await fse.writeFile(
        htmlFilePath,
        newHtmlContent,
        { encoding: 'utf-8' }
      )
      await fse.remove(filePath)
    }

    console.log(chalk.grey('transformed.'))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Transpile TypeScript
  console.log(chalk.bold('Transpiling Typescript files...'))
  try {
    const filePaths = await deepLs(diffedSourceDirPath)
    const tsFilesPaths = filePaths.filter(filePath => path.extname(filePath) === '.ts')
    
    for (const filePath of tsFilesPaths) {
      const outPath = filePath.replace(/\.ts$/gm, '.js')
      await execAsync(`tsc ${filePath} --outFile ${outPath} --target es2015`)
      await fse.remove(filePath)
    }

    console.log(chalk.grey('transpiled.'))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Compile SASS
  console.log(chalk.bold('Compiling SCSS files...'))
  try {
    const filePaths = await deepLs(diffedSourceDirPath)
    const scssFilesPaths = filePaths.filter(filePath => path.extname(filePath) === '.scss')
    
    for (const filePath of scssFilesPaths) {
      const outPath = filePath.replace(/\.scss$/gm, '.css')
      const compiled = sass.compile(filePath).css
      const minified = new CleanCSS({}).minify(compiled)
      await fse.writeFile(outPath, minified.styles, 'utf-8')
      await fse.rm(fileData.path)
    }

    console.log(chalk.grey('compiled.'))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Minify CSS
  // if (fileData.extension === '.css') {
  //   const minified = new CleanCSS({}).minify(fileData.content)
  //   await fse.writeFile(fileData.path, minified.styles, 'utf-8')
  // }


  // Remove temp directory
  // console.log(chalk.bold(`Removing ${fullSourceCopyDirPath} and ${diffedSourceDirPath}...`))
  // await cleanup(fullSourceCopyDirPath)
  // await cleanup(diffedSourceDirPath)
  // console.log(chalk.grey(`removed ${fullSourceCopyDirPath} and ${diffedSourceDirPath}.`))

} catch (err) {
  await cleanup(fullSourceCopyDirPath)
  throw new Error(err)
}
