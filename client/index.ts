// NOTE: 音声と動画を両方送る
const MEDIA_CONFIG = { video: true, audio: true }
// NOTE: 送信側のデバイスから受け取ったStreamを遅れるようにグローバルにセット
let localStream: MediaStream | null = null
let pc: RTCPeerConnection
const socket = new WebSocket('ws://localhost:5001')
socket.addEventListener('open', function() {
  console.log('Websocket open success')
})

/* ============= Handle Signaling Server (Websocket) ============ */

/**
 * シグナリングサーバをへ Offer Descriptionを送信する
 * @param description RTCSessionDescriptionInit
 */
function sendOfferSDP(description: RTCSessionDescriptionInit) {
  const data = {
    type: 'offer',
    sdp: description.sdp,
  }
  console.log('sendOfferSDP: ', JSON.stringify(data))
  socket.send(JSON.stringify(data))
}

/**
 * シグナリングサーバをへ Answer Descriptionを送信する
 * @param description RTCSessionDescriptionInit
 */
function sendAnswerSDP(description: RTCSessionDescriptionInit) {
  const data = {
    type: 'answer',
    sdp: description.sdp,
  }
  console.log('sendAnswerSDP: ', JSON.stringify(data))
  socket.send(JSON.stringify(data))
}

/**
 * シグナリングサーバをへ ICE Candidate を送信する
 * @param candidate RTCIceCandidate
 */
function sendCandidate(candidate: RTCIceCandidate) {
  // NOTE: candidate, sdpMLineIndex, sdpMid がないと受信先で RTCIceCandidateインスタンス を生成できない
  const data = {
    type: 'candidate',
    candidate: candidate.candidate,
    sdpMLineIndex: candidate.sdpMLineIndex,
    sdpMid: candidate.sdpMid,
  }
  console.log('sendCandidate: ', JSON.stringify(data))
  socket.send(JSON.stringify(data))
}

/**
 * シグナリングサーバから ICE Candidateを受信
 * @param candidate RTCIceCandidate
 */
function onCandidate(candidate: RTCIceCandidate) {
  console.log('onCandidate: ', candidate)
  pc.addIceCandidate(candidate)
}

/**
 * Answer SDPを生成し、LocalDescriptionにセット後、シグナリングサーバへ送信する
 */
async function handleSendAwnser() {
  const answerDescription = await pc.createAnswer()
  await pc.setLocalDescription(answerDescription)
  sendAnswerSDP(answerDescription)
}

/**
 * シグナリングサーバから ICE Candidateを受信
 * @param candidate RTCIceCandidate
 */
async function onOfferSDP(offer: RTCSessionDescription) {
  console.log('onOfferSDP: ', offer)
  // 1. Remote Descriptionのセット
  pc.setRemoteDescription(offer)
  // 2. ICE Candidate の取得開始
  // NOTE offerをsetRemoteDescriptionするまでICE CandidateをAddできないためこのタイミングで取得する
  pc.addEventListener('icecandidate', e => {
    if (e.candidate) {
      console.log('icecandidate: ', e.candidate)
      sendCandidate(e.candidate)
    }
  })
  // 3. Anser SDP を送り返す
  await handleSendAwnser()
}

/**
 * シグナリングサーバからAnswer SDPを受信
 * @param answer RTCSessionDescription
 */
async function onAnswerSDP(answer: RTCSessionDescription) {
  console.log('onAnswerSDP: ', answer)
  pc.setRemoteDescription(answer)
}

/**
 * シグナリングサーバからの受信処理
 * @param event MessageEvent
 */
function onMessage(event: MessageEvent) {
  const data = JSON.parse(event.data)
  switch (data.type) {
    case 'candidate':
      onCandidate(
        new RTCIceCandidate({ candidate: data.candidate, sdpMLineIndex: data.sdpMLineIndex, sdpMid: data.sdpMid })
      )
      break
    case 'offer':
      onOfferSDP(new RTCSessionDescription({ sdp: data.sdp, type: 'offer' }))
      break
    case 'answer':
      onAnswerSDP(new RTCSessionDescription({ sdp: data.sdp, type: 'answer' }))
      break
  }
}

/**
 * シグナリングサーバ(WebSocket)の初期化
 */
function initializeSignalingServer() {
  // サーバーからデータを受け取る
  socket.addEventListener('message', function(e) {
    console.log('on socket message.', e.data)
    onMessage(e)
  })
}

/* ============= Handle Local Stream ============ */

/**
 * UserMediaからストリームを取得する(Video&Audio)
 */
async function setupUserMedia(): Promise<MediaStream | undefined> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONFIG)
    return stream
  } catch (err) {
    console.log('An error occured! ' + err)
  }
}

/**
 * videoタグにStreamを流し表示する
 * @param stream MediaStream
 */
function showLocalVideo(stream: MediaStream) {
  const video = document.getElementById('local-video') as HTMLVideoElement
  video.srcObject = stream
}

/* ============= Handle Connection ============ */

/**
 * 受信側がTrackを受け取ったときのコールバック
 * @param e RTCTrackEvent
 */
function onTrackEvent(e: RTCTrackEvent) {
  // NOTE: このサンプルでは受信側の videoタグのstreamと接続して送信側の映像を表示する
  const remoteVideo = document.getElementById('remote-video') as HTMLVideoElement
  if (remoteVideo && remoteVideo.srcObject !== e.streams[0]) {
    remoteVideo.srcObject = e.streams[0]
    console.log('pc2 received remote stream', e.streams[0])
  }
}

/**
 * 初期セットアップ
 */
async function handleSetup() {
  // 1. UserMediaにアクセスして音声と画像ストリームを取得
  const stream = await setupUserMedia()
  if (!stream) {
    console.error('Get Stream fail.')
    return
  }
  localStream = stream
  // 2. LocalのVideoタグにStreamを渡して再生
  showLocalVideo(stream)
  // 3. PeerConnectionを作成
  const pcConfig = { iceServers: [] }
  pc = new RTCPeerConnection(pcConfig)
  // 4. videoとaudioのTrackをpeerにセット
  const videoTracks = localStream.getVideoTracks()
  const audioTracks = localStream.getAudioTracks()
  if (videoTracks.length > 0) {
    console.log(`Using video device: ${videoTracks[0].label}`)
  }
  if (audioTracks.length > 0) {
    console.log(`Using audio device: ${audioTracks[0].label}`)
  }
  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream as MediaStream)
  })
  // 5. Signalingサーバを初期化し、接続を受けれるようにする
  initializeSignalingServer()
  // 6. P2P接続後に受け取るTrackのコールバックをセット
  pc.addEventListener('track', onTrackEvent)
}

/**
 * OfferSDPをシグナリングサーバへ送信し接続を開始する
 */
async function handleSendOffer() {
  // 1. OfferSDPの作成
  const offerDescription = await pc.createOffer()
  // 2. ローカルDescriptionのセット
  // NOTE: setLocalDescriptionは接続元(local)の情報をセットするAPI
  // NOTE: addTrack,setLocalDescriptionを実行してはじめてicecandidateの受信が始まる
  await pc.setLocalDescription(offerDescription)
  // 3. シグナリングサーバへOfferを送信
  sendOfferSDP(offerDescription)
  // 4. ICE Candidateを取得
  pc.addEventListener('icecandidate', e => {
    if (e.candidate) {
      console.log('icecandidate: ', e.candidate)
      sendCandidate(e.candidate)
    }
  })
}

/* ============= ↓ Button Event Handler ============ */
document.addEventListener('DOMContentLoaded', function() {
  const btnSetup = document.getElementById('btn-setup')
  if (btnSetup) {
    btnSetup.addEventListener(
      'click',
      async function(e) {
        handleSetup()
        e.preventDefault()
      },
      false
    )
  }

  const btnConnect = document.getElementById('btn-send-offer')
  if (btnConnect) {
    btnConnect.addEventListener(
      'click',
      async function(e) {
        handleSendOffer()
        e.preventDefault()
      },
      false
    )
  }

  const btnHangUp = document.getElementById('btn-hang-up')
  if (btnHangUp) {
    btnHangUp.addEventListener('click', function() {
      pc.close()
    })
  }
})
