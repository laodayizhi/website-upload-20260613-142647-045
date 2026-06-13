(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-toggle]');
        var mobileMenu = document.querySelector('[data-mobile-menu]');

        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', function () {
                mobileMenu.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var root = form.getAttribute('data-search-root') || './';

                if (query) {
                    window.location.href = root + 'search.html?q=' + encodeURIComponent(query);
                } else {
                    window.location.href = root + 'search.html';
                }
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var previousButton = document.querySelector('[data-hero-prev]');
        var nextButton = document.querySelector('[data-hero-next]');
        var currentIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            currentIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === currentIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === currentIndex);
            });
        }

        function nextSlide() {
            showSlide(currentIndex + 1);
        }

        function restartTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            if (slides.length > 1) {
                timer = window.setInterval(nextSlide, 5000);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restartTimer();
            });
        });

        if (previousButton) {
            previousButton.addEventListener('click', function () {
                showSlide(currentIndex - 1);
                restartTimer();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                showSlide(currentIndex + 1);
                restartTimer();
            });
        }

        restartTimer();

        document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
            var input = panel.querySelector('[data-filter-input]');
            var region = panel.querySelector('[data-filter-region]');
            var year = panel.querySelector('[data-filter-year]');
            var type = panel.querySelector('[data-filter-type]');
            var section = panel.closest('section') || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]'));

            function applyFilters() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var regionValue = region ? region.value : '';
                var yearValue = year ? year.value : '';
                var typeValue = type ? type.value : '';

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-year') || '',
                        card.getAttribute('data-type') || '',
                        card.getAttribute('data-tags') || ''
                    ].join(' ').toLowerCase();
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesRegion = !regionValue || card.getAttribute('data-region') === regionValue;
                    var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
                    var matchesType = !typeValue || (card.getAttribute('data-type') || '').indexOf(typeValue) !== -1;

                    card.classList.toggle('is-hidden-by-filter', !(matchesQuery && matchesRegion && matchesYear && matchesType));
                });
            }

            [input, region, year, type].forEach(function (control) {
                if (!control) {
                    return;
                }

                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            });
        });

        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.style.opacity = '0';
            }, { once: true });
        });
    });
})();
