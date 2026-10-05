import { DotLottie } from "./vendor/dotlottie-web.js";

document.documentElement.classList.add("has-js");

DotLottie.setWasmUrl("js/vendor/dotlottie-player.wasm");

const header = document.querySelector("[data-header]");
const headerToggle = document.querySelector("[data-header-toggle]");
const menuLottieCanvas = document.querySelector("[data-menu-lottie]");
const scrollLottieCanvas = document.querySelector("[data-scroll-lottie]");
const scrollLottieSection = document.querySelector("[data-scroll-lottie-section]");
const brandScroll = document.querySelector("[data-brand-scroll]");
const brandPanel = brandScroll?.querySelector(".home-intro");
const brandViewport = brandScroll?.querySelector(".intro-photo");
const brandPanImage = brandScroll?.querySelector(".brand-pan-image");
const filterButtons = document.querySelectorAll("[data-filter]");
const filterLinks = document.querySelectorAll("[data-filter-link]");
const productCards = document.querySelectorAll(".product-card");
const inquireButtons = document.querySelectorAll("[data-inquire]");
const selectedCopy = document.querySelector("[data-selected-copy]");
const inquiryForm = document.querySelector("[data-inquiry-form]");
const formStatus = document.querySelector("[data-form-status]");
const dialog = document.querySelector("[data-dialog]");
const dialogImage = document.querySelector("[data-dialog-image]");
const dialogTitle = document.querySelector("[data-dialog-title]");
const dialogClose = document.querySelector("[data-dialog-close]");
const selectedProducts = new Set();
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const createFrameController = (player, canvas, initialFrame = 0, onDraw = () => {}) => {
    let currentFrame = initialFrame;
    let targetFrame = initialFrame;
    let animationFrameId = 0;
    let isLoaded = false;

    const draw = (frame) => {
        currentFrame = frame;
        const renderedFrame = Math.round(frame);
        player.setFrame(renderedFrame);
        canvas.dataset.frame = String(renderedFrame);
        onDraw(renderedFrame);
    };

    const animateTo = (frame, duration = 500) => {
        targetFrame = frame;

        if (!isLoaded) {
            return;
        }

        window.cancelAnimationFrame(animationFrameId);

        if (prefersReducedMotion || Math.abs(targetFrame - currentFrame) < 0.1) {
            draw(targetFrame);
            return;
        }

        const startFrame = currentFrame;
        const startTime = performance.now();

        const tick = (time) => {
            const progress = Math.min((time - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            draw(startFrame + ((targetFrame - startFrame) * easedProgress));

            if (progress < 1) {
                animationFrameId = window.requestAnimationFrame(tick);
            }
        };

        animationFrameId = window.requestAnimationFrame(tick);
    };

    player.addEventListener("load", () => {
        isLoaded = true;
        draw(initialFrame);
        animateTo(targetFrame);
    });

    return { animateTo, draw: (frame) => isLoaded && draw(frame) };
};

const menuLottie = new DotLottie({
    autoplay: false,
    loop: false,
    canvas: menuLottieCanvas,
    src: "lottie/menu.lottie",
    renderConfig: {
        autoResize: true,
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    },
});

const scrollLottie = scrollLottieCanvas ? new DotLottie({
    autoplay: false,
    loop: false,
    canvas: scrollLottieCanvas,
    src: "lottie/scroll.lottie",
    renderConfig: {
        autoResize: true,
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    },
}) : null;

const menuFrameController = createFrameController(menuLottie, menuLottieCanvas, 25);
const syncScrollSpaceLink = () => {
    if (!scrollLottieSection) return;
    const progress = Number(scrollLottieSection.dataset.progress || 0);
    const frame = Number(scrollLottieCanvas.dataset.frame || 0);
    scrollLottieSection.classList.toggle("show-space-link", progress >= 0.711 && frame >= 79);
};
const scrollFrameController = scrollLottie ? createFrameController(scrollLottie, scrollLottieCanvas, 0, syncScrollSpaceLink) : null;
const scrollLottieFrames = [0, 10, 20, 30, 40, 50, 80];
const scrollLottieThresholds = [0, 0.072, 0.171, 0.270, 0.369, 0.468, 0.630];
let headerIsExpanded = window.scrollY <= 1;
let menuLottieReady = false;
let lastHeaderScrollY = window.scrollY;
let scrollLottieStage = 0;
let scrollLottieReady = false;
let scrollTicking = false;
let brandTicking = false;

const playHeaderLottie = (expanded) => {
    if (!menuLottieReady) {
        return;
    }

    menuFrameController.draw(expanded ? 15 : 0);
    menuFrameController.animateTo(expanded ? 25 : 15, expanded ? 340 : 500);
};

const setHeaderExpanded = (expanded, animate = true, force = false) => {
    if (!force && headerIsExpanded === expanded) {
        return;
    }

    headerIsExpanded = expanded;
    header.classList.toggle("is-collapsed", !expanded);
    header.dataset.state = expanded ? "expanded" : "collapsed";
    headerToggle.setAttribute("aria-expanded", String(expanded));
    headerToggle.setAttribute("aria-label", expanded ? "안뜰 메인 페이지로 이동" : "헤더 메뉴 펼치기");

    if (animate) {
        playHeaderLottie(expanded);
    }
};

const getScrollLottieStage = (progress) => {
    for (let index = scrollLottieThresholds.length - 1; index >= 0; index -= 1) {
        if (progress >= scrollLottieThresholds[index]) {
            return index;
        }
    }

    return 0;
};

const updateLottieFrames = () => {
    if (!scrollLottieSection) { scrollTicking = false; return; }
    const sectionTop = scrollLottieSection.getBoundingClientRect().top;
    const scrollDistance = Math.max(scrollLottieSection.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(-sectionTop / scrollDistance, 0), 1);
    const nextStage = getScrollLottieStage(progress);

    if (nextStage !== scrollLottieStage) {
        scrollLottieStage = nextStage;
        const targetFrame = scrollLottieFrames[scrollLottieStage];
        const previousFrame = Number(scrollLottieCanvas.dataset.frame || 0);
        const duration = Math.abs(targetFrame - previousFrame) > 10 ? 900 : 420;
        scrollFrameController.animateTo(targetFrame, duration);
    }

    scrollLottieSection.dataset.progress = progress.toFixed(3);
    scrollLottieSection.dataset.stage = String(scrollLottieStage);
    scrollLottieSection.classList.toggle("is-active", scrollLottieReady);
    syncScrollSpaceLink();
    scrollTicking = false;
};

const requestLottieUpdate = () => {
    if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(updateLottieFrames);
    }
};

const updateBrandPan = () => {
    brandTicking = false;
    if (!brandScroll || !brandPanImage || window.innerWidth <= 900 || prefersReducedMotion) return;
    const scrollRange = Math.max(1, brandScroll.offsetHeight - brandPanel.offsetHeight);
    const holdDistance = scrollRange * (20 / 155);
    const panDistance = scrollRange - (holdDistance * 2);
    const stickyTop = parseFloat(window.getComputedStyle(brandPanel).top) || 50;
    const elapsed = stickyTop - brandScroll.getBoundingClientRect().top;
    const progress = Math.min(Math.max((elapsed - holdDistance) / panDistance, 0), 1);
    const imageTravel = Math.max(0, brandPanImage.offsetWidth - brandViewport.clientWidth);
    brandPanImage.style.setProperty("--brand-pan", `${-imageTravel * progress}px`);
    brandScroll.dataset.progress = progress.toFixed(3);
};
const requestBrandPan = () => {
    if (!brandTicking) {
        brandTicking = true;
        window.requestAnimationFrame(updateBrandPan);
    }
};

menuLottie.addEventListener("load", () => {
    menuLottieReady = true;
    menuFrameController.draw(headerIsExpanded ? 25 : 15);
    requestAnimationFrame(() => header.classList.add("lottie-ready"));
});
scrollLottie?.addEventListener("load", () => {
    scrollLottieReady = true;
    requestLottieUpdate();
});

const updateHeader = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY <= 1) {
        setHeaderExpanded(true);
    } else if (Math.abs(currentScrollY - lastHeaderScrollY) > 1) {
        setHeaderExpanded(false);
    }

    lastHeaderScrollY = currentScrollY;
};

window.addEventListener("scroll", () => {
    updateHeader();
    requestLottieUpdate();
    requestBrandPan();
}, { passive: true });
window.addEventListener("resize", () => { requestLottieUpdate(); requestBrandPan(); });
brandPanImage?.addEventListener("load", requestBrandPan);
setHeaderExpanded(headerIsExpanded, false, true);
updateHeader();
requestLottieUpdate();
requestBrandPan();

headerToggle.addEventListener("click", () => {
    if (!headerIsExpanded) {
        setHeaderExpanded(true);
    } else {
        window.location.assign(new URL("./", document.baseURI).href);
    }
});

const query = (new URLSearchParams(location.search).get('q') || '').trim().toLocaleLowerCase();
const searchTerms = {seating: '의자 소파 좌석 체어', table: '탁자 책상 테이블 데스크', storage: '수납장 서랍장 책장 선반', room: '침대 거울 파티션 공간', light: '조명 램프 등'};
const applyFilter = (filter) => {
    filterButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.filter === filter);
    });

    productCards.forEach((card) => {
        const matchesCategory = filter === 'all' || card.dataset.category === filter;
        const haystack = `${card.textContent} ${card.querySelector('img')?.alt || ''} ${searchTerms[card.dataset.category] || ''}`.toLocaleLowerCase();
        card.hidden = !matchesCategory || (query !== '' && !haystack.includes(query));
    });
    const status = document.querySelector('[data-search-status]');
    if (status) {
        const count = [...productCards].filter(card => !card.hidden).length;
        status.textContent = query ? `“${query}” 검색 결과 ${count}개${count ? '' : ' · 다른 검색어나 분류를 선택해 주세요.'}` : '';
    }
};

filterButtons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter));
});

filterLinks.forEach((link) => {
    link.addEventListener("click", () => applyFilter(link.dataset.filterLink));
});

const updateSelectedProducts = () => {
    selectedCopy.textContent = selectedProducts.size
        ? Array.from(selectedProducts).join(", ")
        : "아직 선택된 제품이 없습니다.";
};

inquireButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const productName = button.dataset.inquire;

        if (selectedProducts.has(productName)) {
            selectedProducts.delete(productName);
            button.classList.remove("is-selected");
            button.setAttribute("aria-label", `${productName} 문의 담기`);
        } else {
            selectedProducts.add(productName);
            button.classList.add("is-selected");
            button.setAttribute("aria-label", `${productName} 문의에서 빼기`);
        }

        updateSelectedProducts();
    });
});

document.querySelectorAll(".product-image").forEach((button) => {
    button.addEventListener("click", () => {
        const image = button.querySelector("img");
        dialogImage.src = image.src;
        dialogImage.alt = image.alt;
        dialogTitle.textContent = button.dataset.product;

        if (typeof dialog.showModal === "function") {
            dialog.showModal();
        }
    });
});

dialogClose?.addEventListener("click", () => dialog.close());

dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) {
        dialog.close();
    }
});

inquiryForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(inquiryForm);
    const name = String(formData.get("name") || "").trim();

    formStatus.textContent = `${name}님, 상담 요청이 준비되었습니다. 안뜰 스튜디오에서 곧 연락드리겠습니다.`;
    inquiryForm.reset();
    selectedProducts.clear();
    inquireButtons.forEach((button) => button.classList.remove("is-selected"));
    updateSelectedProducts();
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
}

const storySections = document.querySelectorAll(".home-story");
if (brandPanel) {
    if ("IntersectionObserver" in window && !prefersReducedMotion) {
        const brandObserver = new IntersectionObserver((entries, observer) => {
            if (!entries[0].isIntersecting) return;
            brandScroll.classList.add("is-visible");
            observer.disconnect();
        }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
        brandObserver.observe(brandPanel);
    } else {
        brandScroll.classList.add("is-visible");
    }
}
if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const storyObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
    storySections.forEach((section) => storyObserver.observe(section));
} else {
    storySections.forEach((section) => section.classList.add("is-visible"));
}

const bannerVideo = document.querySelector('.hero-video');
if (bannerVideo) {
    const hero = bannerVideo.closest('.hero');
    const play = document.querySelector('[data-video-play]');
    const mute = document.querySelector('[data-video-mute]');
    const volume = document.querySelector('[data-video-volume]');
    const seek = document.querySelector('[data-video-progress]');
    let controlsTimer = 0;
    let lastAudibleVolume = 1;
    const showControls = () => {
        hero.classList.add('has-controls-visible');
        window.clearTimeout(controlsTimer);
        controlsTimer = window.setTimeout(() => hero.classList.remove('has-controls-visible'), 3000);
    };
    const hideControls = () => {
        window.clearTimeout(controlsTimer);
        hero.classList.remove('has-controls-visible');
    };
    const syncPlayback = () => {
        play.setAttribute('aria-label', bannerVideo.paused ? '영상 재생' : '영상 일시정지');
        play.firstElementChild.textContent = bannerVideo.paused ? '▶' : 'Ⅱ';
    };
    const syncVolume = () => {
        const silent = bannerVideo.muted || bannerVideo.volume === 0;
        mute.setAttribute('aria-pressed', String(silent));
        mute.setAttribute('aria-label', silent ? '영상 소리 켜기' : '영상 음소거');
        volume.value = silent ? 0 : bannerVideo.volume;
    };
    const syncProgress = () => {
        const duration = bannerVideo.duration;
        seek.disabled = !Number.isFinite(duration) || duration <= 0;
        if (!seek.disabled) {
            seek.value = bannerVideo.currentTime / duration * 100;
            seek.style.setProperty('--played', `${seek.value}%`);
            seek.setAttribute('aria-valuetext', `${Math.floor(bannerVideo.currentTime)}초 / ${Math.floor(duration)}초`);
        }
    };
    const togglePlayback = async () => {
        if (!bannerVideo.paused) bannerVideo.pause();
        else { try { await bannerVideo.play(); } catch { syncPlayback(); } }
    };
    play.addEventListener('click', togglePlayback);
    hero.addEventListener('click', event => {
        if (!event.target.closest('.hero-controls')) togglePlayback();
    });
    hero.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') showControls(); });
    hero.addEventListener('pointermove', event => { if (event.pointerType !== 'touch') showControls(); });
    hero.addEventListener('pointerleave', hideControls);
    mute.addEventListener('click', () => {
        if (bannerVideo.muted || bannerVideo.volume === 0) {
            if (bannerVideo.volume === 0) bannerVideo.volume = lastAudibleVolume;
            bannerVideo.muted = false;
        } else {
            lastAudibleVolume = bannerVideo.volume;
            bannerVideo.muted = true;
        }
    });
    volume.addEventListener('input', () => {
        bannerVideo.volume = Number(volume.value);
        bannerVideo.muted = bannerVideo.volume === 0;
        if (bannerVideo.volume > 0) lastAudibleVolume = bannerVideo.volume;
    });
    seek.addEventListener('input', () => {
        if (Number.isFinite(bannerVideo.duration)) bannerVideo.currentTime = Number(seek.value) / 100 * bannerVideo.duration;
        syncProgress();
    });
    ['play', 'pause', 'ended'].forEach(event => bannerVideo.addEventListener(event, syncPlayback));
    ['loadedmetadata', 'durationchange', 'timeupdate'].forEach(event => bannerVideo.addEventListener(event, syncProgress));
    bannerVideo.addEventListener('volumechange', syncVolume);
    syncPlayback(); syncVolume(); syncProgress();
}

const searchForm = document.querySelector('[data-search-form]');
const searchToggle = document.querySelector('[data-search-toggle]');
const searchField = document.querySelector('[data-search-field]');
const searchInput = document.querySelector('#site-search');
const closeSearch = () => {
    header.classList.remove('search-open');
    searchToggle.setAttribute('aria-expanded', 'false');
    searchToggle.setAttribute('aria-label', '검색 열기');
    searchField.inert = true;
};
searchToggle.addEventListener('click', () => {
    const opened = header.classList.contains('search-open');
    if (opened && searchInput.value.trim()) { searchForm.requestSubmit(); return; }
    if (opened) { closeSearch(); return; }
    header.classList.add('search-open');
    searchToggle.setAttribute('aria-expanded', 'true');
    searchToggle.setAttribute('aria-label', '가구 검색 실행');
    searchField.inert = false;
    window.setTimeout(() => {
        if (header.classList.contains('search-open')) searchInput.focus();
    }, prefersReducedMotion ? 0 : 360);
});
searchForm.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeSearch(); searchToggle.focus(); }
});
document.addEventListener('pointerdown', event => { if (!searchForm.contains(event.target)) closeSearch(); });
searchForm.addEventListener('submit', event => {
    searchInput.value = searchInput.value.trim();
    if (!searchInput.value) { event.preventDefault(); searchInput.focus(); }
});

// Category links remain normal page navigations, with the selected collection restored.
const category = new URLSearchParams(location.search).get('category');
if (productCards.length) applyFilter([...filterButtons].some(button => button.dataset.filter === category) ? category : 'all');
if (query) searchInput.value = query;

const track = document.querySelector('[data-carousel]');
if (track) {
    const previous = document.querySelector('[data-carousel-prev]');
    const next = document.querySelector('[data-carousel-next]');
    let pointer = null;
    let dragged = false;
    let lastFrame = 0;
    let subpixel = 0;
    let navigationPauseUntil = 0;
    const step = () => track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
    const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const syncNavigation = () => {
        const max = maxScroll();
        previous.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max - 2;
    };
    const movePage = (direction) => {
        const itemStep = step();
        if (!itemStep) return;
        const inset = parseFloat(getComputedStyle(track).paddingLeft);
        const visibleCount = Math.max(1, Math.ceil((track.clientWidth - inset) / itemStep));
        const nextUnseen = Math.ceil((track.scrollLeft + track.clientWidth - inset) / itemStep);
        const firstVisible = Math.floor(track.scrollLeft / itemStep);
        const index = direction > 0 ? nextUnseen : firstVisible - visibleCount;
        track.scrollTo({
            left: Math.max(0, Math.min(maxScroll(), index * itemStep)),
            behavior: prefersReducedMotion ? 'instant' : 'smooth',
        });
        navigationPauseUntil = performance.now() + 1200;
    };
    previous.addEventListener('click', () => movePage(-1));
    next.addEventListener('click', () => movePage(1));
    track.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); movePage(event.key === 'ArrowRight' ? 1 : -1); }
    });
    const carousel = track.closest('.carousel-shell');
    track.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        pointer = {id: event.pointerId, x: event.clientX, left: track.scrollLeft}; dragged = false;
    });
    track.addEventListener('pointermove', event => {
        if (!pointer) return;
        const distance = event.clientX - pointer.x;
        if (Math.abs(distance) > 6) {
            dragged = true; track.classList.add('is-dragging'); track.setPointerCapture(pointer.id);
            track.scrollLeft = pointer.left - distance;
        }
    });
    const release = () => { pointer = null; track.classList.remove('is-dragging'); syncNavigation(); };
    window.addEventListener('pointerup', release);
    track.addEventListener('pointercancel', release);
    track.addEventListener('click', event => { if (dragged) { event.preventDefault(); dragged = false; } }, true);
    track.addEventListener('dragstart', event => event.preventDefault());
    track.addEventListener('scroll', syncNavigation, {passive: true});
    new ResizeObserver(syncNavigation).observe(track);
    const animate = (time) => {
        const elapsed = Math.min(time - (lastFrame || time), 64);
        lastFrame = time;
        const bounds = track.getBoundingClientRect();
        const inView = bounds.bottom > 0 && bounds.top < window.innerHeight;
        const canAdvance = track.scrollLeft < maxScroll() - 1;
        const keyboardFocus = carousel.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
        if (!prefersReducedMotion && canAdvance && inView && !carousel.matches(':hover') && !keyboardFocus && !pointer && !document.hidden && time > navigationPauseUntil) {
            subpixel += elapsed * .023;
            const pixels = Math.floor(subpixel);
            if (pixels > 0) {
                track.scrollLeft = Math.min(maxScroll(), track.scrollLeft + pixels);
                subpixel -= pixels;
                syncNavigation();
            }
        }
        window.requestAnimationFrame(animate);
    };
    syncNavigation();
    window.requestAnimationFrame(animate);
}

const privacyDialog = document.querySelector('[data-privacy-dialog]');
document.querySelectorAll('[data-privacy-open]').forEach(trigger => {
    trigger.addEventListener('click', () => {
        if (typeof privacyDialog?.showModal === 'function') privacyDialog.showModal();
    });
});
document.querySelector('[data-privacy-close]')?.addEventListener('click', () => privacyDialog.close());
privacyDialog?.addEventListener('click', event => {
    if (event.target === privacyDialog) privacyDialog.close();
});

// A static GitHub Pages site cannot receive subscriptions: open a draft, never claim it was sent.
document.querySelector('[data-newsletter]')?.addEventListener('submit', event => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get('email');
    document.querySelector('[data-newsletter-status]').textContent = '이메일 앱에서 구독 요청을 전송해 주세요. 아직 신청이 완료되지 않았습니다.';
    location.href = `mailto:storytellerhu@gmail.com?subject=${encodeURIComponent('안뜰 뉴스레터 구독 요청')}&body=${encodeURIComponent('뉴스레터 구독을 요청합니다.\n이메일: ' + email + '\n개인정보 수집 및 이용에 동의합니다.')}`;
});
