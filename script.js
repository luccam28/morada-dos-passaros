(function() {
    'use strict';

    // ============================================================
    // 1. MENU MOBILE
    // ============================================================
    const menuToggle = document.getElementById('hamburguer');
    const mobileMenu = document.getElementById('mobile-menu');

    function setMenuState(open) {
        if (!menuToggle || !mobileMenu) return;
        if (open) {
            mobileMenu.removeAttribute('hidden');
            menuToggle.setAttribute('aria-expanded', 'true');
            menuToggle.setAttribute('aria-label', 'Fechar menu');
        } else {
            mobileMenu.setAttribute('hidden', '');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Abrir menu');
        }
    }

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            setMenuState(mobileMenu.hasAttribute('hidden'));
        });

        mobileMenu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() { setMenuState(false); });
        });

        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                setMenuState(false);
            }
        });
    }

    // ============================================================
    // 2. COOKIES (consentimento granular) + DIALOGS
    // ============================================================
    const KEY = 'cookie_prefs';
    const banner = document.getElementById('lgpd-modal');
    const prefsDialog = document.getElementById('cookie-prefs');
    const waDialog = document.getElementById('wa-dialog');
    const chkAnalytics = document.getElementById('pref-analytics');
    const chkMarketing = document.getElementById('pref-marketing');

    function readPrefs() {
        try { return JSON.parse(localStorage.getItem(KEY)); }
        catch (e) { return null; }
    }

    function savePrefs(analytics, marketing) {
        const prefs = { essential: true, analytics: analytics, marketing: marketing, v: 1 };
        try { localStorage.setItem(KEY, JSON.stringify(prefs)); }
        catch (e) { /* armazenamento indisponível */ }
        if (banner) banner.setAttribute('hidden', '');
        document.dispatchEvent(new CustomEvent('cookie-consent', { detail: prefs }));
    }

    function openDialog(dialog) {
        if (dialog && typeof dialog.showModal === 'function') {
            dialog.showModal();
        }
    }

    if (banner && !readPrefs()) banner.removeAttribute('hidden');

    function on(id, fn) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    }

    on('btn-aceitar-lgpd', function() { savePrefs(true, true); });
    on('btn-rejeitar-lgpd', function() { savePrefs(false, false); });

    function openPrefsFromSaved() {
        const p = readPrefs() || {};
        if (chkAnalytics) chkAnalytics.checked = !!p.analytics;
        if (chkMarketing) chkMarketing.checked = !!p.marketing;
        openDialog(prefsDialog);
    }

    on('btn-config-lgpd', openPrefsFromSaved);
    on('cookie-settings', openPrefsFromSaved);

    on('btn-salvar-prefs', function() {
        savePrefs(
            !!(chkAnalytics && chkAnalytics.checked),
            !!(chkMarketing && chkMarketing.checked)
        );
        if (prefsDialog) prefsDialog.close();
    });

    // WhatsApp modal
    on('wa-open', function() {
        if (waDialog && typeof waDialog.showModal === 'function') {
            waDialog.showModal();
        } else {
            window.open(
                'https://wa.me/5511991895580?text=Ol%C3%A1!%20Vim%20pelo%20site.',
                '_blank',
                'noopener'
            );
        }
    });

    // Fechar dialogs
    document.querySelectorAll('dialog.site-dialog').forEach(function(d) {
        d.querySelectorAll('[data-close]').forEach(function(b) {
            b.addEventListener('click', function() { d.close(); });
        });
        d.addEventListener('click', function(e) {
            if (e.target === d) d.close();
        });
    });

    // Escape fecha menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu && menuToggle &&
            !mobileMenu.hasAttribute('hidden')) {
            setMenuState(false);
            menuToggle.focus();
        }
    });

    // ============================================================
    // 3. CARROSSEL DE SERVIÇOS
    // ============================================================
    const track = document.querySelector('.carousel-track');

    if (track && track.children.length > 1) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let timer = null;
        let visible = false;
        let paused = false;

        function next() {
            const index = (Math.round(track.scrollLeft / track.clientWidth) + 1) %
                          track.children.length;
            track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
        }

        function sync() {
            const run = visible && !paused && !reduceMotion.matches;
            if (run && !timer) timer = setInterval(next, 4500);
            if (!run && timer) { clearInterval(timer); timer = null; }
        }

        ['mouseenter', 'focusin', 'touchstart'].forEach(function(ev) {
            track.addEventListener(ev, function() { paused = true; sync(); });
        });
        ['mouseleave', 'focusout', 'touchend'].forEach(function(ev) {
            track.addEventListener(ev, function() { paused = false; sync(); });
        });

        if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', sync);

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function(entries) {
                visible = entries[0].isIntersecting;
                sync();
            }).observe(track);
        } else {
            visible = true;
            sync();
        }
    }

    // ============================================================
    // 4. SCROLL REVEAL (progressivo — sem JS o conteúdo fica visível)
    // ============================================================
    const revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window && revealElements.length) {
        revealElements.forEach(function(el) {
            el.classList.add('reveal-init');
        });

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(function(el) { observer.observe(el); });
    } else {
        revealElements.forEach(function(el) {
            el.classList.add('is-visible');
        });
    }

})();