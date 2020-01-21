var MEDIA_CONFIG = { video: true, audio: true };
/**
 * カメラ操作を開始する
 */
function startVideo(video) {
    navigator.mediaDevices
        .getUserMedia(MEDIA_CONFIG)
        .then(function (stream) {
        video.srcObject = stream;
    })["catch"](function (err) {
        console.log('An error occured! ' + err);
    });
}
function setup() {
    var localVideo = document.getElementById('local_video');
    var btnLocalVideo = document.getElementById('btn-start-local-video');
    startVideo(localVideo);
    btnLocalVideo.addEventListener('click', function (ev) {
        console.log('click start button');
        localVideo.play();
        ev.preventDefault();
    }, false);
}
setup();
