import express from 'express'
// import fetch from 'node-fetch'

const router = express.Router()

/* GET home page. */
router.get('*', async (_req, res) => {
  // const baseUrl = 'http://localhost:3001'
  // const resourceUrl = req.url.replace(/^\//gm, '')
  // const proxyUrl = `${baseUrl}/${resourceUrl}`

  res.json('A proxy should be working here.')
})

export default router
