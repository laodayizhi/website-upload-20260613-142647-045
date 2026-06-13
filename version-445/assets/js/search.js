(function () {
    function getQueryFromUrl() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function text(value) {
        return value == null ? '' : String(value);
    }

    function createTag(label) {
        var span = document.createElement('span');
        span.textContent = label;
        return span;
    }

    function createCard(movie) {
        var article = document.createElement('article');
        article.className = 'movie-card';

        var link = document.createElement('a');
        link.className = 'poster-frame';
        link.href = movie.link;

        var image = document.createElement('img');
        image.src = movie.image;
        image.alt = movie.title + ' 在线观看';
        image.loading = 'lazy';
        image.addEventListener('error', function () {
            image.style.opacity = '0';
        }, { once: true });

        var overlay = document.createElement('span');
        overlay.className = 'poster-overlay';
        overlay.innerHTML = '<span class="play-icon">▶</span><span>立即观看</span>';

        var score = document.createElement('span');
        score.className = 'score-badge';
        score.textContent = movie.rating;

        link.appendChild(image);
        link.appendChild(overlay);
        link.appendChild(score);

        var body = document.createElement('div');
        body.className = 'movie-card-body';

        var title = document.createElement('h3');
        var titleLink = document.createElement('a');
        titleLink.href = movie.link;
        titleLink.textContent = movie.title;
        title.appendChild(titleLink);

        var summary = document.createElement('p');
        summary.textContent = movie.oneLine;

        var tags = document.createElement('div');
        tags.className = 'movie-tags';
        [movie.year, movie.region, movie.type, movie.category].filter(Boolean).forEach(function (label) {
            tags.appendChild(createTag(label));
        });

        body.appendChild(title);
        body.appendChild(summary);
        body.appendChild(tags);
        article.appendChild(link);
        article.appendChild(body);

        return article;
    }

    function matches(movie, query) {
        if (!query) {
            return true;
        }

        var haystack = [
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.tags,
            movie.oneLine,
            movie.summary
        ].join(' ').toLowerCase();

        return haystack.indexOf(query.toLowerCase()) !== -1;
    }

    function render(query) {
        var results = document.querySelector('[data-search-results]');
        var info = document.querySelector('[data-search-result-info]');
        var movies = Array.isArray(window.MOVIES) ? window.MOVIES : [];
        var filtered = movies.filter(function (movie) {
            return matches(movie, query);
        });

        results.innerHTML = '';

        filtered.forEach(function (movie) {
            results.appendChild(createCard(movie));
        });

        if (info) {
            info.textContent = query
                ? '共找到 ' + filtered.length + ' 部与“' + query + '”相关的影片。'
                : '已显示完整片库，共 ' + filtered.length + ' 部影片。';
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var form = document.querySelector('[data-search-page-form]');
        var input = document.querySelector('[data-search-page-input]');
        var initialQuery = getQueryFromUrl();

        if (input) {
            input.value = initialQuery;
        }

        render(initialQuery);

        if (form && input) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var query = input.value.trim();
                var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
                window.history.replaceState({}, '', nextUrl);
                render(query);
            });

            input.addEventListener('input', function () {
                render(input.value.trim());
            });
        }
    });
})();
