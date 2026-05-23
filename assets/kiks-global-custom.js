/* Browser Check */
function addBrowserClass() {
    const body = document.body;
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edge') === -1) {
        body.classList.add('browser-chrome');
    } else if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) {
        body.classList.add('browser-safari');
    } else if (userAgent.indexOf('firefox') > -1) {
        body.classList.add('browser-firefox');
    } else if (userAgent.indexOf('edge') > -1) {
        body.classList.add('browser-edge');
    } else {
        body.classList.add('browser-unknown');
    }
}

addBrowserClass();

// Animation 
document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll("main#main .shopify-section");

    function checkVisibility() {
        sections.forEach((section, index) => {
            if (section.classList.contains("animated")) return;

            const rect = section.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;

            if (isVisible) {
                setTimeout(() => {
                    section.classList.add("visible", "animated");
                }, index * 200); // 150ms stagger per section
            }
        });
    }

    function optimizedScroll() {
        requestAnimationFrame(checkVisibility);
    }

    window.addEventListener("scroll", optimizedScroll);
    document.addEventListener("shopify:section:load", checkVisibility);

    checkVisibility(); // Initial load
});


// footer Links on mobile
function handleAccordion() {
    const footerLinks = document.querySelectorAll('.footer .footer-v2-nav-item');

    if (window.innerWidth <= 1023) {
        footerLinks.forEach(footerLink => {
            footerLink.addEventListener('click', toggleAccordion);
        });
    } else {
        footerLinks.forEach(footerLink => {
            footerLink.removeEventListener('click', toggleAccordion);
            footerLink.classList.remove('active');
        });
    }
}

function toggleAccordion(event) {
    const block = event.currentTarget;
    block.classList.toggle('active');
    const icon = block.querySelector('.footer-v2-accordion-icon');
    if (icon) {
        icon.textContent = block.classList.contains('active') ? '−' : '+';
    }
}

document.addEventListener('DOMContentLoaded', handleAccordion);
window.addEventListener('resize', handleAccordion);


// Swiper Slider 1


// Slider Accordion 
class kiksSliderAccordion extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const accordionElement = this;
        const swiperContainer = accordionElement.querySelector('.kiks-custom-accordion');
        if (!swiperContainer) return;

        const enableHover = accordionElement.getAttribute('data-hover') === "true";
        const enableScroll = accordionElement.getAttribute('data-scroll') === "true";
        const enableScrollMobile = accordionElement.getAttribute('data-scroll-mobile') === "true";
        const enableLoop = accordionElement.getAttribute('data-loop') === "true";

        const isSmallScreen = window.innerWidth <= 1149;

        const swiperOptions = {
            direction: "vertical",
            slidesPerView: 6,
            spaceBetween: 16,
            loop: enableLoop,
            grabCursor: true,
            // mousewheel: {
            //     forceToAxis: true,
            // },
            freeMode: true,
            breakpoints: {
                // 320: { direction: "horizontal", slidesPerView: 1, spaceBetween: 20, freeMode: false, centeredSlides: true },
                // 375: { direction: "horizontal", slidesPerView: 1, spaceBetween: 20, freeMode: false, centeredSlides: true },
                // 425: { direction: "horizontal", slidesPerView: 1, spaceBetween: 20, freeMode: false, centeredSlides: true },
                // 430: { direction: "horizontal", slidesPerView: 1, spaceBetween: 20, freeMode: false, centeredSlides: true },
                // 768: { direction: "horizontal", slidesPerView: 2, spaceBetween: 20, freeMode: false, centeredSlides: true },
                // 1024: { direction: "horizontal", slidesPerView: 2, spaceBetween: 20, freeMode: false, centeredSlides: true },
                // 1433: { direction: "vertical", slidesPerView: "auto", spaceBetween: 16 },
                // 1434: { direction: "vertical", slidesPerView: "auto", spaceBetween: 16 },
                // 1435: { direction: "vertical", slidesPerView: "auto", spaceBetween: 16 },
                // 1436: { direction: "vertical", slidesPerView: "auto", spaceBetween: 16 },
                // 1437: { direction: "vertical", slidesPerView: "auto", spaceBetween: 16 },
                // 1438: { direction: "vertical", slidesPerView: "auto", spaceBetween: 16 },
                // 1439: { direction: "vertical", slidesPerView: "auto", spaceBetween: 16 },
                // 1440: { direction: "vertical", slidesPerView: "auto", spaceBetween: 16 },
                // 1600: { direction: "vertical", slidesPerView: "auto", spaceBetween: 16 }
                320: {
                    direction: "horizontal",
                    slidesPerView: 1,
                    spaceBetween: 20,
                    freeMode: false,
                    centeredSlides: true,
                },
                1149: {
                    direction: "horizontal",
                    slidesPerView: 2,
                    spaceBetween: 20,
                    freeMode: false,
                    centeredSlides: true,
                },
                1150: {
                    direction: "vertical",
                    slidesPerView: "auto",
                    spaceBetween: 16,
                }
            },
            on: {
                init: () => {
                    handleSlideUpdate();
                },
                slideChangeTransitionStart: () => {
                    handleSlideUpdate();
                },
            }
        };

        // ✅ Only add pagination dots if screen is small
        if (isSmallScreen) {
            swiperOptions.pagination = {
                el: '.swiper-pagination',
                clickable: true,
            };
        }

        const swiper = new Swiper(swiperContainer, swiperOptions);
        swiper.init();

        // 💡 Helpers
        function handleSlideUpdate() {
            const activeSlide = accordionElement.querySelector('.swiper-slide-active');
            if (!activeSlide) return;

            if (isSmallScreen) {
                setSlidesExpanded();
            } else if (enableScroll) {
                updateActiveSlide();
                updateActiveImage(activeSlide.getAttribute("data-count"));
            }
        }

        function updateActiveSlide(activeElement = null) {
            accordionElement.querySelectorAll('.swiper-slide').forEach(slide => {
                slide.setAttribute('aria-expanded', "false");
                slide.removeAttribute('open');
            });

            const activeSlide = activeElement || accordionElement.querySelector('.swiper-slide-active');
            if (activeSlide) {
                activeSlide.setAttribute('aria-expanded', "true");
                activeSlide.setAttribute('open', "");
            }
        }

        function updateActiveImage(activeCount) {
            const imageItems = document.querySelectorAll('.accordion-image-container .accordion-image-item');
            imageItems.forEach(item => item.classList.remove('is-active'));

            const activeImage = document.querySelector(`.accordion-image-container .accordion-image-item[data-count="${activeCount}"]`);
            if (activeImage) {
                activeImage.classList.add('is-active');
            }
        }

        function setSlidesExpanded() {
            accordionElement.querySelectorAll('.swiper-slide').forEach(slide => {
                slide.setAttribute('aria-expanded', "true");
                slide.setAttribute('open', "");
            });

            const activeSlide = accordionElement.querySelector('.swiper-slide-active');
            if (activeSlide) {
                updateActiveImage(activeSlide.getAttribute("data-count"));
            }
        }

        function enableScrollBehavior() {
            window.addEventListener('scroll', () => {
                setSlidesExpanded();
            });
        }

        function applyBehaviors() {
            if (isSmallScreen) {
                setSlidesExpanded();
                enableScrollBehavior();
            } else if (enableHover) {
                accordionElement.querySelectorAll('.swiper-slide').forEach(slide => {
                    slide.addEventListener('mouseenter', function () {
                        updateActiveSlide(this);
                        updateActiveImage(this.getAttribute("data-count"));
                    });
                });
            }
        }

        // ✅ Call immediately without timeout
        applyBehaviors();

        // Reapply on resize
        window.addEventListener('resize', () => {
            applyBehaviors();
        });
    }
}

if (!customElements.get("kiks-slider-accordion")) {
    customElements.define("kiks-slider-accordion", kiksSliderAccordion);
}

// New Slider 2 Kiks-image-blocks
// Created by Jerome
class KiksImageBlocks extends HTMLElement {
    constructor() {
        super();
        this.swiper = null;
    }

    connectedCallback() {
        this.initSwiper();
    }

    initSwiper() {
        if (typeof Swiper === "undefined") {
            console.error("Swiper is not defined. Make sure Swiper JS is loaded.");
            return;
        }

        // Get attributes from the HTML element
        const autoSlide = this.getAttribute("data-auto-slide") === "true";
        const slideSpeed = parseInt(this.getAttribute("data-slide-speed"), 10) || 3000;
        const loop = this.getAttribute("data-loop") !== "false";
        const navigation = this.getAttribute("data-navigation") === "true";

        // Ensure the wrapper exists
        let wrapper = this.querySelector(".swiper-wrapper");
        if (!wrapper) {
            console.error("Swiper wrapper not found inside kiks-image-blocks.");
            return;
        }

        // Initialize Swiper with smooth auto-slide
        this.swiper = new Swiper(this, {
            loop: loop,
            speed: slideSpeed,
            slidesPerView: 4,
            spaceBetween: 10,
            freeMode: loop ? false : true, // 👈 important change
            breakpoints: {
                320: {
                    slidesPerView: 1.5,
                    spaceBetween: 10
                },
                375: {
                    slidesPerView: 1.5,
                    spaceBetween: 10
                },
                430: {
                    slidesPerView: 2,
                    spaceBetween: 10
                },
                425: {
                    slidesPerView: 2,
                    spaceBetween: 10
                },
                768: {
                    slidesPerView: 4,
                    spaceBetween: 10
                },
                1600: {
                    slidesPerView: 4,
                    spaceBetween: 10
                }
            },
            autoplay: autoSlide
                ? {
                    delay: 0,
                    disableOnInteraction: false,
                }
                : false,
        });


        // // Stop auto-slide on hover
        // this.addEventListener("mouseenter", () => this.swiper?.autoplay?.stop());
        // this.addEventListener("mouseleave", () => this.swiper?.autoplay?.start());
    }
}

if (!window.customElements.get("kiks-image-blocks")) {
    window.customElements.define("kiks-image-blocks", KiksImageBlocks);
}

// Logo Slider
import { animate as animate2, stagger as stagger3, inView } from "vendor";
class KiksRevealItems extends HTMLElement {
    constructor() {
        super();

        if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches && window.themeVariables.settings.staggerProductsApparition) {
            inView(this, this.#reveal_fn.bind(this), { margin: this.getAttribute("margin") ?? "-50px 0px" });
        }
        this.swiper = null;
    }

    #reveal_fn() {
        this.style.opacity = "1";
        animate2(
            this.hasAttribute("selector") ? this.querySelectorAll(this.getAttribute("selector")) : this.children,
            { opacity: [0, 1], transform: ["translateY(15px)", "translateY(0)"] },
            { duration: 0.35, delay: stagger3(0.05, { easing: "ease-out" }), easing: "ease" }
        );
    }

    connectedCallback() {
        this.initSwiper();
    }

    initSwiper() {
        if (typeof Swiper === "undefined") {
            console.error("Swiper is not defined. Make sure Swiper JS is loaded.");
            return;
        }

        // Get attributes from the HTML element
        const autoSlide = this.getAttribute("data-auto-slide") === "true";
        const slideSpeed = parseInt(this.getAttribute("data-slide-speed"), 10) || 3000;
        const loop = this.getAttribute("data-loop") !== "false";
        const navigation = this.getAttribute("data-navigation") === "true";

        // Ensure the wrapper exists
        let wrapper = this.querySelector(".swiper-wrapper");
        if (!wrapper) {
            console.error("Swiper wrapper not found inside swiper-logo.");
            return;
        }

        // Initialize Swiper with smooth auto-slide
        this.swiper = new Swiper(this, {
            loop: loop,
            speed: slideSpeed, // Smooth scrolling effect
            slidesPerView: 9, // Allow dynamic widths
            spaceBetween: 10,
            breakpoints: {
                375: {
                    slidesPerView: 3,
                    spaceBetween: 48
                },
                425: {
                    slidesPerView: 3,
                    spaceBetween: 48
                },
                430: {
                    slidesPerView: 3,
                    spaceBetween: 48
                },
                768: {
                    slidesPerView: 5,
                    spaceBetween: 20
                },
                1600: {
                    slidesPerView: 9,
                    spaceBetween: 10
                }
            },
            autoplay: autoSlide
                ? {
                    delay: 0, // No delay between slides
                    disableOnInteraction: false,
                }
                : false,
            freeMode: true, // Enables smooth scrolling effect
            freeModeMomentum: true, // Enables inertia effect
            freeModeMomentumRatio: 0.2, // Reduces sudden stops
            freeModeMomentumBounce: false, // Disables bouncing
            cssMode: false, // Allows Swiper to handle smooth transitions
            allowTouchMove: false, // Prevent manual dragging for continuous effect
            navigation: navigation
                ? {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                }
                : false,
        });

        // Stop auto-slide on hover
        // this.addEventListener("mouseenter", () => this.swiper?.autoplay?.stop());
        // this.addEventListener("mouseleave", () => this.swiper?.autoplay?.start());
    }
}

if (!window.customElements.get("kiks-reveal-items")) {
    window.customElements.define("kiks-reveal-items", KiksRevealItems);
}

// icons with text section
class KiksIconText extends HTMLElement {
    constructor() {
        super();
        this.swiper = null;
    }

    connectedCallback() {
        this.initSwiper();
    }

    initSwiper() {
        if (typeof Swiper === "undefined") {
            console.error("Swiper is not defined. Make sure Swiper JS is loaded.");
            return;
        }

        const swiperContainer = this.querySelector(".kiks-text-with-icons__list");
        if (!swiperContainer) {
            console.error("Swiper container '.kiks-text-with-icons__list' not found inside custom element.");
            return;
        }

        const autoSlide = this.getAttribute("data-auto-slide") === "true";
        const scrollSpeed = parseInt(this.getAttribute("data-scroll-speed"), 10) || 5000;
        const loop = this.getAttribute("data-loop") === "true";

        this.swiper = new Swiper(swiperContainer, {
            loop: true,
            speed: scrollSpeed,
            slidesPerView: 7,  // Allow dynamic widths
            spaceBetween: 32,   // Adjust spacing to match design
            centeredSlides: true,
            freeMode: true,
            freeModeMomentum: false, // Continuous movement
            allowTouchMove: false,   // Prevent manual dragging
            autoplay: true
                ? {
                    delay: 0, // No delay, so it moves smoothly
                    pauseOnMouseEnter: false,
                    disableOnInteraction: true
                }
                : false,
            breakpoints: {
                320: {
                    slidesPerView: 1.5,
                    spaceBetween: 10
                },
                375: {
                    slidesPerView: 1.5,
                    spaceBetween: 10
                },
                425: {
                    slidesPerView: 2,
                    spaceBetween: 32
                },
                430: {
                    slidesPerView: 2,
                    spaceBetween: 32
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 32
                },
                1440: {
                    slidesPerView: 5,
                    spaceBetween: 32
                },
                1600: {
                    slidesPerView: 7,
                    spaceBetween: 32
                },
                1650: {
                    slidesPerView: 5,
                    spaceBetween: 32
                }
            },
        });
    }
}

if (!customElements.get("kiks-icons-slider")) {
    customElements.define("kiks-icons-slider", KiksIconText);
}
// kiks Carousel Card
class KiksCarouselCard extends HTMLElement {
    constructor() {
        super();
        this.swiper = null;
    }

    connectedCallback() {
        this.initSwiper();
    }

    initSwiper() {
        if (typeof Swiper === "undefined") {
            console.error("Swiper is not defined. Make sure Swiper JS is loaded.");
            return;
        }

        const paginationEl = this.querySelector(".swiper-pagination");
        if (!paginationEl) {
            console.warn("swiper-pagination element not found inside <kiks-carousel-card>.");
        }

        this.swiper = new Swiper(this, {
            spaceBetween: 40,
            centeredSlides: true,
            slidesPerView: 2.5,
            grabCursor: true,
            freeMode: false,
            loop: true,
            pagination: {
                el: paginationEl,
                clickable: true,
            },
            breakpoints: {
                320: {
                    slidesPerView: 1,
                    spaceBetween: 10
                },
                375: {
                    slidesPerView: 1.5,
                    spaceBetween: 10
                },
                425: {
                    slidesPerView: 1.5,
                    spaceBetween: 10
                },
                430: {
                    slidesPerView: 1.5,
                    spaceBetween: 10
                },
                768: {
                    slidesPerView: 2.5,
                    spaceBetween: 10
                },
                1440: {
                    slidesPerView: 2.5,
                    spaceBetween: 40
                },
                1600: {
                    slidesPerView: 2.5,
                    spaceBetween: 40
                }
            }
        });
    }
}

if (!window.customElements.get("kiks-carousel-card")) {
    window.customElements.define("kiks-carousel-card", KiksCarouselCard);
}

// kiks Carousel Card
class kiksMmultiColumnSwiper extends HTMLElement {
    constructor() {
        super();
        this.swiper = null;
    }

    connectedCallback() {
        this.initSwiper();
    }

    initSwiper() {
        if (typeof Swiper === "undefined") {
            console.error("Swiper is not defined. Make sure Swiper JS is loaded.");
            return;
        }

        const paginationEl = this.querySelector(".swiper-pagination");
        if (!paginationEl) {
            console.warn("swiper-pagination element not found inside <kiks-carousel-card>.");
        }

        this.swiper = new Swiper(this, {
            centeredSlides: false,
            loop: false,
            slidesPerView: 3,
            spaceBetween: 30,
            pagination: {
                el: paginationEl,
                clickable: true,
                type: 'bullets',
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                // When screen width is >= 1200px (Desktop)
                1200: {
                    slidesPerView: 3,    // Show 3 slides
                    spaceBetween: 30,    // Space between slides
                },
                // When screen width is >= 768px (Tablet)
                768: {
                    slidesPerView: 2.5,    // Show 2 slides
                    spaceBetween: 20,    // Less space between slides
                },
                // When screen width is >= 480px (Mobile)
                480: {
                    slidesPerView: 1.2,    // Show 1 slide
                    spaceBetween: 10,    // Even less space between slides
                },
                425: {
                    slidesPerView: 1.2,    // Show 1 slide
                    spaceBetween: 10,    // Even less space between slides
                },
                375: {
                    slidesPerView: 1.2,    // Show 1 slide
                    spaceBetween: 10,    // Even less space between slides
                },
                390: {
                    slidesPerView: 1.2,    // Show 1 slide
                    spaceBetween: 10,    // Even less space between slides
                },
                320: {
                    slidesPerView: 1.2,    // Show 1 slide
                    spaceBetween: 10,    // Even less space between slides
                },
            },
        });
    }
}



if (!window.customElements.get("kiks-multi-column-swiper")) {
    window.customElements.define("kiks-multi-column-swiper", kiksMmultiColumnSwiper);
}


class kiksMmultiColumnSwiperLogo extends HTMLElement {
    constructor() {
        super();
        this.swiper = null;
    }

    connectedCallback() {
        this.initSwiper();
    }

    initSwiper() {
        if (typeof Swiper === "undefined") {
            console.error("Swiper is not defined. Make sure Swiper JS is loaded.");
            return;
        }

        const paginationEl = this.querySelector(".swiper-pagination");
        if (!paginationEl) {
            console.warn("swiper-pagination element not found inside <kiks-carousel-card>.");
        }

        this.swiper = new Swiper(this, {
            
            loop: true,
            slidesPerView: 3,
            spaceBetween: 120,
            centeredSlides: true,
            pagination: {
                el: paginationEl,
                clickable: true,
                type: 'bullets',
            },
            navigation: {
                nextEl: '.swiper-button-next-logo',
                prevEl: '.swiper-button-prev-logo',
            },
            breakpoints: {
                // When screen width is >= 1200px (Desktop)
                1200: {
                    slidesPerView: 3,    // Show 3 slides
                    spaceBetween: 125,    // Space between slides
                },
                // When screen width is >= 768px (Tablet)
                768: {
                    slidesPerView: 2.5,    // Show 2 slides
                    spaceBetween: 20,    // Less space between slides
                },
                // When screen width is >= 480px (Mobile)
                480: {
                    slidesPerView: 1,    // Show 1 slide
                    spaceBetween: 10,    // Even less space between slides
                },
                425: {
                    slidesPerView: 1,    // Show 1 slide
                    spaceBetween: 10,    // Even less space between slides
                },
                375: {
                    slidesPerView: 1,    // Show 1 slide
                    spaceBetween: 10,    // Even less space between slides
                },
                390: {
                    slidesPerView: 1,    // Show 1 slide
                    spaceBetween: 10,    // Even less space between slides
                },
                320: {
                    slidesPerView: 1,    // Show 1 slide
                    spaceBetween: 10,    // Even less space between slides
                },
            },
        });
    }
}

if (!window.customElements.get("kiks-multi-column-swiper-logo")) {
    window.customElements.define("kiks-multi-column-swiper-logo", kiksMmultiColumnSwiperLogo);
}


// Extended Products
class KiksExtendedProduct extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const checkboxes = this.querySelectorAll(
            ".product-item .product-check-box-container input.product-check-box"
        );

        const selectedDisplay = this.querySelector(".product-selected");
        const targetForm = this.querySelector(".product-info__buy-buttons form[is='product-form']");

        //New Changes here 04-16-25 Start Here
        const productItems = this.querySelectorAll(".product-item");

        productItems.forEach((item) => {
            const checkbox = item.querySelector(".product-check-box");

            item.addEventListener("mouseenter", () => {
                // Uncheck all others and remove is-active
                productItems.forEach((otherItem) => {
                    const otherCheckbox = otherItem.querySelector(".product-check-box");
                    if (otherCheckbox) {
                        otherCheckbox.checked = false;
                        otherItem.classList.remove("is-active");
                    }
                });

                // Add is-active to hovered and check it
                if (checkbox) {
                    checkbox.checked = true;
                    item.classList.add("is-active");
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });

            item.addEventListener("mouseleave", () => {
                if (checkbox) {
                    checkbox.checked = false;
                    item.classList.remove("is-active");
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });
        //New Changes here 04-16-25 End Here




        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener("change", function () {
                // Reset all checkboxes and remove from form
                checkboxes.forEach((cb) => {
                    const item = cb.closest(".product-item");
                    if (cb !== checkbox) {
                        cb.checked = false;
                        item.classList.remove("is-active");
                    }

                    // Reset checkbox type to checkbox if it was hidden before
                    if (cb.type === "hidden") {
                        cb.type = "checkbox";
                    }

                    // Move it back to original container if moved
                    const container = item.querySelector(".product-check-box-container");
                    if (container && !container.contains(cb)) {
                        container.appendChild(cb);
                    }
                });

                const productItem = checkbox.closest(".product-item");

                if (checkbox.checked) {
                    productItem.classList.add("is-active");

                    // Get product label
                    const infoSpan = productItem.querySelector(
                        ".horizontal-product__info span.reversed-link"
                    );

                    if (infoSpan && selectedDisplay) {
                        selectedDisplay.textContent = infoSpan.textContent.trim();
                    }

                    // Move checked checkbox into the form as hidden input
                    if (targetForm) {
                        checkbox.type = "hidden";
                        targetForm.appendChild(checkbox);
                    }
                } else {
                    productItem.classList.remove("is-active");

                    if (selectedDisplay) {
                        selectedDisplay.textContent = "";
                    }
                }
            });
        });

        // ✅ Automatically check the first checkbox on load
        if (checkboxes.length > 0) {
            checkboxes[0].checked = true;
            checkboxes[0].dispatchEvent(new Event('change'));
        }
    }
}

if (!window.customElements.get("kiks-extended-product")) {
    window.customElements.define("kiks-extended-product", KiksExtendedProduct);
}
// 3D Button and Functions
class kiks3DProduct extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Render the component's HTML content directly into the DOM
        this.render();

        // Get the 3D model URL from the 'data-product-treeD-url' attribute
        const modelUrl = this.getAttribute('data-product-treeD-url');

        // Get the trigger button inside the component
        const button = this.querySelector('.trigger-modal-button');
        const zoombtn = this.querySelector('.trigger-zoom-button');


        // Trigger model viewer when the button is clicked
        button.addEventListener('click', () => {
            this.trigger3DViewer(modelUrl);
            this.classList.add('zoom-btn');
            zoombtn.classList.remove('hidden');

            // Add the 'is-tree-d' class to the product gallery
            const productGalleryParent = document.querySelector('.product product-gallery.product-gallery');
            if (productGalleryParent) {
                productGalleryParent.classList.add('is-tree-d');
            }
            // Select all media items in the product gallery
            const productGalleryItems = document.querySelectorAll('.product-gallery.product-gallery .product-gallery__media');

            // Loop through each item and remove the 'is-selected' class if it doesn't have the 'three-d-box' class
            productGalleryItems.forEach(item => {
                if (!item.classList.contains('three-d-box')) {
                    item.classList.remove('is-selected');
                }
            });


        });

    }

    render() {
        // You can optionally render or modify the HTML content here
        // But in this case, the button is passed as HTML directly
    }

    trigger3DViewer(modelUrl) {
        // Create a new 3D model viewer and append it to the external element
        const productGallery = document.querySelector('.product-gallery media-carousel');

        if (!productGallery) {
            console.error("Couldn't find the target 'product-gallery .media-carousel' element.");
            return;
        }

        // Create the 3D model viewer container
        const threeDBox = document.createElement('div');
        threeDBox.className = 'three-d-box is-selected';
        threeDBox.setAttribute('data-media-type', 'image');
        threeDBox.setAttribute('data-media-id', '37209851090729');
        // Create the model-viewer element
        const modelViewer = document.createElement('model-viewer');
        modelViewer.setAttribute('autoplay', 'true');
        modelViewer.setAttribute('animation-name', 'Running');
        modelViewer.setAttribute('src', modelUrl);
        modelViewer.setAttribute('camera-controls', 'true');
        modelViewer.setAttribute('loading', 'eager');
        // modelViewer.setAttribute('camera-orbit', '180deg 90deg 0');
        modelViewer.setAttribute('exposure', '1.45');
        modelViewer.style.width = '100%';
        modelViewer.style.height = '100%';
        modelViewer.style.background = '#f9f9f9';

        // Append the model viewer to the 3D container
        threeDBox.appendChild(modelViewer);

        // Close button for the 3D model viewer
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        const closeIcon = document.createElement('img');
        closeIcon.src = 'https://cdn.shopify.com/s/files/1/0656/9079/6273/files/close-s.svg';
        closeButton.appendChild(closeIcon);

        closeButton.addEventListener('click', () => {
            threeDBox.remove();
            this.classList.remove('zoom-btn');
            const zoombtn = this.querySelector('.trigger-zoom-button');
            zoombtn.classList.add('hidden');
            // remove the 'is-tree-d' class to the product gallery
            const productGalleryParent = document.querySelector('.product product-gallery.product-gallery');
            productGalleryParent.classList.remove('is-tree-d');

        });

        threeDBox.appendChild(closeButton);

        // Insert the 3D box at the top of the target container (outside the web component)
        productGallery.insertBefore(threeDBox, productGallery.firstChild);

        const zoombtn = this.querySelector('.trigger-zoom-button');
        zoombtn.addEventListener('click', () => {
            const product = document.querySelector('.product');
            const threeDBox = product.querySelector('.three-d-box.is-selected');
            // Apply inline styles
            threeDBox.style.position = 'fixed';
            threeDBox.style.zIndex = '99';
            threeDBox.style.background = 'rgb(238, 238, 238)';
            threeDBox.style.width = '100%';
            threeDBox.style.height = '100%';
            threeDBox.style.inset = '0px';
            if (threeDBox && product) {
                product.insertBefore(threeDBox, product.firstChild);
            }
        });


        // Optional: track the event with GTM (Google Tag Manager)
        if (typeof commonGtmEvent === 'function') {
            commonGtmEvent('Product-3D', '', 'Product');
        } else {
            console.log('Product-3D event triggered');
        }
    }
}

// Define the custom element if it's not already defined
if (!window.customElements.get("kiks-3d-product")) {
    window.customElements.define("kiks-3d-product", kiks3DProduct);
}


// js/sections/media-grid.js
import { timeline as timeline12, inView as inView10 } from "vendor";
class kiksMediaGrid extends HTMLElement {
    connectedCallback() {
        this.items = Array.from(this.children);
        if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
            inView10(this, this._onBecameVisible.bind(this));
        }
    }
    _onBecameVisible() {
        const contentElements = this.querySelectorAll(".content-over-media > :not(img, video, iframe, svg, video-media, native-video, external-video)");
        timeline12([
            [this.items, { opacity: 1, transform: ["translateY(10px)", "translateY(0)"] }, { duration: 0.3 }],
            [contentElements, { opacity: [0, 1] }, { duration: 0.2, at: "+0.1" }]
        ]);
    }
};
if (!window.customElements.get("kiks-media-grid")) {
    window.customElements.define("kiks-media-grid", kiksMediaGrid);
}





















