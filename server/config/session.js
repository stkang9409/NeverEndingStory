const dotenv = require('dotenv')
dotenv.config()

const sessionOption = {
    resave: false,
    saveUninitialized: true,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        domain:'.iovar2.com',
    },
}

module.exports = sessionOption
