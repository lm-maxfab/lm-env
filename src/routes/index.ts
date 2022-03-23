import express, { Request as Req, Response as Res } from 'express'
const router = express.Router()

/* GET home page. */
router.get('/', (_req: Req, res: Res) => {
  res.render('index', { title: 'Home.' })
})

export default router
