const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const filterButtons = document.querySelectorAll("[data-filter]");
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

const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
        navToggle.setAttribute("aria-expanded", "false");
        siteNav.classList.remove("is-open");
    }
});

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((item) => {
            item.classList.toggle("is-active", item === button);
        });

        productCards.forEach((card) => {
            card.hidden = filter !== "all" && card.dataset.category !== filter;
        });
    });
});

inquireButtons.forEach((button) => {
    button.addEventListener("click", () => {
        selectedProducts.add(button.dataset.inquire);
        selectedCopy.textContent = Array.from(selectedProducts).join(", ");
        document.querySelector("#inquiry").scrollIntoView({ behavior: "smooth", block: "start" });
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

dialogClose.addEventListener("click", () => {
    dialog.close();
});

dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
        dialog.close();
    }
});

inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(inquiryForm);
    const name = String(formData.get("name") || "").trim();

    formStatus.textContent = `${name}님, 상담 요청이 준비되었습니다. 스튜디오에서 곧 연락드리겠습니다.`;
    inquiryForm.reset();
    selectedProducts.clear();
    selectedCopy.textContent = "아직 선택된 제품이 없습니다.";
});
