const koaRouter = require('koa-router')
const mpDevToolCI = require('./controllers/mpDevToolCI')
const router = koaRouter()
const logger = require('./utils/log')("app")

router.get('/heart', ctx  => {
  logger.info('heart at ' +  new Date())
  ctx.body = 'success'
  return
})

router.get("/timestamp", ctx => {
  logger.info("timestamp is" + Date.now().toString())
  ctx.body = Date.now().toString()
  return
})

router.post("/wx/v1/preview", ctx => mpDevToolCI.preview(ctx))

module.exports = router