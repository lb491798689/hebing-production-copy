/**
 * Add-Ons widget (metafield-driven) + G7 sticky bar ATC / Buy Now
 */
class ProductAddOnsG7 extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this._form = document.getElementById(this.getAttribute("form-id"));
    this._moneyFormat = this.getAttribute("data-money-format") || "${{amount}}";

    this._bindCards();
    this._bindMainFormSync();
    this._updateTotals();

    // 主商品 Quantity 在 form 外，由 PDP 脚本派发 g7:main-quantity-change
    document.documentElement.addEventListener("g7:main-quantity-change", () => this._updateTotals());
  }

  _getCardQuantity(card) {
    const input = card.querySelector("[data-card-quantity]");
    const qty = parseInt(input?.value, 10);
    return qty > 0 ? qty : 1;
  }

  getSelectedItems() {
    const items = [];

    this.querySelectorAll("[data-role]").forEach((card) => {
      const checkbox = card.querySelector("[data-addon-checkbox]");
      if (checkbox && !checkbox.checked) return;

      let variantId;
      if (card.dataset.role === "main") {
        variantId = this._form?.querySelector('input[name="id"]')?.value;
      } else {
        const select = card.querySelector("[data-addon-variant-select]");
        variantId = select ? select.value : card.dataset.variantId || card.querySelector("[data-variant-id]")?.value;
      }

      if (variantId) {
        items.push({ id: parseInt(variantId, 10), quantity: this._getCardQuantity(card) });
      }
    });

    return items;
  }

  getTotals() {
    let totalPrice = 0;
    let totalCompare = 0;

    this.querySelectorAll("[data-role]").forEach((card) => {
      const checkbox = card.querySelector("[data-addon-checkbox]");
      if (checkbox && !checkbox.checked) return;

      const unit = this._getCardUnitPrices(card);
      const qty = this._getCardQuantity(card);
      totalPrice += unit.price * qty;
      totalCompare += (unit.compare > unit.price ? unit.compare : unit.price) * qty;
    });

    return { totalPrice, totalCompare, finalTotal: totalPrice };
  }

  _dispatchChange() {
    const detail = {
      items: this.getSelectedItems(),
      ...this.getTotals()
    };
    this.dispatchEvent(new CustomEvent("g7-addons:change", { bubbles: true, detail }));
    document.documentElement.dispatchEvent(new CustomEvent("g7-addons:change", { detail }));
  }

  _bindCardQuantity(card) {
    const wrap = card.querySelector("[data-card-quantity-wrap]");
    if (!wrap) return;

    const input = wrap.querySelector("[data-card-quantity]");
    if (!input) return;

    // step/min 由 liquid 提供；+/- 交给主题 <quantity-selector>，勿重复绑 click（否则会 step 2）
    input.step = input.step || "1";
    input.min = input.min || "1";

    const update = () => {
      if (card.dataset.role === "main" && input.hasAttribute("data-sync-form-quantity")) {
        const formQty = this._form?.querySelector('input[name="quantity"]');
        if (formQty) formQty.value = input.value;
      }
      this._updateTotals();
    };

    input.addEventListener("change", update);
    input.addEventListener("input", update);
  }

  _isCardToggleExcludedTarget(target) {
    if (!target?.closest) return false;
    return Boolean(
      target.closest(
        "[data-addon-details], [data-card-quantity-wrap], .product-add-ons-g7__check, [data-addon-checkbox]"
      )
    );
  }

  _toggleAddonCard(card) {
    if (card.dataset.role !== "addon" || card.dataset.locked === "true") return;

    const checkbox = card.querySelector("[data-addon-checkbox]");
    if (!checkbox || checkbox.disabled) return;

    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
  }

  _bindCards() {
    this.querySelectorAll("[data-role]").forEach((card) => {
      this._bindCardQuantity(card);

      const checkbox = card.querySelector("[data-addon-checkbox]");
      const select = card.querySelector("[data-main-variant-select], [data-addon-variant-select]");

      if (card.dataset.role === "addon") {
        const detailsBtn = card.querySelector("[data-addon-details]");

        detailsBtn?.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          const url = detailsBtn.dataset.productUrl;
          if (url) window.open(url, "_blank", "noopener,noreferrer");
        });

        card.addEventListener(
          "click",
          (event) => {
            if (this._isCardToggleExcludedTarget(event.target)) return;
            event.preventDefault();
            event.stopPropagation();
            this._toggleAddonCard(card);
          },
          true
        );
      }

      checkbox?.addEventListener("change", () => {
        if (card.dataset.locked === "true") {
          checkbox.checked = true;
          return;
        }
        card.classList.toggle("is-selected", checkbox.checked);
        this._updateTotals();
      });

      select?.addEventListener("change", () => {
        this._updateCardPrices(card, select);
        if (card.dataset.role === "main") {
          this._syncMainVariantToForm(card, select.value);
        } else if (select.value) {
          card.dataset.variantId = select.value;
        }
        this._updateTotals();
      });
    });
  }

  _syncMainVariantToForm(mainCard, variantId) {
    if (!this._form?.id || !variantId) return;

    const variants = JSON.parse(mainCard.querySelector("[data-product-variants]")?.textContent || "[]");
    const variant = variants.find((v) => String(v.id) === String(variantId));
    if (!variant) return;

    const previousVariantId = this._form.id.value;
    if (previousVariantId === String(variantId)) return;

    this._form.id.value = variantId;
    this._form.id.dispatchEvent(new Event("change", { bubbles: true }));
    this._form.dispatchEvent(
      new CustomEvent("variant:change", {
        bubbles: true,
        detail: {
          formId: this._form.id,
          variant,
          previousVariant: variants.find((v) => String(v.id) === String(previousVariantId)) || null
        }
      })
    );
  }

  _bindMainFormSync() {
    if (!this._form) return;

    this._form.addEventListener("variant:change", (event) => {
      const variant = event.detail?.variant;
      if (!variant) return;

      const mainCard = this.querySelector('[data-role="main"]');
      if (!mainCard) return;

      const select = mainCard.querySelector("[data-main-variant-select]");
      if (select && select.value !== String(variant.id)) {
        select.value = String(variant.id);
        this._updateCardPrices(mainCard, select);
      } else if (!select) {
        const mainHidden = mainCard.querySelector("[data-main-variant-id]");
        if (mainHidden) {
          mainHidden.value = variant.id;
          mainHidden.dataset.price = variant.price;
          mainHidden.dataset.compare = variant.compare_at_price || variant.price;
        }
        this._updateCardPricesFromVariant(mainCard, variant);
      }

      const img = mainCard.querySelector("[data-main-image]");
      if (img && variant.featured_media?.preview_image?.src) {
        img.src = variant.featured_media.preview_image.src;
      }

      this._updateTotals();
    });

  }

  _getSelectedOption(select) {
    if (!select) return null;
    return select.options[select.selectedIndex];
  }

  _getCardUnitPrices(card) {
    if (card.dataset.role === "main") {
      const variantId = this._form?.querySelector('input[name="id"]')?.value;
      const variants = JSON.parse(card.querySelector("[data-product-variants]")?.textContent || "[]");
      const variant = variants.find((v) => String(v.id) === String(variantId));
      if (variant) {
        return { price: variant.price, compare: variant.compare_at_price || variant.price };
      }
      const mainHidden = card.querySelector("[data-main-variant-id]");
      return {
        price: parseInt(mainHidden?.dataset.price || "0", 10),
        compare: parseInt(mainHidden?.dataset.compare || "0", 10)
      };
    }

    const select = card.querySelector("[data-addon-variant-select]");
    if (select) {
      const option = this._getSelectedOption(select);
      return {
        price: parseInt(option?.dataset.price || "0", 10),
        compare: parseInt(option?.dataset.compare || "0", 10)
      };
    }

    const hidden = card.querySelector("[data-variant-id]");
    return {
      price: parseInt(hidden?.dataset.price || "0", 10),
      compare: parseInt(hidden?.dataset.compare || "0", 10)
    };
  }

  _updateCardPrices(card, select) {
    const option = this._getSelectedOption(select);
    if (!option) return;

    const price = parseInt(option.dataset.price || "0", 10);
    const compare = parseInt(option.dataset.compare || "0", 10);
    const imageUrl = option.dataset.image;

    const compareEl = card.querySelector("[data-compare-price]");
    const saleEl = card.querySelector("[data-sale-price]");

    if (compareEl) {
      compareEl.textContent = this._formatMoney(compare);
      compareEl.hidden = compare <= 0;
    }

    if (saleEl) {
      saleEl.textContent = this._formatMoney(price);
    }

    const img = card.querySelector("[data-main-image], [data-addon-image]");
    if (img && imageUrl) img.src = imageUrl;
  }

  _updateCardPricesFromVariant(card, variant) {
    const compareEl = card.querySelector("[data-compare-price]");
    const saleEl = card.querySelector("[data-sale-price]");
    const compare = variant.compare_at_price || variant.price;
    const price = variant.price || 0;

    if (compareEl) {
      compareEl.textContent = this._formatMoney(compare);
      compareEl.hidden = compare <= 0;
    }

    if (saleEl) {
      saleEl.textContent = this._formatMoney(price);
    }
  }

  _updateTotals() {
    this._dispatchChange();
  }

  _formatMoney(cents) {
    if (typeof cents !== "number" || isNaN(cents)) return "";
    if (window.Shopify?.formatMoney) {
      return window.Shopify.formatMoney(cents, this._moneyFormat);
    }
    const amount = (cents / 100).toFixed(2);
    return this._moneyFormat.replace(/\{\{\s*amount\s*\}\}/, amount);
  }
}

if (!window.customElements.get("product-add-ons-g7")) {
  window.customElements.define("product-add-ons-g7", ProductAddOnsG7);
}

class G7AddonsPurchaseBridge {
  constructor(formId) {
    this._form = document.getElementById(formId);
    this._widget = document.querySelector("product-add-ons-g7");
    this._sticky = document.querySelector(".g7-custom-sticky-cart");
    this._priceCurrent = this._sticky?.querySelector(".g7-price-current");
    this._priceCompare = this._sticky?.querySelector(".g7-price-compare");
    this._buyNow = this._sticky?.querySelector("[data-sticky-buy-now]");
    this._moneyFormat = this._widget?.getAttribute("data-money-format") || "${{amount}}";

    if (!this._form || !this._widget || !this._sticky) return;

    this._cartUrl = this._buyNow?.getAttribute("data-cart-url") || "/cart";
    this._checkoutSuffix = this._buildCheckoutSuffix();

    // 解析主商品 variants（用于按当前 variantId 查价格）
    try {
      this._mainVariants = JSON.parse(
        this._widget.querySelector("[data-main-product-variants]")?.textContent || "[]"
      );
    } catch (e) {
      this._mainVariants = [];
    }

    document.documentElement.addEventListener("g7-addons:change", (e) => this._onAddonsChange(e.detail));
    document.documentElement.addEventListener("g7-main-quantity-change", () => this._refresh());
    this._form.addEventListener("variant:change", () => this._refresh());
    this._form.addEventListener("change", (e) => {
      if (e.target?.name === "id") this._refresh();
    });

    // Buy Now：与 country 分支一致，用 cart permalink（预览店不支持 /checkout）
    this._hookFormSubmit();
    this._refresh();
  }

  _buildCheckoutSuffix() {
    const pageQuery = window.location.search.replace(/^\?/, "");
    return pageQuery ? `?checkout&${pageQuery}` : "?checkout";
  }

  _formatMoney(cents) {
    if (window.Shopify?.formatMoney) {
      return window.Shopify.formatMoney(cents, this._moneyFormat);
    }
    return (cents / 100).toFixed(2);
  }

  _getMainQuantityInput() {
    if (!this._form) return null;
    return (
      document.getElementById(`${this._form.id}-quantity`) ||
      document.querySelector(`input[name="quantity"][form="${this._form.id}"]`) ||
      this._form.querySelector('input[name="quantity"]')
    );
  }

  _getMainItem() {
    const idStr = this._form?.querySelector('input[name="id"]')?.value;
    const qtyStr = this._getMainQuantityInput()?.value;
    const id = parseInt(idStr, 10);
    if (!id) return null;
    let quantity = parseInt(qtyStr, 10);
    if (!Number.isFinite(quantity) || quantity < 1) quantity = 1;
    return { id, quantity };
  }

  _getMainPrices() {
    const main = this._getMainItem();
    if (!main) return { price: 0, compare: 0, quantity: 1 };
    const v = this._mainVariants?.find((x) => x.id === main.id);
    const price = v?.price ?? 0;
    const compare = v?.compare_at_price ?? price;
    return { price, compare, quantity: main.quantity };
  }

  _refresh() {
    this._onAddonsChange({
      ...(this._widget.getTotals?.() || { totalPrice: 0, totalCompare: 0, finalTotal: 0 }),
      items: this._widget.getSelectedItems?.() || []
    });
  }

  _onAddonsChange(detail) {
    if (!detail) return;

    const main = this._getMainPrices();
    const addonsTotal = detail.finalTotal ?? detail.totalPrice ?? 0;
    const addonsCompare = detail.totalCompare ?? 0;

    const lineTotal = main.price * main.quantity + addonsTotal;
    const lineCompare = main.compare * main.quantity + (addonsCompare || addonsTotal);

    const priceCurrent =
      this._sticky?.querySelector(".g7-price-current") || this._priceCurrent;
    const priceCompare =
      this._sticky?.querySelector(".g7-price-compare") || this._priceCompare;

    if (priceCurrent) {
      priceCurrent.textContent = this._formatMoney(lineTotal);
    }

    if (priceCompare) {
      if (lineCompare > lineTotal) {
        priceCompare.textContent = this._formatMoney(lineCompare);
        priceCompare.hidden = false;
      } else {
        priceCompare.hidden = true;
      }
    }

    const mainItem = this._getMainItem();
    if (!mainItem || !this._buyNow) return;

    const addonItems = detail.items ?? this._widget.getSelectedItems?.() ?? [];
    const items = addonItems.length ? [mainItem, ...addonItems] : [mainItem];
    this._updateBuyNowHref(items);
  }

  _cartPermalink(items) {
    if (!items?.length) return null;
    return items.map((item) => `${item.id}:${item.quantity}`).join(",");
  }

  _updateBuyNowHref(items) {
    if (!this._buyNow || !items?.length) return;
    const permalink = this._cartPermalink(items);
    if (!permalink) return;
    this._buyNow.setAttribute("href", `${this._cartUrl}/${permalink}${this._checkoutSuffix}`);
  }

  _hookFormSubmit() {
    this._form.addEventListener(
      "submit",
      async (event) => {
        const addons = this._widget.getSelectedItems?.() || [];
        // 没勾任何 add-on：交给原生 ProductForm 处理（主商品单独加购，触发抽屉）
        if (!addons.length) return;

        const main = this._getMainItem();
        if (!main) return;

        // 主商品 + add-ons 一起加入购物车
        const items = [main, ...addons];

        event.preventDefault();
        event.stopPropagation();

        let sectionsToBundle = ["variant-added"];
        document.documentElement.dispatchEvent(
          new CustomEvent("cart:prepare-bundled-sections", { bubbles: true, detail: { sections: sectionsToBundle } })
        );

        const submitButtons = Array.from(this._form.elements).filter((el) => el.type === "submit");
        submitButtons.forEach((btn) => btn.setAttribute("aria-busy", "true"));

        try {
          const response = await fetch(`${Shopify.routes.root}cart/add.js`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify({
              items,
              sections: sectionsToBundle.join(","),
              sections_url: `${Shopify.routes.root}variants/${main.id}`
            })
          });

          const responseJson = await response.json();

          if (response.ok) {
            const cartContent = await (await fetch(`${Shopify.routes.root}cart.js`)).json();
            cartContent.sections = responseJson.sections;

            document.documentElement.dispatchEvent(
              new CustomEvent("variant:add", {
                bubbles: true,
                detail: { items: responseJson.items || [responseJson], cart: cartContent }
              })
            );
            document.documentElement.dispatchEvent(
              new CustomEvent("cart:change", {
                bubbles: true,
                detail: { baseEvent: "variant:add", cart: cartContent }
              })
            );

            if (window.themeVariables?.settings?.cartType === "page") {
              window.location.href = `${Shopify.routes.root}cart`;
            }
          } else {
            document.documentElement.dispatchEvent(
              new CustomEvent("cart:error", {
                bubbles: true,
                detail: { error: responseJson.description || responseJson.message }
              })
            );
          }
        } catch (err) {
          console.error("G7 add-ons cart error:", err);
        } finally {
          submitButtons.forEach((btn) => btn.removeAttribute("aria-busy"));
        }
      },
      true
    );
  }
}

function initG7AddonsBridge() {
  const widget = document.querySelector("product-add-ons-g7");
  if (!widget) return;
  const formId = widget.getAttribute("form-id");
  if (formId && !widget.dataset.bridgeReady) {
    widget.dataset.bridgeReady = "true";
    new G7AddonsPurchaseBridge(formId);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initG7AddonsBridge);
} else {
  initG7AddonsBridge();
}

document.addEventListener("shopify:section:load", initG7AddonsBridge);
