import fse from 'fs-extra'
import path from 'path'

async function deepLs (srcPath) {
  const files = await fse.readdir(srcPath)
  const results = []
  for (let file of files) {
    const filePath = path.join(srcPath, file)
    const fileStat = await fse.stat(filePath)
    const isDirectory = fileStat.isDirectory()
    if (!isDirectory) results.push(filePath)
    else results.push(...(await deepLs(filePath)))
  }
  return results
}

export default deepLs
