/* eslint-disable node/no-path-concat */
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const connectdb = require('./database/connection')
const path = require('path')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger/swagger.json')

const app = express()

//Morgan applied
app.use(morgan('tiny'))

//Set body-parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//Connecting Databases
connectdb()

//Setting views
app.set('views', './views')
app.set('view engine', 'ejs')

//Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

//Serving statics files
app.use(express.static(path.join(__dirname + '/public')))
app.use('/uploads', express.static(path.join(__dirname+'/uploads')))

// Loading Routes
app.use('/', require('./routes/router'))

app.get('/', (req, res)=>{
    res.render('index')
}).listen('3030', ()=>{
    console.log('server has been started on http://localhost:3030')
})
