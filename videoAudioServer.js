const spawn = require("child_process").spawn
const WebSocket = require('ws')
const http = require('http')
const url = require('url')

const createVideoStreamer = (() => {
    let streamer = null
    return (wss, {
        mode = 1,
        quality = 500,
    }) => {
        const ffmpegOptions = [
            "-framerate", "30",
            "-video_size", `${550}x${300}`,
            "-i", "/dev/video0",
            "-f", "rawvideo",
            "-vcodec", "libx264",
            "-vprofile", "baseline",
            "-b:v", `${quality}k`,
            "-tune", "zerolatency",
            "-preset", "ultrafast",
        ]
        if (mode === 1) {
            ffmpegOptions.push("-vf")
            ffmpegOptions.push("lutyuv=u=128:v=128")
        } else if (mode === 2) {
            ffmpegOptions.push("-vf")
            ffmpegOptions.push("lutyuv=u=128:v=128:y=3*val, eq=contrast=1.9:brightness=0.6")
        }
        ffmpegOptions.push("-")
        if (streamer) {
            streamer.kill("SIGHUP")
        }
        streamer = spawn('ffmpeg', ffmpegOptions)
        streamer.stdout.on('data', (frame) => {
            if (wss.clients.size > 0) {
                wss.clients.forEach(function (client) {
                    if (client.readyState === WebSocket.OPEN) {
                      client.send(frame)
                    }
                })
            } else {
                streamer.kill("SIGHUP")
            }
        })
    }
})()

const createAudioStreamer = (() => {
    let streamer = null
    return (wss) => {
        const ffmpegOptions = [
            "-f", "alsa",
            "-ar", 1000,
            "-ac", 1,
            "-i", "plughw:1,0",
            "-c:a", "mp3",
            "-f", "mp3",
            "-"
        ]
        if (streamer) {
            streamer.kill("SIGHUP")
        }
        streamer = spawn('ffmpeg', ffmpegOptions)
        streamer.stdout.on('data', (frame) => {
            if (wss.clients.size > 0) {
                wss.clients.forEach(function (client) {
                    if (client.readyState === WebSocket.OPEN) {
                      client.send(frame)
                    }
                })
            } else {
                streamer.kill("SIGHUP")
            }
        })
    }
})()

const main = () => {
    const server = http.createServer()
    const wsVideo = new WebSocket.Server({ noServer: true })
    const wsAudio = new WebSocket.Server({ noServer: true })
    
    wsVideo.on('connection', function connection(ws) {
        ws.on('message', (message) => {
            createVideoStreamer(wsVideo, JSON.parse(message).action)
        })
    })
       
    wsAudio.on('connection', function connection(ws) {
        ws.on('message', () => {
            createAudioStreamer(wsAudio)
        })
    })
    
    server.on('upgrade', function upgrade(request, socket, head) {
        const pathname = url.parse(request.url).pathname
        if (pathname === '/video') {
            wsVideo.handleUpgrade(request, socket, head, function done(ws) {
                wsVideo.emit('connection', ws, request)
            })
        } else if (pathname === '/audio') {
            wsAudio.handleUpgrade(request, socket, head, function done(ws) {
                wsAudio.emit('connection', ws, request)
            })
        } else {
            socket.destroy()
        }
    })
       
    server.listen(8082)
}

module.exports = main
