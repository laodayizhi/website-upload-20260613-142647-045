import { H as Hls } from './hls-vendor-dru42stk.js';

function setStatus(message) {
    var status = document.querySelector('[data-player-status]');

    if (status) {
        status.textContent = message;
    }
}

function hideStartButton() {
    var button = document.querySelector('[data-play-button]');

    if (button) {
        button.classList.add('is-hidden');
    }
}

function playVideo(video) {
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
            setStatus('浏览器已阻止自动播放，请再次点击视频播放。');
        });
    }
}

function initializePlayer() {
    var video = document.querySelector('[data-player]');

    if (!video) {
        return;
    }

    var source = video.getAttribute('data-video-url');

    if (!source) {
        setStatus('当前影片缺少播放源。');
        return;
    }

    hideStartButton();
    setStatus('正在加载高清播放源...');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
            setStatus('播放源加载完成。');
            playVideo(video);
        }, { once: true });
        return;
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源加载完成。');
            playVideo(video);
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
                setStatus('播放源暂时无法加载，请刷新页面或稍后重试。');
            }
        });
        return;
    }

    video.src = source;
    setStatus('当前浏览器不支持 HLS.js，已尝试使用原生方式播放。');
    playVideo(video);
}

document.addEventListener('DOMContentLoaded', function () {
    var button = document.querySelector('[data-play-button]');
    var video = document.querySelector('[data-player]');

    if (button) {
        button.addEventListener('click', initializePlayer);
    }

    if (video) {
        video.addEventListener('play', hideStartButton);
    }
});
