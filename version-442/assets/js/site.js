export function initPage() {
    bindMenus();
    bindGlobalSearchForms();
    bindHero();
    bindFilters();
}

function bindMenus() {
    const button = document.querySelector('.menu-toggle');
    const panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
        return;
    }
    button.addEventListener('click', () => {
        const isOpen = panel.hasAttribute('hidden');
        if (isOpen) {
            panel.removeAttribute('hidden');
        } else {
            panel.setAttribute('hidden', '');
        }
        button.setAttribute('aria-expanded', String(isOpen));
    });
}

function bindGlobalSearchForms() {
    document.querySelectorAll('.global-search').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = form.querySelector('input[name="q"]');
            const value = input ? input.value.trim() : '';
            const url = value ? `search.html?q=${encodeURIComponent(value)}` : 'search.html';
            window.location.href = url;
        });
    });
}

function bindHero() {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    if (!slides.length) {
        return;
    }
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    const prev = document.querySelector('.hero-prev');
    const next = document.querySelector('.hero-next');
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    const restart = () => {
        if (timer) {
            window.clearInterval(timer);
        }
        timer = window.setInterval(() => show(index + 1), 5200);
    };

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            show(i);
            restart();
        });
    });

    if (prev) {
        prev.addEventListener('click', () => {
            show(index - 1);
            restart();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            show(index + 1);
            restart();
        });
    }

    restart();
}

function bindFilters() {
    const input = document.getElementById('movieSearch');
    const year = document.getElementById('yearFilter');
    const type = document.getElementById('typeFilter');
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    if (!cards.length || (!input && !year && !type)) {
        return;
    }
    const empty = document.querySelector('.empty-state');
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q');
    if (initial && input) {
        input.value = initial;
    }
    const normalize = (value) => String(value || '').toLowerCase().trim();
    const apply = () => {
        const q = normalize(input && input.value);
        const selectedYear = normalize(year && year.value);
        const selectedType = normalize(type && type.value);
        let visible = 0;
        cards.forEach((card) => {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.year,
                card.dataset.type,
                card.textContent
            ].join(' '));
            const matchesText = !q || haystack.includes(q);
            const matchesYear = !selectedYear || normalize(card.dataset.year).includes(selectedYear);
            const matchesType = !selectedType || normalize(card.dataset.type).includes(selectedType);
            const ok = matchesText && matchesYear && matchesType;
            card.hidden = !ok;
            if (ok) {
                visible += 1;
            }
        });
        if (empty) {
            empty.hidden = visible !== 0;
        }
    };
    [input, year, type].forEach((control) => {
        if (control) {
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        }
    });
    apply();
}
