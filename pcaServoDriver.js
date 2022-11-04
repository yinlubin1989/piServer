const express = require('express')
const http = require('http')
const cookieParser = require('cookie-parser')
const { Server } = require('socket.io')
const i2cBus = require("i2c-bus")
const Pca9685Driver = require("pca9685").Pca9685Driver

const main = () => {
    const app = express()
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use(cookieParser())
    app.all('*', function(request, response, next) {
        response.header('Access-Control-Allow-Origin', '*')
        response.header('Access-Control-Allow-Headers', 'content-type')
        response.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS')
        next()
    })
    app.get('/t', function(request, response, next) {
        response.end('ok')
    })
    const server = http.createServer(app)
    const options = {
        i2c: i2cBus.openSync(1),
        address: 0x40,
        frequency: 50,
        debug: false
    }
    const pcaDriver = new Pca9685Driver(options, (err) => {
        if (err) {
            console.error("Error initializing PCA9685")
            process.exit(-1)
        }
        setInterval(() => {
        }, 500)
        new Server(server, {
            cors: {
                origin: 'http://localhost:5174',
                credentials: true
            }
        }).on('connection', (socket) => {
            socket.on('hb', () => {

            })
            socket.on('setPulseLength', (command) => {
                pcaDriver.setPulseLength(command.pin, command.data)
            })
            socket.on('channelOn', (command) => {
                pcaDriver.channelOn(command.pin)
            })
        })    
    })
    server.listen(3210)
}

module.exports = main
