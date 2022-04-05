import path from 'path'

function isPathInScope (_path, scope = './') {
  const isScopeAbsolute = path.isAbsolute(scope)
  const absoluteScope = isScopeAbsolute ? scope : path.join(process.cwd(), scope)
  const absolutePath = path.isAbsolute(_path) ? _path : path.join(process.cwd(), _path)
  const relativeToScopePath = path.relative(absoluteScope, absolutePath)
  const isInScope = relativeToScopePath  
      && !relativeToScopePath.startsWith('..')
      && !path.isAbsolute(relativeToScopePath)
  return isInScope
}

export default isPathInScope
