import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import debug from 'debug'
import http from 'http'

import config from './config'

import indexRouter from './routes/index'
import staticsRouter from './routes/statics'

init()

async function init () {
  /* Create Express app */
  const app = express()
  app.set('port', config.app_port)

  /* Express setup */
  app.set('views', path.join(config.app_path, 'views'))
  app.set('view engine', 'pug')
  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(express.static(path.join(config.app_path, 'public')))

  /* Public routes */
  app.use('/', indexRouter)
  app.use('/statics', staticsRouter)

  /* Create HTTP server */
  const server = http.createServer(app)
  server.listen(config.app_port)

  server.on('listening', () => {
    const addr = server.address()
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port
    debug('lm-env')('Listening on ' + bind)
  })

  server.on('error', (error: any) => {
    if (error.syscall !== 'listen') throw error
    const bind = typeof config.app_port === 'string' ? 'Pipe ' + config.app_port : 'Port ' + config.app_port
    if (error.code === 'EACCES') {
      console.error(bind + ' requires elevated privileges')
      return process.exit(1)
    } else if (error.code === 'EADDRINUSE') {
      console.error(bind + ' is already in use')
      return process.exit(1)
    }
    throw error
  })
}
