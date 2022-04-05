import path from 'path'
import fse from 'fs-extra'

async function batchFileEdit (paths, scope = './', editorFunc) {
  const isScopeAbsolute = path.isAbsolute(scope)
  const absoluteScope = isScopeAbsolute ? scope : path.join(process.cwd(), scope)
  const absolutePaths = paths.map(relativePath => {
    return path.isAbsolute(relativePath)
      ? relativePath
      : path.join(process.cwd(), relativePath)
  }).filter(absolutePath => {
    return isPathInScope(absolutePath, absoluteScope)
  })

  for (const absolutePath of absolutePaths) {
    const extension = path.extname(absolutePath)
    const basename = path.basename(absolutePath)
    const content = await fse.readFile(absolutePath, 'utf8')
    const newContent = await editorFunc({ path: absolutePath, extension, basename, content })
    
    if (newContent === undefined) {
      await fse.rm(absolutePath, { force: true })
      continue
    }
    
    if (content !== newContent) await fse.writeFile(
      absolutePath,
      newContent,
      { encoding: 'utf8' }
    )
  }
}

export default batchFileEdit
