const { createProxyMiddleware } = require('http-proxy-middleware');

const config = require("./config/key")
module.exports = function (app) {
    console.log("가자~~", config.SERVER);
    app.use(
        '/api',
        createProxyMiddleware({
            
            target: config.SERVER,
            changeOrigin: true,
        })
    );
};
