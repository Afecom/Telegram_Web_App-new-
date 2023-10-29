const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.chapa.co/v1',
      changeOrigin: true,
    })
  );
};
