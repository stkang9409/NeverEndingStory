const dotenv = require('dotenv')
dotenv.config()

const sessionOption = {
    resave: false,
    saveUninitialized: true,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        domain:'www.iovar2.com',
        secure: true,
    },
}

module.exports = sessionOption
