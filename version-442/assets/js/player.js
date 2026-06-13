import { H as Hls } from './hls-vendor-dru42stk.js';

export function initPlayer(streamUrl) {
    const video = document.querySelector('[data-role="movie-video"]');
    const cover = document.querySelector('[data-role="player-cover"]');
    if (!video || !streamUrl) {
        return;
    }
    let attached = false;
    const attachStream = () => {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    };
    const start = () => {
        attachStream();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        video.controls = true;
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(() => {});
        }
    };
    if (cover) {
        cover.addEventListener('click', start);
    }
    video.addEventListener('click', () => {
        if (video.paused) {
            start();
        }
    });
}
