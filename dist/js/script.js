import { DotLottie } from "./vendor/dotlottie-web.js";

document.documentElement.classList.add("has-js");

DotLottie.setWasmUrl("js/vendor/dotlottie-player.wasm");

const header = document.querySelector("[data-header]");
const headerToggle = document.querySelector("[data-header-toggle]");
const menuLottieCanvas = document.querySelector("[data-menu-lottie]");
const scrollLottieCanvas = document.querySelector("[data-scroll-lottie]");
const scrollLottieSection = document.querySelector("[data-scroll-lottie-section]");
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

const createFrameController = (player, canvas, initialFrame = 0) => {
    let currentFrame = initialFrame;
    let targetFrame = initialFrame;
    let animationFrameId = 0;
    let isLoaded = false;

    const draw = (frame) => {
        currentFrame = frame;
        const renderedFrame = Math.round(frame);
        player.setFrame(renderedFrame);
        canvas.dataset.frame = String(renderedFrame);
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

const menuFrameController = createFrameController(menuLottie, menuLottieCanvas);
const scrollFrameController = scrollLottie ? createFrameController(scrollLottie, scrollLottieCanvas) : null;
const scrollLottieFrames = [0, 10, 20, 30, 40, 50, 80];
const scrollLottieThresholds = [0, 0.08, 0.2, 0.32, 0.44, 0.56, 0.68];
let headerIsExpanded = window.scrollY <= 1;
let menuLottieReady = false;
let lastHeaderScrollY = window.scrollY;
let scrollLottieStage = 0;
let scrollTicking = false;

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
    scrollTicking = false;
};

const requestLottieUpdate = () => {
    if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(updateLottieFrames);
    }
};

menuLottie.addEventListener("load", () => {
    menuLottieReady = true;
    playHeaderLottie(headerIsExpanded);
});
scrollLottie?.addEventListener("load", requestLottieUpdate);

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
}, { passive: true });
window.addEventListener("resize", requestLottieUpdate);
setHeaderExpanded(headerIsExpanded, false, true);
updateHeader();
requestLottieUpdate();

headerToggle.addEventListener("click", () => {
    if (!headerIsExpanded) {
        setHeaderExpanded(true);
    } else {
        window.location.assign(new URL("./", document.baseURI).href);
    }
});

const applyFilter = (filter) => {
    filterButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.filter === filter);
    });

    productCards.forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.category !== filter;
    });
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

const bannerVideo = document.querySelector('.hero-video');
const soundButton = document.querySelector('[data-hero-sound]');
if (bannerVideo && soundButton) {
    const syncSound = () => {
        const audible = !bannerVideo.muted && bannerVideo.volume > 0;
        soundButton.setAttribute('aria-pressed', String(audible));
        soundButton.setAttribute('aria-label', audible ? '영상 소리 끄기' : '영상 소리 켜기');
        soundButton.querySelector('[data-sound-label]').textContent = audible ? '소리 끄기' : '소리 켜기';
    };
    soundButton.addEventListener('click', () => {
        bannerVideo.muted = !bannerVideo.muted;
        if (!bannerVideo.muted && bannerVideo.volume === 0) bannerVideo.volume = 1;
        syncSound();
    });
    bannerVideo.addEventListener('volumechange', syncSound);
    syncSound();
}

// Category links remain normal page navigations, with the selected collection restored.
const category = new URLSearchParams(location.search).get('category');
if (category && [...filterButtons].some(button => button.dataset.filter === category)) applyFilter(category);

const track = document.querySelector('[data-carousel]');
if (track) {
    const previous = document.querySelector('[data-carousel-prev]');
    const next = document.querySelector('[data-carousel-next]');
    const pause = document.querySelector('[data-carousel-pause]');
    const progress = document.querySelector('[data-carousel-progress]');
    let paused = prefersReducedMotion;
    let hovered = false;
    let focused = false;
    let visible = false;
    let pointer = null;
    let dragged = false;
    let lastAdvance = performance.now();
    const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const step = () => track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
    const sync = () => {
        const max = maxScroll();
        previous.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max - 2;
        const ratio = Math.min(1, track.clientWidth / track.scrollWidth);
        progress.style.width = `${ratio * 100}%`;
        progress.style.transform = `translateX(${max ? track.scrollLeft / max * (1 - ratio) / ratio * 100 : 0}%)`;
    };
    const move = (direction, wrap = false) => {
        let target = track.scrollLeft + direction * step();
        if (wrap && track.scrollLeft >= maxScroll() - 2) target = 0;
        track.scrollTo({left: Math.max(0, Math.min(maxScroll(), target)), behavior: prefersReducedMotion ? 'instant' : 'smooth'});
        lastAdvance = performance.now();
    };
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    const syncPause = () => {
        pause.setAttribute('aria-pressed', String(paused));
        pause.setAttribute('aria-label', paused ? '자동 재생 시작' : '자동 재생 일시정지');
        pause.textContent = paused ? '▶' : 'Ⅱ';
    };
    pause.addEventListener('click', () => { paused = !paused; lastAdvance = performance.now(); syncPause(); });
    track.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
    });
    const carousel = track.closest('.bestsellers');
    carousel.addEventListener('mouseenter', () => { hovered = true; });
    carousel.addEventListener('mouseleave', () => { hovered = false; lastAdvance = performance.now(); });
    carousel.addEventListener('focusin', () => { focused = true; });
    carousel.addEventListener('focusout', event => { focused = carousel.contains(event.relatedTarget); lastAdvance = performance.now(); });
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
    const release = () => { pointer = null; track.classList.remove('is-dragging'); lastAdvance = performance.now(); };
    window.addEventListener('pointerup', release);
    track.addEventListener('pointercancel', release);
    track.addEventListener('click', event => { if (dragged) { event.preventDefault(); dragged = false; } }, true);
    track.addEventListener('dragstart', event => event.preventDefault());
    track.addEventListener('scroll', sync, {passive: true});
    track.addEventListener('touchstart', () => { lastAdvance = performance.now(); }, {passive: true});
    track.addEventListener('touchend', () => { lastAdvance = performance.now(); }, {passive: true});
    new ResizeObserver(sync).observe(track);
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; lastAdvance = performance.now(); }, {threshold: .3}).observe(track);
    setInterval(() => {
        if (!paused && !hovered && !focused && !pointer && visible && !document.hidden && performance.now() - lastAdvance > 4200) move(1, true);
    }, 250);
    sync(); syncPause();
}

// A static GitHub Pages site cannot receive subscriptions: open a draft, never claim it was sent.
document.querySelector('[data-newsletter]')?.addEventListener('submit', event => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get('email');
    document.querySelector('[data-newsletter-status]').textContent = '이메일 앱에서 구독 요청을 전송해 주세요. 아직 신청이 완료되지 않았습니다.';
    location.href = `mailto:storytellerhu@gmail.com?subject=${encodeURIComponent('안뜰 뉴스레터 구독 요청')}&body=${encodeURIComponent('뉴스레터 구독을 요청합니다.\n이메일: ' + email + '\n개인정보 수집 및 이용에 동의합니다.')}`;
});
