var MEDIA_CONFIG = { video: true, audio: true };
/**
 * webカメラと音声をVideoタグにセットする
 */
function setupLocalVideo(video) {
    navigator.mediaDevices
        .getUserMedia(MEDIA_CONFIG)
        .then(function (stream) {
        video.srcObject = stream;
    })["catch"](function (err) {
        console.log('An error occured! ' + err);
    });
}
/**
 * 初期セットアップ
 */
function setup() {
    var localVideo = document.getElementById('local_video');
    var btnLocalVideo = document.getElementById('btn-start-local-video');
    setupLocalVideo(localVideo);
    btnLocalVideo.addEventListener('click', function (ev) {
        console.log('click start button');
        localVideo.play();
        ev.preventDefault();
    }, false);
}
setup();
