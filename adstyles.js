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
