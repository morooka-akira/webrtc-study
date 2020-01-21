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
  const videoTracks = stream.getVideoTracks()
  console.log(`Using video device: ${videoTracks[0].label}`)
  video.srcObject = stream
}

/**
 * 初期セットアップ
 */
async function handleShowVideo() {
  // start video capture
  const stream = await setupUserMedia()
  if (stream) {
    showVideo(stream)
  }
}

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
