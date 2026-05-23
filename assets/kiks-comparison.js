class ProductComparison extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        const FEATURES = [
            "style",
            "color",
            "massage",
            "arm_style",
            "ventilation_&_heated_function",
            "warranty",
            "material",
            "recommended_height",
            "maximum_weight"
        ];

        const chair1Dropdown = document.getElementById("chair1");
        const chair2Dropdown = document.getElementById("chair2");
        const productLeft = document.getElementById("product-left");
        const productRight = document.getElementById("product-right");

        const ensureDifferentSelections = () => {
            if (chair1Dropdown.value === chair2Dropdown.value) {
                const alternativeOptions = [...chair2Dropdown.options].filter(opt => opt.value !== chair1Dropdown.value);
                if (alternativeOptions.length > 0) {
                    chair2Dropdown.value = alternativeOptions[0].value;
                }
            }
        };

        const updateDisabledOptions = () => {
            document.querySelectorAll("#chair1 option, #chair2 option").forEach(opt => {
                opt.disabled = false;
            });

            const chair1Option = chair1Dropdown.querySelector(`option[value="${chair2Dropdown.value}"]`);
            const chair2Option = chair2Dropdown.querySelector(`option[value="${chair1Dropdown.value}"]`);

            if (chair1Option) chair1Option.disabled = true;
            if (chair2Option) chair2Option.disabled = true;
        };

        const updateProductsDisplay = () => {
            const chair1Element = document.getElementById(chair1Dropdown.value);
            const chair2Element = document.getElementById(chair2Dropdown.value);

            if (chair1Element) {
                productLeft.innerHTML = chair1Element.innerHTML;
                productLeft.style.display = 'flex';
                productLeft.style.flexDirection = 'column';
            } else {
                productLeft.innerHTML = '';
                productLeft.style.display = 'none';
            }

            if (chair2Element) {
                productRight.innerHTML = chair2Element.innerHTML;
                productRight.style.display = 'flex';
                productRight.style.flexDirection = 'column';
            } else {
                productRight.innerHTML = '';
                productRight.style.display = 'none';
            }
        };

        const updateTableContent = () => {
            const chair1Option = chair1Dropdown.selectedOptions[0];
            const chair2Option = chair2Dropdown.selectedOptions[0];

            if (!chair1Option || !chair2Option) return;

            const chair1Features = chair1Option.dataset;
            const chair2Features = chair2Option.dataset;

            FEATURES.forEach(feature => {
                const elementChair1 = document.getElementById(`${feature}-chair1`);
                const elementChair2 = document.getElementById(`${feature}-chair2`);

                let valueChair1 = chair1Features[feature] ? chair1Features[feature].replace(/&quot;/g, '"') : "-";
                let valueChair2 = chair2Features[feature] ? chair2Features[feature].replace(/&quot;/g, '"') : "-";

                if (elementChair1) elementChair1.innerText = valueChair1;
                if (elementChair2) elementChair2.innerText = valueChair2;
            });
        };

        const updateComparison = () => {
            ensureDifferentSelections();
            updateDisabledOptions();
            updateProductsDisplay();
            updateTableContent();
        };

        chair1Dropdown.addEventListener("change", updateComparison);
        chair2Dropdown.addEventListener("change", updateComparison);

        setTimeout(updateComparison, 100);
    }
}

// Register the Web Component
customElements.define("product-comparison", ProductComparison);

// class ProductComparison extends HTMLElement {
//     constructor() {
//         super();
//     }

//     connectedCallback() {

//         const FEATURES = [
//             "style",
//             "color",
//             "massage",
//             "arm_style",
//             "ventilation_&_heated_function",
//             "warranty",
//             "material",
//             "recommended_height",
//             "maximum_weight"
//         ];

//         // 🔥 Scope elements **within this component instance only**
//         const chair1Dropdown = this.querySelector(".chair1");
//         const chair2Dropdown = this.querySelector(".chair2");
//         const productLeft = this.querySelector(".product-left");
//         const productRight = this.querySelector(".product-right");

//         if (!chair1Dropdown || !chair2Dropdown || !productLeft || !productRight) {
//             console.error("Product comparison elements missing in this instance:", this);
//             return;
//         }

//         const ensureDifferentSelections = () => {
//             if (chair1Dropdown.value === chair2Dropdown.value) {
//                 const alternativeOptions = [...chair2Dropdown.options].filter(opt => opt.value !== chair1Dropdown.value);
//                 if (alternativeOptions.length > 0) {
//                     chair2Dropdown.value = alternativeOptions[0].value;
//                 }
//             }
//         };

//         const updateDisabledOptions = () => {
//             this.querySelectorAll(".chair1 option, .chair2 option").forEach(opt => {
//                 opt.disabled = false;
//             });

//             const chair1Option = chair1Dropdown.querySelector(`option[value="${chair2Dropdown.value}"]`);
//             const chair2Option = chair2Dropdown.querySelector(`option[value="${chair1Dropdown.value}"]`);

//             if (chair1Option) chair1Option.disabled = true;
//             if (chair2Option) chair2Option.disabled = true;
//         };

//         const updateProductsDisplay = () => {
//             const chair1Element = this.querySelector(`#${chair1Dropdown.value}`);
//             const chair2Element = this.querySelector(`#${chair2Dropdown.value}`);

//             if (chair1Element) {
//                 productLeft.innerHTML = chair1Element.innerHTML;
//                 productLeft.style.display = 'flex';
//                 productLeft.style.flexDirection = 'column';
//             } else {
//                 productLeft.innerHTML = '';
//                 productLeft.style.display = 'none';
//             }

//             if (chair2Element) {
//                 productRight.innerHTML = chair2Element.innerHTML;
//                 productRight.style.display = 'flex';
//                 productRight.style.flexDirection = 'column';
//             } else {
//                 productRight.innerHTML = '';
//                 productRight.style.display = 'none';
//             }
//         };

//         const updateTableContent = () => {
//             const chair1Option = chair1Dropdown.selectedOptions[0];
//             const chair2Option = chair2Dropdown.selectedOptions[0];

//             if (!chair1Option || !chair2Option) return;

//             const chair1Features = chair1Option.dataset;
//             const chair2Features = chair2Option.dataset;

//             FEATURES.forEach(feature => {
//                 const elementChair1 = this.querySelector(`.${feature}-chair1`);
//                 const elementChair2 = this.querySelector(`.${feature}-chair2`);

//                 let valueChair1 = chair1Features.hasOwnProperty(feature) ? chair1Features[feature].replace(/&quot;/g, '"') : "-";
//                 let valueChair2 = chair2Features.hasOwnProperty(feature) ? chair2Features[feature].replace(/&quot;/g, '"') : "-";

//                 if (elementChair1) elementChair1.innerText = valueChair1;
//                 if (elementChair2) elementChair2.innerText = valueChair2;
//             });
//         };

//         const updateComparison = () => {
//             ensureDifferentSelections();
//             updateDisabledOptions();
//             updateProductsDisplay();
//             updateTableContent();
//         };

//         chair1Dropdown.addEventListener("change", updateComparison);
//         chair2Dropdown.addEventListener("change", updateComparison);

//         setTimeout(updateComparison, 100);
//     }
// }

// // Register the Web Component
// customElements.define("product-comparison", ProductComparison);

