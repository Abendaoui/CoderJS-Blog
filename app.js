require('dotenv').config()
const express = require('express')
const app = express()
const expressLayout = require('express-ejs-layouts')
const connectDB = require('./server/config/db')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')
const session = require('express-session')
const methodOverride = require('method-override')
//Middleware
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    // cookie : {maxAge : new Date(Date.now() + (36000000))}
  })
)
// It Overrided The Form Submition Method
app.use(methodOverride('_method'))

// Template Engine
app.use(expressLayout)
app.set('layout', './layouts/main')
app.set('view engine', 'ejs')

//Routes
app.use('/', require('./server/routes/mainRoute'))
app.use('/', require('./server/routes/adminRoute'))

const PORT = process.env.PORT || 5000
// Start Server
const start = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log('Server listening on port ' + PORT)
    })
  } catch (error) {
    console.log(error)
  }
}

start()
