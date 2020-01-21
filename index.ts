// NOTE: 音声と動画を両方送る
const MEDIA_CONFIG = { video: true, audio: true }
// NOTE: 送信側のデバイスから受け取ったStreamを遅れるようにグローバルにセット
let localStream: MediaStream | null = null

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
function showVideo(stream: MediaStream) {
  const video = document.getElementById('local-video') as HTMLVideoElement
  video.srcObject = stream
}

/**
 * 初期セットアップ
 */
async function handleShowVideo() {
  // start video capture
  const stream = await setupUserMedia()
  if (stream) {
    localStream = stream
    showVideo(stream)
  }
}

/**
 * 受信側がTrackを受け取ったときのコールバック
 * @param e RTCTrackEvent
 */
function onTrackEventForPc2(e: RTCTrackEvent) {
  // NOTE: このサンプルでは受信側の videoタグのstreamと接続して送信側の映像を表示する
  const remoteVideo = document.getElementById('remote-video') as HTMLVideoElement
  if (remoteVideo && remoteVideo.srcObject !== e.streams[0]) {
    remoteVideo.srcObject = e.streams[0]
    console.log('pc2 received remote stream', e.streams[0])
  }
}

/**
 * 取得したメディアデータをPC1からPC2に接続して流す処理
 * 流したデータはリモート用のvideoタグに出力する
 */
async function connectPeer() {
  // 1. 接続情報の作成
  // NOTE: このサンプルではpc1を`送信側` pc2を `受信側` として扱う
  const pcConfig = { iceServers: [] }
  const pc1 = new RTCPeerConnection(pcConfig)
  const pc2 = new RTCPeerConnection(pcConfig)

  // 2. 受信側のStreamを受け取るコールバックをセット
  pc2.addEventListener('track', onTrackEventForPc2)

  // 3. ICE Candidateの追加
  // NOTE: このサンプルでは、シグナリングサーバを利用しないため ICE Candidateを自前で追加する
  // 追加しないとお互いの通信先が見つからないためP2Pが開始されない
  // PC1の接続情報をPC2についか(逆も追加)
  pc1.addEventListener('icecandidate', e => {
    if (e.candidate) {
      pc2.addIceCandidate(e.candidate)
    }
  })
  pc2.addEventListener('icecandidate', e => {
    if (e.candidate) {
      pc1.addIceCandidate(e.candidate)
    }
  })

  // 4. PC1にMediaStreamのトラックを渡す
  if (localStream) {
    const videoTracks = localStream.getVideoTracks()
    const audioTracks = localStream.getAudioTracks()
    if (videoTracks.length > 0) {
      console.log(`Using video device: ${videoTracks[0].label}`)
    }
    if (audioTracks.length > 0) {
      console.log(`Using audio device: ${audioTracks[0].label}`)
    }
    localStream.getTracks().forEach(track => {
      pc1.addTrack(track, localStream as MediaStream)
    })
  }

  // 5. 接続元のSDPを作成
  const offerDescription = await pc1.createOffer()
  // 6. PC1のローカル情報にoffer SDPをセット
  // NOTE: setLocalDescriptionは接続元(local)の情報をセットするAPI
  await pc1.setLocalDescription(offerDescription)

  /* 本来はこの間にofferSDPをシグナリングサーバ経由で PC1->PC2 へ送る処理が入る */

  console.log(`Answer from pc2:\n${offerDescription.sdp}`)
  // 7. 受信側のconnectionにSDPをセットする
  await pc2.setRemoteDescription(offerDescription)
  // 8. 受信側から送信側へanser SDPを作成する
  const answerDescription = await pc2.createAnswer()
  // 9. 受信側のローカル情報にanser SDPをセット
  await pc2.setLocalDescription(answerDescription)

  /* 本来はこの間にanserSDPをシグナリングサーバ経由で PC2->PC1 へ送る処理が入る */

  // 10. 送信側のリモート情報にanser SDPをセット
  await pc1.setRemoteDescription(answerDescription)

  /* これで双方のP2Pのシグナリング処理が完了し通信が始まる */
}

/* ============= ↓ Button Event Handler ============ */

const btnShowVideo = document.getElementById('btn-show-video')
if (btnShowVideo) {
  btnShowVideo.addEventListener(
    'click',
    async function(e) {
      handleShowVideo()
      e.preventDefault()
    },
    false
  )
}

const btnConnect = document.getElementById('btn-connect')
if (btnConnect) {
  btnConnect.addEventListener(
    'click',
    async function(e) {
      connectPeer()
      e.preventDefault()
    },
    false
  )
}
