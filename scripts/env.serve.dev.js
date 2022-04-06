import path from 'path'
import { spawn } from 'child_process'
import MASTER_CONFIG from '../build.config.js'

const ENV_CONFIG = MASTER_CONFIG.env
const THIS_BUILD_CONFIG = ENV_CONFIG.builds.find(build => build.name === 'dev')

const __dirname = process.cwd()
const distDirRelPath = THIS_BUILD_CONFIG.build_output_rel_path
const distDirPath = path.join(__dirname, distDirRelPath)

const command = 'node'
const args = [
  '--trace-warnings',
  '--experimental-specifier-resolution=node',
  `${distDirPath}/index.js`
]
const env = {
  ...process.env,
  NODE_ENV: 'developpment',
  PORT: `${THIS_BUILD_CONFIG.root_url_port}`
}

const server = spawn(command, args, { env })

server.stdout.on('data', data => { console.log(data.toString().trim()) })
server.stderr.on('data', data => { console.error(data.toString().trim()) })
server.on('error', (err) => { console.error(err) })
server.on('close', code => console.log(`Server exited with code ${code}`))
