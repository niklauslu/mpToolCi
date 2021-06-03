const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();
const logger = require('./utils/log')("app")

const koaStatic = require('koa-static');
let previewPath = require('./config').previewPath
app.use(koaStatic(previewPath))

const redisMid = require('./middleware/redis')

// 错误处理
const errMid = require('./middleware/error')
errMid(app)

app.use(koaBody())
app.use(redisMid())

app.use(require('./middleware/requetId'))

const router = require("./routes")
app.use(router.routes())

const port = process.env.PROT || 11111
app.listen(port, () => {
  logger.info(`server listen at port:${port}`)
});