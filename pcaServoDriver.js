const express = require('express')
const http = require('http')
const cookieParser = require('cookie-parser')
const socketio = require('socket.io')
const i2cBus = require("i2c-bus")
const Pca9685Driver = require("pca9685").Pca9685Driver

const main = () => {
    const app = express()
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use(cookieParser())
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
    
        socketio(server).on('connection', (socket) => {
            socket.on('pwm', (command) => {
                pcaDriver.setPulseLength(command.pin, command.data)
            })
        })    
    })
    server.listen(3210)
}

module.exports = main;
