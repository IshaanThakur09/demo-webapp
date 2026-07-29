// Komorebi Cafe - Showcase Application Logic

document.addEventListener("DOMContentLoaded", () => {
  let activeCategory = "all";
  let searchQuery = "";

  const menuGrid = document.getElementById("menu-grid");
  const categoryContainer = document.getElementById("menu-categories");
  const searchInput = document.getElementById("search-input");
  const statusBadge = document.getElementById("status-badge");
  const heroWhatsAppBtn = document.getElementById("hero-whatsapp-btn");
  const floatingWhatsAppBtn = document.getElementById("floating-whatsapp-btn");
  const contactWhatsAppBtn = document.getElementById("contact-whatsapp-btn");

  init();

  function init() {
    renderCategoryTabs();
    renderMenuItems();
    updateLiveStoreStatus();
    setupWhatsAppLinks();
  }

  // -------------------------------------------------------------
  // 1. Live Store Hours Status
  // -------------------------------------------------------------
  function updateLiveStoreStatus() {
    if (!statusBadge) return;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const openTimeInMinutes = CAFE_INFO.hours.openHour * 60 + CAFE_INFO.hours.openMinute;
    const closeTimeInMinutes = CAFE_INFO.hours.closeHour * 60 + CAFE_INFO.hours.closeMinute;

    const isOpen = currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;

    if (isOpen) {
      statusBadge.innerHTML = `
        <span class="status-dot"></span>
        <span>Open Today • ${CAFE_INFO.hours.weekday}</span>
      `;
    } else {
      statusBadge.innerHTML = `
        <span class="status-dot closed"></span>
        <span>Closed Now • Opens ${CAFE_INFO.hours.openHour}:${CAFE_INFO.hours.openMinute < 10 ? '0' : ''}${CAFE_INFO.hours.openMinute} AM</span>
      `;
    }
  }

  // -------------------------------------------------------------
  // 2. WhatsApp Pre-filled URL Generator
  // -------------------------------------------------------------
  function buildWhatsAppUrl(customText) {
    const encodedText = encodeURIComponent(customText);
    return `https://wa.me/${CAFE_INFO.whatsappNumber}?text=${encodedText}`;
  }

  function setupWhatsAppLinks() {
    const generalMsg = `Hi Komorebi Cafe! 🌿 I came across your website and would love to ask a question about your menu and hours.`;
    const eventMsg = `Hi Komorebi Cafe! ☕ I'd like to ask about reserving a table or hosting a private event with you!`;

    if (heroWhatsAppBtn) {
      heroWhatsAppBtn.href = buildWhatsAppUrl(generalMsg);
      heroWhatsAppBtn.target = "_blank";
    }

    if (floatingWhatsAppBtn) {
      floatingWhatsAppBtn.href = buildWhatsAppUrl(generalMsg);
      floatingWhatsAppBtn.target = "_blank";
    }

    if (contactWhatsAppBtn) {
      contactWhatsAppBtn.href = buildWhatsAppUrl(eventMsg);
      contactWhatsAppBtn.target = "_blank";
    }
  }

  // -------------------------------------------------------------
  // 3. Showcase Menu Rendering & Filtering
  // -------------------------------------------------------------
  function renderCategoryTabs() {
    if (!categoryContainer) return;
    categoryContainer.innerHTML = MENU_CATEGORIES.map(cat => `
      <button 
        class="category-tab ${cat.id === activeCategory ? 'active' : ''}" 
        data-category="${cat.id}"
      >
        <span>${cat.icon}</span> ${cat.name}
      </button>
    `).join("");

    categoryContainer.querySelectorAll(".category-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        activeCategory = tab.dataset.category;
        categoryContainer.querySelectorAll(".category-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        renderMenuItems();
      });
    });
  }

  function renderMenuItems() {
    if (!menuGrid) return;

    const filtered = MENU_ITEMS.filter(item => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      menuGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-secondary);">
          <p style="font-size: 1.2rem; margin-bottom: 8px;">No items match "${searchQuery}"</p>
          <p style="font-size: 0.9rem;">Explore our other categories or ask us directly on WhatsApp!</p>
        </div>
      `;
      return;
    }

    menuGrid.innerHTML = filtered.map(item => {
      const itemWaMsg = `Hi Komorebi Cafe! 🌿 I saw the "${item.name}" on your website and would love to ask about availability/details.`;
      const itemWaUrl = buildWhatsAppUrl(itemWaMsg);

      return `
        <div class="menu-card">
          <div class="card-img-wrapper">
            <img src="${item.image}" alt="${item.name} - Komorebi Cafe Menu" loading="lazy" />
            <div class="card-badge-container">
              ${item.tags.map(tag => `<span class="card-badge">${tag}</span>`).join('')}
            </div>
          </div>
          <div class="card-content">
            <div class="card-header">
              <h3 class="card-title">${item.name}</h3>
              <span class="card-price">$${item.price.toFixed(2)}</span>
            </div>
            <p class="card-desc">${item.description}</p>
            <p class="card-highlight">✨ ${item.highlights}</p>
            <div class="card-footer">
              <span style="font-size: 0.78rem; color: var(--text-light);">Showcase Item</span>
              <a href="${itemWaUrl}" target="_blank" class="whatsapp-ask-btn">
                Ask on WhatsApp 💬
              </a>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      renderMenuItems();
    });
  }
});
