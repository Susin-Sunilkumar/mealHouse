const express = require('express')
const app = express()
const path = require('path')
const morgan=require('morgan')
const mongoose = require('mongoose')
const userRoute = require('./routes/user')
const adminRoute = require('./routes/admin')
const productRoutes = require('./routes/product')
const wishlistRoute = require('./routes/wishlist')
const cartRoute = require('./routes/cart')
const orderRoute = require('./routes/order')
const flash = require('connect-flash')
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' })
  ]
});

logger.info('This is an info message');
logger.error('This is an error message');

const session = require("express-session")
const crypto = require('crypto')
require("dotenv").config();
const mongoURI = process.env.mongoURIString

const secret = crypto.randomBytes(32).toString('hex')

app.use(express.json());

app.use(
    session({
      secret: secret,
      resave: false, 
      saveUninitialized: true,
    })
)

app.use(flash())


app.use(morgan('tiny'))
//mongodb connection
mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// Set EJS as the view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

//Static files
app.use(express.static(path.join(__dirname, 'public')));
 
// Middleware for parsing URL-encoded data
app.use(express.urlencoded({ extended: false }))


app.use('/',userRoute)
app.use('/admin',adminRoute)
app.use('/admin',productRoutes)
app.use('/wishlist', wishlistRoute)
app.use('/cart', cartRoute)
app.use('/order', orderRoute)


const port = 4000

app.listen(port,'0.0.0.0', () => {
    console.log(`app running on port:${port}`)
})   
