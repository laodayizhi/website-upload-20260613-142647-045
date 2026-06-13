(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        if (!panel) {
            return;
        }
        var search = panel.querySelector('[data-catalog-search]');
        var category = panel.querySelector('[data-category-filter]');
        var year = panel.querySelector('[data-year-filter]');
        var clear = panel.querySelector('[data-clear-filters]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filterable-card]'));
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && search) {
            search.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var query = normalize(search && search.value);
            var categoryValue = category ? category.value : '';
            var yearValue = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardCategory = card.getAttribute('data-category') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesCategory = !categoryValue || cardCategory === categoryValue;
                var matchesYear = !yearValue || cardYear === yearValue;
                var matches = matchesQuery && matchesCategory && matchesYear;
                card.classList.toggle('is-filtered-out', !matches);
                if (matches) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [search, category, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (clear) {
            clear.addEventListener('click', function () {
                if (search) {
                    search.value = '';
                }
                if (category) {
                    category.value = '';
                }
                if (year) {
                    year.value = '';
                }
                apply();
            });
        }

        apply();
    }

    function setupPlayer() {
        var video = document.querySelector('[data-player-video]');
        var playButton = document.querySelector('[data-player-play]');
        if (!video || !playButton) {
            return;
        }
        var source = video.getAttribute('data-src');
        var attached = false;
        var hlsInstance = null;

        function attachSource() {
            if (attached || !source) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                attached = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                attached = true;
                return;
            }
            video.src = source;
            attached = true;
        }

        function play() {
            attachSource();
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    playButton.classList.remove('is-hidden');
                });
            }
        }

        playButton.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            playButton.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            playButton.classList.remove('is-hidden');
        });
        video.addEventListener('ended', function () {
            playButton.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
