import path from 'path'
import fse from 'fs-extra'
import chalk from 'chalk'
import { v4 as uuid } from 'uuid'
import dircompare from 'dir-compare'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { JSDOM } from 'jsdom'
import sass from 'sass'
import CleanCSS from 'clean-css'
import uglifyJs from 'uglify-js'

import execAsync from './utils/exec-async/index.js'
import deepLs from './utils/deep-ls/index.js'
import isPathInScope from './utils/is-path-in-scope/index.js'

import MASTER_CONFIG from '../build.config.js'

/* * * * * * * * * * * * * * * * * * * * * *
 *
 * INIT
 * 
 * * * * * * * * * * * * * * * * * * * * * */
const startTime = Date.now()

const STATICS_CONFIG = MASTER_CONFIG.statics
const THIS_BUILD_CONFIG = STATICS_CONFIG.builds.find(conf => conf.name === 'dev')

const __dirname = process.cwd()

const tempDirRelPath = MASTER_CONFIG.temp.rel_path

const srcDirRelPath = STATICS_CONFIG.src_rel_path
const srcDirPath = path.join(__dirname, srcDirRelPath)

const prevBuildableSourceDirName = THIS_BUILD_CONFIG.temp_source_reference_dir_name
const prevBuildableSourceDirRelPath = `${tempDirRelPath}/${prevBuildableSourceDirName}`
const prevBuildableSourceDirPath = path.join(__dirname, prevBuildableSourceDirRelPath)

const prevBuiltOutputDirName = THIS_BUILD_CONFIG.temp_build_reference_dir_name
const prevBuiltOutputDirRelPath = `${tempDirRelPath}/${prevBuiltOutputDirName}`
const prevBuiltOutputDirPath = path.join(__dirname, prevBuiltOutputDirRelPath)

const fullSourceCopyDirNamePrefix = THIS_BUILD_CONFIG.temp_source_copy_dir_name_prefix
const fullSourceCopyDirName = `${fullSourceCopyDirNamePrefix}-${Date.now()}-${uuid().replace(/-[a-f0-9-]*$/igm, '')}`
const fullSourceCopyDirRelPath = `${tempDirRelPath}/${fullSourceCopyDirName}`
const fullSourceCopyDirPath = path.join(__dirname, fullSourceCopyDirRelPath)

const diffedSourceDirNamePrefix = THIS_BUILD_CONFIG.temp_source_diff_dir_name_prefix
const diffedSourceDirName = `${diffedSourceDirNamePrefix}-${Date.now()}-${uuid().replace(/-[a-f0-9-]*$/igm, '')}`
const diffedSourceDirRelPath = `${tempDirRelPath}/${diffedSourceDirName}`
const diffedSourceDirPath = path.join(__dirname, diffedSourceDirRelPath)

const distDirRelPath = THIS_BUILD_CONFIG.build_output_rel_path
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
  console.log(chalk.grey('cleaned up after handling exception.'))
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

  // Create built reference directory if needed
  console.log(chalk.bold(`Ensuring ${prevBuiltOutputDirRelPath} exists...`))
  try {
    const { err, stderr } = await execAsync(`mkdir -p ${prevBuiltOutputDirPath}`)
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
    const { err, stderr } = await execAsync(`cp -r ${srcDirPath}/ ${fullSourceCopyDirPath} && find ${fullSourceCopyDirPath}/ -maxdepth 100 -type f -name \".DS_Store\" -delete`)
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
    
    console.log(chalk.grey('pushed.'))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Replacing templates in diff files
  console.log(chalk.bold('Replacing templates in diff files...'))
  try {
    const filePaths = await deepLs(diffedSourceDirPath)
    for (const filePath of filePaths) {
      const fileExt = path.extname(filePath)
      const shouldReplace = STATICS_CONFIG.templating_allowed_extensions.includes(fileExt)
      if (!shouldReplace) continue

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
          const shouldKeep = fileLine.match(new RegExp(`\{\{LINE_KEEP:${THIS_BUILD_CONFIG.name}\}\}`, 'gm'))
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
          const shouldStrip = fileLine.match(new RegExp(`\{\{LINE_STRIP:${THIS_BUILD_CONFIG.name}\}\}`, 'gm'))
          if (shouldStrip) return false
          return true
        })
        newFileContent = newLines.join('\n')
      }

      // {{ROOT_URL}}
      const rootUrl =  THIS_BUILD_CONFIG.root_url
      const rootUrlTemplateRegexp = new RegExp(STATICS_CONFIG.root_url_template, 'gm')
      newFileContent = newFileContent.replace(rootUrlTemplateRegexp, rootUrl)
      
      // {{THIS_URL}}
      const thisUrl = `${rootUrl}/${fileRelPathFromDiffedSourceDir}`
      newFileContent = newFileContent.replace(new RegExp(STATICS_CONFIG.this_url_template, 'gm'), thisUrl)
      
      // {{PARENT_URL}}
      const parentUrl = `${rootUrl}/${path.join(fileRelPathFromDiffedSourceDir, '..').replace(/^\.$/gm, '')}`
      newFileContent = newFileContent.replace(new RegExp(STATICS_CONFIG.parent_url_template, 'gm'), parentUrl)

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
        const currRelPath = fileRelPathArr
          .slice(0, pos + 1)
          .join('/')
          .replace(/README.md/gm, 'README.html')
        const currFileName = chunk.replace(/README.md/gm, 'README.html')
        return `[${currFileName}](${THIS_BUILD_CONFIG.root_url}/${currRelPath})`
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
        ${THIS_BUILD_CONFIG.readme_markdown_html_stylesheets_paths.map(cssPath => {
          return `<link rel="stylesheet" href="${cssPath}">`
        }).join('')}`
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

  // Transpile Typescript
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

  // Uglify Javascript
  console.log(chalk.bold('Uglifying Javascript files...'))
  try {
    const filePaths = await deepLs(diffedSourceDirPath)
    const jsFilesPaths = filePaths.filter(filePath => path.extname(filePath) === '.js')
    const skippedPaths = THIS_BUILD_CONFIG.js_uglification_skip_paths.map(skipPath => {
      return path.join(diffedSourceDirPath, skipPath)
    })
    for (const filePath of jsFilesPaths) {
      const shouldSkip = skippedPaths.some(skippedPath => isPathInScope(filePath, skippedPath))
      if (shouldSkip) continue
      const fileContent = await fse.readFile(filePath, 'utf-8')
      const uglified = uglifyJs.minify(fileContent).code
      await fse.writeFile(filePath, uglified, { encoding: 'utf-8' })
    }
    console.log(chalk.grey('uglified.'))
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
      await fse.rm(filePath)
    }
    console.log(chalk.grey('compiled.'))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Minify CSS
  console.log(chalk.bold('Minifying CSS files...'))
  try {
    const filePaths = await deepLs(diffedSourceDirPath)
    const cssFilesPaths = filePaths.filter(filePath => path.extname(filePath) === '.css')
    for (const filePath of cssFilesPaths) {
      const contents = await fse.readFile(filePath)
      const minified = new CleanCSS({}).minify(contents)
      await fse.writeFile(filePath, minified.styles, 'utf-8')
    }
    console.log(chalk.grey('minified.'))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Rsync diff to dist
  console.log(chalk.bold(`Rsync ${diffedSourceDirRelPath} to ${distDirRelPath}`))
  try {
    await execAsync(`rsync --archive --verbose ${diffedSourceDirPath}/ ${distDirPath}`)
    console.log(chalk.grey('rsynced.'))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Create aliases
  console.log(chalk.bold(`Creating aliases in ${distDirRelPath}`))
  try {
    const { aliases } = THIS_BUILD_CONFIG
    for (const [relTo, relFrom] of Object.entries(aliases)) {
      const to = path.join(distDirPath, relTo)
      const from = path.join(distDirPath, relFrom)
      try {
        await fse.access(from)
      } catch (err) {
        console.error(`Could not create alias from ${from} because this path does not exist.`)
        continue
      }
      if (!isPathInScope(from, distDirRelPath)) {
        console.error(`Could not create alias from ${from} because this path is out of build scope.`)
        continue
      }
      if (!isPathInScope(to, distDirRelPath)) {
        console.error(`Could not create alias at ${to} because this path is out of build scope.`)
        continue
      }
      await execAsync(`cp ${from} ${to}`)
    }

    console.log(chalk.grey('created.'))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Update source reference and build reference
  console.log(chalk.bold(`Updating contents of ${prevBuildableSourceDirRelPath} and ${prevBuiltOutputDirRelPath}...`))
  try {
    await execAsync(`rm -rf ${prevBuildableSourceDirPath} && mv ${fullSourceCopyDirPath} ${prevBuildableSourceDirPath}`)
    await execAsync(`rm -rf ${prevBuiltOutputDirPath} && cp -r ${distDirPath} ${prevBuiltOutputDirPath}`)
    console.log(chalk.grey('updated.'))
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }

  // Remove temp directory
  console.log(chalk.bold(`Removing ${fullSourceCopyDirRelPath} and ${diffedSourceDirRelPath}...`))
  await cleanup(fullSourceCopyDirPath)
  await cleanup(diffedSourceDirPath)
  console.log(chalk.grey(`removed.`))

  // Done
  console.log(chalk.bgGreen.bold(`Built in ${(Date.now() - startTime) / 1000} seconds.`))

} catch (err) {
  await cleanup(fullSourceCopyDirPath)
  await cleanup(diffedSourceDirPath)
  throw new Error(err)
}
