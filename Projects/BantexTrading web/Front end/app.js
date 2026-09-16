// Bantex Trading — shared data & interactions

const PRODUCTS = {
  pen: {
    name: "Ballpoint Pen",
    category: "Stationery",
    price: "Rs. 60",
    slug: "pen",
    tagline: "A reliable everyday pen",
    description: "A smooth-writing ballpoint pen built for daily use — at home, at school, or at the office. Simple, dependable, and always within reach.",
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585336455962-9a0f6d5f8b2a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1587145820266-1a7a2c0bbf27?q=80&w=800&auto=format&fit=crop"
    ],
    specs: [
      ["Type", "Ballpoint Pen"],
      ["Category", "Stationery"],
      ["Ink Colour", "Blue / Black"],
      ["Availability", "In Stock"]
    ],
    badge: "In Stock"
  },
  calculator: {
    name: "Calculator",
    category: "Electrical Goods",
    price: "Rs. 850",
    slug: "calculator",
    tagline: "A dependable desktop and office calculator",
    description: "A straightforward calculator suited for everyday office, retail, and home use. Clear display, responsive keys, and a compact footprint for any desk.",
    image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop"
    ],
    specs: [
      ["Type", "Desktop Calculator"],
      ["Category", "Electrical Goods"],
      ["Power", "Battery / Solar"],
      ["Availability", "In Stock"]
    ],
    badge: "In Stock"
  },
  charger: {
    name: "Charger",
    category: "Electrical Goods",
    price: "Rs. 950",
    slug: "charger",
    tagline: "A dependable everyday charger",
    description: "A practical charger for everyday devices. Compact, reliable, and built for regular use at home or on the go.",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583863788176-1c8c534d1c53?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591290619762-c05674c1fda9?q=80&w=800&auto=format&fit=crop"
    ],
    specs: [
      ["Type", "Charger"],
      ["Category", "Electrical Goods"],
      ["Cable", "Included"],
      ["Availability", "In Stock"]
    ],
    badge: "In Stock"
  }
};

function productLinkPrefix(){
  return location.pathname.includes('/products/') ? '' : 'products/';
}

function productCardHTML(p, opts){
  opts = opts || {};
  return `
    <a class="product-card reveal" href="${productLinkPrefix()}${p.slug}.html">
      <div class="product-media">
        ${opts.badge !== false ? `<span class="product-badge">${p.badge}</span>` : ''}
        <img src="${p.image}" alt="${p.name}" loading="lazy"/>
        <button class="product-quickadd" aria-label="Quick view" tabindex="-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
      <div class="product-info">
        <div>
          <h4>${p.name}</h4>
          <span class="cat">${p.category}</span>
        </div>
        <span class="product-price">${p.price}</span>
      </div>
    </a>`;
}

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav drawer
  const menuToggle = document.getElementById('menuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  if(menuToggle && mobileDrawer){
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
    });
    mobileDrawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Reveal-on-scroll
  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Populate any product grids present on the page
  document.querySelectorAll('[data-product-grid]').forEach(grid => {
    const list = grid.getAttribute('data-product-grid').split(',').map(s => s.trim());
    grid.innerHTML = list.map(key => productCardHTML(PRODUCTS[key])).join('');
    // re-observe newly added reveal elements
    grid.querySelectorAll('.reveal').forEach(el => {
      requestAnimationFrame(() => el.classList.add('in'));
    });
  });

  // Product detail thumbnail switcher
  document.querySelectorAll('.pdp-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const src = thumb.getAttribute('data-src');
      const main = document.querySelector('.pdp-gallery-main img');
      if(main && src) main.src = src;
      document.querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  // Add to cart / order now — visual only for this frontend phase
  document.querySelectorAll('[data-action="add-to-cart"], [data-action="order-now"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const original = btn.textContent;
      btn.textContent = btn.dataset.action === 'add-to-cart' ? 'Added ✓' : 'Order Received ✓';
      btn.style.pointerEvents = 'none';
      setTimeout(() => {
        btn.textContent = original;
        btn.style.pointerEvents = '';
      }, 1600);
    });
  });
});
