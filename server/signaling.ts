import WebSocket from 'ws'

const wss = new WebSocket.Server({ port: 5001 })

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
