document.documentElement.classList.add("has-js");

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const mobileNav = document.querySelector(".mobile-nav");
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

const closeMenu = () => {
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "메뉴 열기");
    mobileNav.classList.remove("is-open");
    document.body.classList.remove("is-menu-open");
};

const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

navToggle.addEventListener("click", () => {
    const willOpen = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.setAttribute("aria-expanded", String(willOpen));
    navToggle.setAttribute("aria-label", willOpen ? "메뉴 닫기" : "메뉴 열기");
    mobileNav.classList.toggle("is-open", willOpen);
    document.body.classList.toggle("is-menu-open", willOpen);
});

mobileNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
        closeMenu();
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
