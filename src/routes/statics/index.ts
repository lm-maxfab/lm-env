import express from 'express'
import fetch from 'node-fetch'

const router = express.Router()

/* GET home page. */
router.get('*', async (req, res) => {
  const baseUrl = 'http://localhost:50001'
  const resourceUrl = req.url.replace(/^\//gm, '')
  const targetUrl = `${baseUrl}/${resourceUrl}`
  try {
    const response = await fetch(targetUrl)
    console.log(response)
    res.json([targetUrl, 'A proxy should be working here.'])
  } catch (err) {
    console.log(err)
    res.json([targetUrl, 'A proxy should be working here.'])
  }
})

export default router
