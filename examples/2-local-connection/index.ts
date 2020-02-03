// NOTE: 音声と動画を両方送る
const MEDIA_CONFIG = { video: true, audio: true }

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
  // 1. Peer1からPeer2へ流すためのStreamを取得カメラ、マイクから取得
  const stream = await setupUserMedia()
  if (stream) {
    showVideo(stream)
  }

  // 2. peer1とpeer2の初期化
  // NOTE: このサンプルではpc1を `送信側` pc2を `受信側` として扱う
  const pcConfig = { iceServers: [] }
  const pc1 = new RTCPeerConnection(pcConfig)
  const pc2 = new RTCPeerConnection(pcConfig)
  // 3. pc2は受信側なので、Streamを受け取るコールバックする
  pc2.addEventListener('track', onTrackEventForPc2)

  // 4. pc1にMediaStreamを接続する
  if (stream) {
    const videoTracks = stream.getVideoTracks()
    const audioTracks = stream.getAudioTracks()
    // NOTE: 接続デバイスを表示する
    if (videoTracks.length > 0) {
      console.log(`Using video device: ${videoTracks[0].label}`)
    }
    if (audioTracks.length > 0) {
      console.log(`Using audio device: ${audioTracks[0].label}`)
    }
    stream.getTracks().forEach(track => {
      pc1.addTrack(track, stream as MediaStream)
    })
  }

  // 5. 接続元のSDPを作成
  const offerDescription = await pc1.createOffer()
  // 6. pc1に offerSDPをセット
  // NOTE: setLocalDescriptionは接続元情報をセットする
  await pc1.setLocalDescription(offerDescription)
  console.log('pc1: setLocalDescription')

  /* NOTE: 本来はofferSDPをシグナリングサーバ経由で pc2 へ送る */

  // 7. pc2に offerSDP をセットする
  await pc2.setRemoteDescription(offerDescription)
  console.log('pc2: setRemoteDescription')

  // 8. pc2は、ICE candidateの取得を開始
  // NOTE: setRemoteDescription が完了すると ICE Candidateを取得できる
  pc2.addEventListener('icecandidate', e => {
    console.log('pc2: icecandidate')
    if (e.candidate) {
      /* NOTE: 本来はIceCandidateをシグナリングサーバ経由で pc1 へ送る */
      // pc2のIceCandidateをセット
      pc1.addIceCandidate(e.candidate)
    }
  })
  console.log(`Answer from pc2:\n${offerDescription.sdp}`)
  // 8. 受信側から送信側へanserSDPを作成する
  const answerDescription = await pc2.createAnswer()
  // 9. pc2にanser SDPをセット
  await pc2.setLocalDescription(answerDescription)
  console.log('pc2: setLocalDescription')

  /* 本来はこの間にanserSDPをシグナリングサーバ経由で PC2->PC1 へ送る処理が入る */

  // 10. 送信側のリモート情報にanser SDPをセット
  await pc1.setRemoteDescription(answerDescription)
  console.log('pc1: setRemoteDescription')
  // 3. ICE Candidateの追加
  // NOTE: このサンプルでは、シグナリングサーバを利用しないため ICE Candidateを自前で追加する
  // 追加しないとお互いの通信先が見つからないためP2Pが開始されない
  // PC1の接続情報をPC2についか(逆も追加)
  pc1.addEventListener('icecandidate', e => {
    console.log('pc1: icecandidate')
    if (e.candidate) {
      pc2.addIceCandidate(e.candidate)
    }
  })

  /* これで双方のP2Pのシグナリング処理が完了し通信が始まる */
}

/* ============= Button Event Handler ============ */
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
