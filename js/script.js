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

const scrollLottie = new DotLottie({
    autoplay: false,
    loop: false,
    canvas: scrollLottieCanvas,
    src: "lottie/scroll.lottie",
    renderConfig: {
        autoResize: true,
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    },
});

const menuFrameController = createFrameController(menuLottie, menuLottieCanvas);
const scrollFrameController = createFrameController(scrollLottie, scrollLottieCanvas);
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
    headerToggle.setAttribute("aria-label", expanded ? "펼쳐진 헤더" : "헤더 메뉴 펼치기");

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
scrollLottie.addEventListener("load", requestLottieUpdate);

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

dialogClose.addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
        dialog.close();
    }
});

inquiryForm.addEventListener("submit", (event) => {
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
