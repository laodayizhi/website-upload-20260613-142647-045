(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('.mobile-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupGlobalSearch() {
        var forms = document.querySelectorAll('.global-search-form');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                var target = './search.html';
                if (value) {
                    target += '?q=' + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero-slider]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var next = root.querySelector('[data-hero-next]');
        var prev = root.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function setupFilters() {
        var scope = document.querySelector('[data-card-scope]');
        if (!scope) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty-state]');
        var searchInput = document.getElementById('catalog-search');
        var categorySelect = document.getElementById('catalog-category');
        var typeSelect = document.getElementById('catalog-type');
        var yearSelect = document.getElementById('catalog-year');
        var localFilter = document.querySelector('[data-local-filter] input');
        var query = getQuery();
        if (searchInput && query) {
            searchInput.value = query;
        }

        function includesText(card, value) {
            if (!value) {
                return true;
            }
            return (card.getAttribute('data-search') || '').indexOf(value.toLowerCase()) !== -1;
        }

        function matchesSelect(card, attr, value) {
            if (!value) {
                return true;
            }
            return (card.getAttribute(attr) || '') === value;
        }

        function filter() {
            var text = searchInput ? searchInput.value.trim().toLowerCase() : '';
            if (localFilter) {
                text = localFilter.value.trim().toLowerCase();
            }
            var category = categorySelect ? categorySelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var ok = includesText(card, text) &&
                    matchesSelect(card, 'data-category', category) &&
                    matchesSelect(card, 'data-type', type) &&
                    matchesSelect(card, 'data-year', year);
                card.classList.toggle('is-hidden-by-filter', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, categorySelect, typeSelect, yearSelect, localFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filter);
                control.addEventListener('change', filter);
            }
        });
        filter();
    }

    ready(function () {
        setupMobileMenu();
        setupGlobalSearch();
        setupHero();
        setupFilters();
    });
}());
