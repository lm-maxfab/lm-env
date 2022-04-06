import path from 'path'
import { spawn } from 'child_process'
import MASTER_CONFIG from '../build.config.js'

const STATICS_CONFIG = MASTER_CONFIG.statics
const THIS_BUILD_CONFIG = STATICS_CONFIG.builds.find(build => build.name === 'dev')

const __dirname = process.cwd()
const distDirRelPath = THIS_BUILD_CONFIG.build_output_rel_path
const distDirPath = path.join(__dirname, distDirRelPath)

const command = 'npx'
const args = [
  '-y',
  'http-server',
  '--cors',
  `-p ${THIS_BUILD_CONFIG.root_url_port}`,
  `${distDirPath}`
]

const server = spawn(command, args)

server.stdout.on('data', data => { console.log(data.toString().trim()) })
server.stderr.on('data', data => { console.error(data.toString().trim()) })
server.on('error', (err) => { console.error(err) })
server.on('close', code => console.log(`Server exited with code ${code}`))
