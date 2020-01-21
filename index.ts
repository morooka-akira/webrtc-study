const MEDIA_CONFIG = { video: true, audio: true }

/**
 * webカメラと音声をVideoタグにセットする
 */
function setupLocalVideo(video) {
  navigator.mediaDevices
    .getUserMedia(MEDIA_CONFIG)
    .then(function(stream) {
      video.srcObject = stream
    })
    .catch(function(err) {
      console.log('An error occured! ' + err)
    })
}

/**
 * 初期セットアップ
 */
function setup() {
  const localVideo = document.getElementById('local_video')
  // start video capture
  setupLocalVideo(localVideo)
}

setup()
