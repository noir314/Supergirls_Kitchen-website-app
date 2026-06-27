// scripts.js
document.addEventListener('DOMContentLoaded', () => {
  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Order button (top CTA)
  const orderBtn = document.getElementById('order-btn');
  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      window.location.href = 'https://your-ordering-site.com';
    });
  }

  // 3D hover effect
  const cards = document.querySelectorAll('.glass');
  if (cards.length) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;

      cards.forEach((card, i) => {
        const depth = (i + 1) * 2.5;
        card.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
    });

    window.addEventListener('mouseleave', () => {
      cards.forEach((card) => (card.style.transform = 'translate(0, 0)'));
    });
  }

  // Recipe Book cards
  document.querySelectorAll('.recipe').forEach((a) => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const name =
        a.querySelector('.recipe-name')?.textContent?.trim() || 'item';
      alert(`${name} details coming soon!`);
    });
  });

  // Menu panel + category toggling
  const panel = document.getElementById('menu-panel');
  const menuCards = document.querySelectorAll('[data-menu]');

  // When clicking recipe/menu category cards (if present)
  menuCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const group = card.getAttribute('data-menu');
      if (!group) return;

      // Set tab button aria-selected
      document.querySelectorAll('.tab-btn').forEach((btn) => {
        const isActive = btn.getAttribute('data-tab') === group;
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // Show correct group
      document.querySelectorAll('.menu-group').forEach((g) => {
        const active = g.getAttribute('data-group') === group;
        g.hidden = !active;
        g.classList.toggle('is-active', active);
      });

      panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-tab');
      if (!group) return;

      document.querySelectorAll('.tab-btn').forEach((b) => {
        b.setAttribute('aria-selected', b.getAttribute('data-tab') === group ? 'true' : 'false');
      });

      document.querySelectorAll('.menu-group').forEach((g) => {
        const active = g.getAttribute('data-group') === group;
        g.hidden = !active;
        g.classList.toggle('is-active', active);
      });
    });
  });

  // Quantity controls + total
  const sumTotalEl = document.getElementById('sum-total');

  function toMoney(n) {
    const x = Number(n) || 0;
    return `$${x.toFixed(2)}`;
  }

  function computeTotal() {
    let total = 0;

    document.querySelectorAll('.mini-item').forEach((item) => {
      const priceEl = item.querySelector('.mini-item__price');
      const input = item.querySelector('.qty-input');
      if (!priceEl || !input) return;

      const unit = Number(priceEl.dataset.price || 0);
      const qty = Math.max(0, Number(input.value || 0));
      total += unit * qty;
    });

    if (sumTotalEl) sumTotalEl.textContent = toMoney(total);
  }

  function setInputValue(input, newVal) {
    const v = Math.max(0, Number(newVal));
    input.value = Number.isFinite(v) ? v : 0;
    computeTotal();
  }

  // +/- buttons
  document.querySelectorAll('.mini-item .qty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const miniItem = btn.closest('.mini-item');
      const input = miniItem?.querySelector('.qty-input');
      if (!input) return;

      const action = btn.getAttribute('data-action');
      const cur = Number(input.value || 0);

      if (action === 'inc') setInputValue(input, cur + 1);
      if (action === 'dec') setInputValue(input, cur - 1);
    });
  });

  // Manual typing
  document.querySelectorAll('.mini-item .qty-input').forEach((input) => {
    input.addEventListener('input', () => {
      const v = Number(input.value || 0);
      setInputValue(input, v);
    });
  });

  // Add buttons (currently just recompute)
  document.querySelectorAll('.add-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      computeTotal();
      btn.blur();
    });
  });

  // Confirm order
  const confirmBtn = document.getElementById('confirm-order');
  confirmBtn?.addEventListener('click', () => {
    const total = sumTotalEl?.textContent || '$0.00';
    alert(`Added to order! Estimated total: ${total}`);

    if (window.ORDER_URL) window.location.href = window.ORDER_URL;
  });

  // Initial total
  computeTotal();
});
document.addEventListener('DOMContentLoaded', () => {
  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Cart UI (upper-right + drawer) =====
  const cartBtn = document.getElementById('cart-btn');
  const cartTotalEl = document.getElementById('cart-total');
  const cartCountEl = document.getElementById('cart-count');

  const cartDrawer = document.getElementById('cart-drawer');
  const cartClose = document.getElementById('cart-close');
  const cartItemsEl = document.getElementById('cart-items');
  const cartDrawerTotalEl = document.getElementById('cart-drawer-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  function toMoney(n) {
    const x = Number(n) || 0;
    return `$${x.toFixed(2)}`;
  }

  function readCart() {
    // Each .mini-item has:
    // - .mini-item__name
    // - .mini-item__price (data-price)
    // - .qty-input (quantity)
    const items = [];
    let total = 0;
    let count = 0;

    document.querySelectorAll('.mini-item').forEach((item) => {
      const name = item.querySelector('.mini-item__name')?.textContent?.trim() || '';
      const priceEl = item.querySelector('.mini-item__price');
      const input = item.querySelector('.qty-input');

      if (!priceEl || !input || !name) return;

      const unit = Number(priceEl.dataset.price || 0);
      const qty = Math.max(0, Number(input.value || 0));
      if (qty <= 0) return;

      const line = unit * qty;
      total += line;
      count += qty;

      items.push({ name, unit, qty, line });
    });

    return { items, total, count };
  }

  function renderCart() {
    const { items, total, count } = readCart();

    if (cartTotalEl) cartTotalEl.textContent = toMoney(total);
    if (cartCountEl) cartCountEl.textContent = String(count);
    if (cartDrawerTotalEl) cartDrawerTotalEl.textContent = toMoney(total);

    // Drawer list
    if (cartItemsEl) {
      if (items.length === 0) {
        cartItemsEl.innerHTML = `<div class="mini-empty" style="padding:10px 0;opacity:.75;">Your cart is empty.</div>`;
      } else {
        cartItemsEl.innerHTML = items
          .map(
            (it) => `
              <div class="cart-item">
                <div>
                  <div class="cart-item__name">${escapeHtml(it.name)}</div>
                  <div class="cart-item__meta">${toMoney(it.unit)} each</div>
                </div>
                <div style="text-align:right;">
                  <div class="cart-item__qty">
                    <span class="cart-item__meta" style="opacity:1;">x${it.qty}</span>
                  </div>
                  <div class="cart-item__meta" style="font-weight:900;opacity:1;">${toMoney(it.line)}</div>
                </div>
              </div>
            `
          )
          .join('');
      }
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }[c]));
  }

  function openCart() {
    renderCart();
    if (cartDrawer) cartDrawer.hidden = false;
  }
  function closeCart() {
    if (cartDrawer) cartDrawer.hidden = true;
  }

  cartBtn?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);

  // Close drawer when tapping backdrop area (optional: tap outside)
  document.addEventListener('click', (e) => {
    if (!cartDrawer || cartDrawer.hidden) return;
    if (e.target === cartDrawer) closeCart();
  });

  checkoutBtn?.addEventListener('click', () => {
    const { total, count } = readCart();
    if (count === 0) {
      alert('Add at least one item to checkout.');
      return;
    }
    alert(`Proceeding to checkout. Estimated total: ${toMoney(total)}`);
    if (window.ORDER_URL) window.location.href = window.ORDER_URL;
  });

  // ===== Existing ordering logic =====
  // 3D hover effect
  const cards = document.querySelectorAll('.glass');
  if (cards.length) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;

      cards.forEach((card, i) => {
        const depth = (i + 1) * 2.5;
        card.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
    });

    window.addEventListener('mouseleave', () => {
      cards.forEach((card) => (card.style.transform = 'translate(0, 0)'));
    });
  }

  // Recipe cards
  document.querySelectorAll('.recipe').forEach((a) => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const name = a.querySelector('.recipe-name')?.textContent?.trim() || 'item';
      alert(`${name} details coming soon!`);
    });
  });

  // Top CTA "Order Now" still works if you keep it; otherwise ignore
  const orderBtn = document.getElementById('order-btn');
  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      window.location.href = 'https://your-ordering-site.com';
    });
  }

  // Tabs + panel (fix broken selector by removing any stray characters; uses data-group)
  const panel = document.getElementById('menu-panel');
  document.querySelectorAll('[data-menu]').forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const group = card.getAttribute('data-menu');
      if (!group) return;

      document.querySelectorAll('.tab-btn').forEach((btn) => {
        const isActive = btn.getAttribute('data-tab') === group;
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      document.querySelectorAll('.menu-group').forEach((g) => {
        const active = g.getAttribute('data-group') === group;
        g.hidden = !active;
        g.classList.toggle('is-active', active);
      });

      panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-tab');
      if (!group) return;

      document.querySelectorAll('.tab-btn').forEach((b) => {
        b.setAttribute('aria-selected', b.getAttribute('data-tab') === group ? 'true' : 'false');
      });

      document.querySelectorAll('.menu-group').forEach((g) => {
        const active = g.getAttribute('data-group') === group;
        g.hidden = !active;
        g.classList.toggle('is-active', active);
      });
    });
  });

  // Quantity controls
  function setInputValue(input, newVal) {
    const v = Math.max(0, Number(newVal));
    input.value = Number.isFinite(v) ? v : 0;
    computeOrderTotals(); // keep existing total + new cart UI
  }

  function computeOrderTotals() {
    // If you still have #sum-total, keep it in sync
    const sumTotalEl = document.getElementById('sum-total');
    const { total } = readCart();
    if (sumTotalEl) sumTotalEl.textContent = toMoney(total);

    // Update upper-right cart + drawer
    renderCart();
  }

  document.querySelectorAll('.mini-item .qty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const miniItem = btn.closest('.mini-item');
      const input = miniItem?.querySelector('.qty-input');
      if (!input) return;

      const action = btn.getAttribute('data-action');
      const cur = Number(input.value || 0);

      if (action === 'inc') setInputValue(input, cur + 1);
      if (action === 'dec') setInputValue(input, cur - 1);
    });
  });

  document.querySelectorAll('.mini-item .qty-input').forEach((input) => {
    input.addEventListener('input', () => {
      const v = Number(input.value || 0);
      setInputValue(input, v);
    });
  });

  // Add buttons (just focus the qty input and recompute)
  document.querySelectorAll('.add-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const miniItem = btn.closest('.mini-item');
      const input = miniItem?.querySelector('.qty-input');
      if (input) setInputValue(input, Number(input.value || 0) + 1);
      btn.blur();
    });
  });

  // Confirm order button (your existing bottom button)
  const confirmBtn = document.getElementById('confirm-order');
  confirmBtn?.addEventListener('click', () => {
    const { total, count } = readCart();
    if (count === 0) {
      alert('Add at least one item first.');
      return;
    }
    alert(`Added to order! Estimated total: ${toMoney(total)}`);
    if (window.ORDER_URL) window.location.href = window.ORDER_URL;
  });

  // Initial render
  computeOrderTotals();
});
