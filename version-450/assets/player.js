(function () {
    window.initPlayer = function (source) {
        var video = document.getElementById('movie-player');
        var trigger = document.getElementById('play-trigger');
        if (!video || !trigger || !source) {
            return;
        }
        var hls = null;
        var attached = false;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.load();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }
            video.src = source;
            video.load();
        }

        function start() {
            attach();
            trigger.classList.add('is-hidden');
            video.controls = true;
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    trigger.classList.remove('is-hidden');
                });
            }
        }

        trigger.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!attached || video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            trigger.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                trigger.classList.remove('is-hidden');
            }
        });
        video.addEventListener('ended', function () {
            trigger.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    };
}());
