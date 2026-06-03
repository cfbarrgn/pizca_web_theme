/* ============================================================
   PIZCA THEME — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  // ── Sticky header shadow ──────────────────────────────────
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // ── Scroll reveal ─────────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ── Smooth scroll for anchor links ───────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Product page: image gallery ──────────────────────────
  const thumbs = document.querySelectorAll('.thumb');
  const galleryItems = document.querySelectorAll('.product-gallery-item');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const index = thumb.dataset.index;
      thumbs.forEach(t => t.classList.remove('active'));
      galleryItems.forEach(g => g.classList.remove('active'));
      thumb.classList.add('active');
      const target = document.querySelector(`.product-gallery-item[data-index="${index}"]`);
      if (target) target.classList.add('active');
    });
  });

  // ── Product page: variant selector ───────────────────────
  const variantBtns = document.querySelectorAll('.variant-btn');
  const variantIdInput = document.getElementById('variant-id');

  if (variantBtns.length && variantIdInput) {
    // Store variants data from Shopify (injected via global)
    variantBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const optionIndex = btn.dataset.optionIndex;
        // Deactivate siblings in same group
        document.querySelectorAll(`.variant-btn[data-option-index="${optionIndex}"]`)
          .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Find matching variant from global shopifyVariants (set in product section)
        if (window.shopifyVariants) {
          const selectedOptions = [];
          document.querySelectorAll('.variant-options').forEach((group, i) => {
            const active = group.querySelector('.variant-btn.active');
            if (active) selectedOptions[i] = active.dataset.value;
          });

          const match = window.shopifyVariants.find(v =>
            v.options.every((opt, i) => opt === selectedOptions[i])
          );

          if (match) {
            variantIdInput.value = match.id;
            const addBtn = document.querySelector('.btn-add-to-cart');
            if (addBtn) {
              addBtn.textContent = match.available ? 'Add to Cart' : 'Sold Out';
              addBtn.disabled = !match.available;
            }
          }
        }
      });
    });
  }

  // ── Cart: quantity buttons ────────────────────────────────
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const line = btn.dataset.line;
      const change = parseInt(btn.dataset.change, 10);
      const input = document.querySelector(`.qty-input[data-index="${line}"]`);
      if (input) {
        const newVal = Math.max(0, parseInt(input.value, 10) + change);
        input.value = newVal;
      }
    });
  });

  // ── Quick-add AJAX cart ───────────────────────────────────
  document.querySelectorAll('.quick-add-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.product-quick-add');
      const original = btn.textContent;
      btn.textContent = 'Adding...';

      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            id: form.querySelector('input[name="id"]').value,
            quantity: 1
          })
        });

        if (res.ok) {
          btn.textContent = '✓ Added!';
          // Update cart count in header
          const cartRes = await fetch('/cart.js');
          const cart = await cartRes.json();
          const countEl = document.querySelector('.cart-count');
          if (countEl) {
            countEl.textContent = cart.item_count;
            countEl.style.display = cart.item_count > 0 ? 'flex' : 'none';
          }
          setTimeout(() => { btn.textContent = original; }, 2000);
        } else {
          btn.textContent = 'Error — try again';
          setTimeout(() => { btn.textContent = original; }, 2000);
        }
      } catch {
        btn.textContent = 'Error — try again';
        setTimeout(() => { btn.textContent = original; }, 2000);
      }
    });
  });

})();
