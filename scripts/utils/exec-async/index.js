import { exec } from 'child_process'

async function execAsync (cmd) {
  return new Promise(resolve => {
    exec(cmd, (err, stdout, stderr) => {
      resolve({ err, stdout, stderr })
    })
  })
}

export default execAsync
