const dotenv = require('dotenv')
dotenv.config()

const sessionOption = {
    resave: false,
    saveUninitialized: true,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        domain:'.iovar2.com',
        sameSite : "none",
        secure: true,
        httpOnly: true
    },
}

module.exports = sessionOption
