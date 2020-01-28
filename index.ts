/**
 * 3. UserMediaからストリームを取得する(Video&Audio)
 */
async function setupUserMedia(): Promise<MediaStream | undefined> {
  try {
    // NOTE: Streamから取得できる情報を設定で指定できます(今回は動画と音声)
    const mediaConfig = { video: true, audio: true }
    const stream = await navigator.mediaDevices.getUserMedia(mediaConfig)
    // NOTE: videoTracksから端末がどのデバイスと接続しているかの情報が取得できます
    const videoTracks = stream.getVideoTracks()
    console.log(`Using video device: ${videoTracks[0].label}`)
    return stream
  } catch (err) {
    console.log('[error: setupUserMedia] ', err)
  }
}

/**
 * 4. videoタグにStreamを流し表示する
 * @param stream MediaStream
 */
function showVideo(stream: MediaStream) {
  const video = document.getElementById('local-video') as HTMLVideoElement
  // NOTE: videoElementのsrcObjectにstreamを接続すると動画が再生できるようになる
  video.srcObject = stream
}

/**
 * 2. ストリームを取得して、Videoタグを再生する
 */
async function handleShowVideo() {
  // start video capture
  const stream = await setupUserMedia()
  if (stream) {
    showVideo(stream)
  }
}

/**
 * 1.ボタンが押された時のハンドラー
 */
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
