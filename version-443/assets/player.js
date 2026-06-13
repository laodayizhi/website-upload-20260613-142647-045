function initMoviePlayer(streamUrl) {
  var video = document.querySelector("[data-video-player]");
  var overlay = document.querySelector("[data-play-button]");
  if (!video || !streamUrl) {
    return;
  }

  function prepare() {
    if (video.getAttribute("data-ready") === "1") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = streamUrl;
    }
    video.setAttribute("data-ready", "1");
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  function start() {
    prepare();
    hideOverlay();
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", hideOverlay);
}
