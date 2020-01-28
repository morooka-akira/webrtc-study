import WebSocket from 'ws'
import fs from 'fs'
import https from 'https'

try {
  const server = https.createServer({
    cert: fs.readFileSync('./localhost.pem'),
    key: fs.readFileSync('./localhost-key.pem'),
  })
  const wss = new WebSocket.Server({ server })

  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      console.log('received: %s', message)
      wss.clients.forEach(function(client) {
        // NOTE: 自分以外の接続にブロードキャスト
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      })
    })
  })
  server.listen(5001)
} catch (e) {
  console.error(e)
}
