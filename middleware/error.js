/**
 * 错误处理
 */

const errLogger = require('./../utils/log')('err')

module.exports = (app) => {
  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      ctx.response.status = err.statusCode || err.status || 500;
      ctx.response.body = {
        message: err.message
      };
      // 手动释放error事件
      ctx.app.emit('error', err, ctx);
    }
  });
  // 继续触发error事件
  app.on('error', (err) => {
    errLogger.error('server error', err.message);
    errLogger.error(err);
  });
}