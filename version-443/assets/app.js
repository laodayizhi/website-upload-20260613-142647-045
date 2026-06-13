(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call(
      (scope || document).querySelectorAll(selector),
    );
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function initMenus() {
    var toggle = qs("[data-menu-toggle]");
    var panel = qs("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    qsa("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : "";
        var action = form.getAttribute("action") || "search.html";
        window.location.href = query
          ? action + "?q=" + encodeURIComponent(query)
          : action;
      });
    });
  }

  function initHero() {
    var root = qs("[data-hero]");
    if (!root) {
      return;
    }
    var slides = qsa("[data-hero-slide]", root);
    var dots = qsa("[data-hero-dot]", root);
    var prev = qs("[data-hero-prev]", root);
    var next = qs("[data-hero-next]", root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initLocalFilters() {
    qsa("[data-local-filter]").forEach(function (input) {
      var scope = qs("[data-filter-scope]") || document;
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        qsa("[data-movie-card]", scope).forEach(function (card) {
          var text = normalize(card.getAttribute("data-search-text"));
          card.classList.toggle(
            "is-hidden",
            query && text.indexOf(query) === -1,
          );
        });
      });
    });
    qsa("[data-local-filter-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
      });
    });
  }

  function initRankTabs() {
    var tabsRoot = qs("[data-rank-tabs]");
    if (!tabsRoot) {
      return;
    }
    var tabs = qsa("[data-rank-tab]", tabsRoot);
    var panels = qsa("[data-rank-panel]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var name = tab.getAttribute("data-rank-tab");
        tabs.forEach(function (item) {
          item.classList.toggle("is-active", item === tab);
        });
        panels.forEach(function (panel) {
          panel.classList.toggle(
            "is-active",
            panel.getAttribute("data-rank-panel") === name,
          );
        });
      });
    });
  }

  function getSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function searchCard(movie) {
    var tags = (movie.tags || [])
      .slice(0, 3)
      .map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      })
      .join("");
    return [
      '<a class="movie-card" href="./' + movie.file + '" data-movie-card>',
      '<span class="poster-wrap">',
      '<img src="./' +
        movie.cover +
        '" alt="' +
        escapeHtml(movie.title) +
        '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="play-chip">▶</span>',
      '<span class="quality-chip">HD</span>',
      "</span>",
      '<span class="card-body">',
      "<strong>" + escapeHtml(movie.title) + "</strong>",
      '<span class="card-line">' + escapeHtml(movie.oneLine || "") + "</span>",
      '<span class="card-meta">' +
        escapeHtml(movie.year) +
        " · " +
        escapeHtml(movie.region) +
        " · " +
        escapeHtml(movie.genre) +
        "</span>",
      '<span class="tag-row">' + tags + "</span>",
      "</span>",
      "</a>",
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[char];
    });
  }

  function renderSearch() {
    var results = qs("#search-results");
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var input = qs("#search-query");
    var heading = qs("#search-heading");
    var form = qs("[data-page-search-form]");
    var query = getSearchQuery();

    function run(value) {
      var keyword = normalize(value);
      if (input) {
        input.value = value;
      }
      var data = window.SEARCH_INDEX.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        var text = normalize(
          [
            movie.title,
            movie.year,
            movie.region,
            movie.type,
            movie.genre,
            movie.category,
            (movie.tags || []).join(" "),
            movie.oneLine,
          ].join(" "),
        );
        return text.indexOf(keyword) > -1;
      }).slice(0, 120);
      if (heading) {
        heading.textContent = keyword ? "搜索结果" : "热门片库";
      }
      results.innerHTML = data.length
        ? data.map(searchCard).join("")
        : '<div class="content-card"><h2>未找到相关影片</h2><p>可以尝试更换影片名称、地区、类型或年份继续搜索。</p></div>';
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = input ? input.value.trim() : "";
        var nextUrl = value
          ? "search.html?q=" + encodeURIComponent(value)
          : "search.html";
        window.history.replaceState(null, "", nextUrl);
        run(value);
      });
    }
    run(query);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenus();
    initSearchForms();
    initHero();
    initLocalFilters();
    initRankTabs();
    renderSearch();
  });
})();
