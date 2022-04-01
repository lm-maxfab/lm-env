import path from 'path'

const nodeEnv = process.env.NODE_ENV
const rootPath = process.cwd()

export const devConfig = {
  node_env: nodeEnv,
  root_path: rootPath,
  app_path: path.join(rootPath, 'dist/dev/env'),
  allowed_origins: ['http://localhost:3000'],
  public_hostname: 'localhost',
  app_port: parseInt(process.env.PORT || '3000')
}

export const prodConfig = {
  ...devConfig,
  app_path: path.join(rootPath, 'dist/prod/env'),
}

export default nodeEnv === 'developpment'
  ? devConfig
  : prodConfig
