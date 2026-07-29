// Komorebi Cafe - Showcase Application & Authentication UI Logic

import { CAFE_INFO, MENU_CATEGORIES, MENU_ITEMS } from "./data.js";
import { authInstance } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  let activeCategory = "all";
  let searchQuery = "";
  let resendCountdownTimer = null;

  // DOM Elements
  const menuGrid = document.getElementById("menu-grid");
  const categoryContainer = document.getElementById("menu-categories");
  const searchInput = document.getElementById("search-input");
  const statusBadge = document.getElementById("status-badge");
  const heroWhatsAppBtn = document.getElementById("hero-whatsapp-btn");
  const floatingWhatsAppBtn = document.getElementById("floating-whatsapp-btn");
  const contactWhatsAppBtn = document.getElementById("contact-whatsapp-btn");

  // Auth DOM Elements
  const authNavContainer = document.getElementById("auth-nav-container");
  const openAuthBtn = document.getElementById("open-auth-btn");
  const userProfileMenu = document.getElementById("user-profile-menu");
  const menuUserAvatar = document.getElementById("menu-user-avatar");
  const menuUserName = document.getElementById("menu-user-name");
  const menuUserDetail = document.getElementById("menu-user-detail");
  const authLogoutBtn = document.getElementById("auth-logout-btn");

  // Auth Modal DOM Elements
  const authModal = document.getElementById("auth-modal");
  const closeAuthModalBtn = document.getElementById("close-auth-modal");
  const tabGoogleBtn = document.getElementById("tab-google-btn");
  const tabPhoneBtn = document.getElementById("tab-phone-btn");
  const panelGoogle = document.getElementById("panel-google");
  const panelPhone = document.getElementById("panel-phone");
  const authAlert = document.getElementById("auth-alert");

  // Google Demo Buttons
  const googleDemoBtn1 = document.getElementById("google-demo-btn-1");
  const googleDemoBtn2 = document.getElementById("google-demo-btn-2");

  // Phone Auth DOM Elements
  const phoneStep1Form = document.getElementById("phone-step-1-form");
  const phoneStep2Form = document.getElementById("phone-step-2-form");
  const countryCodeSelect = document.getElementById("country-code-select");
  const phoneNumberInput = document.getElementById("phone-number-input");
  const sentPhoneDisplay = document.getElementById("sent-phone-display");
  const demoOtpCodeDisplay = document.getElementById("demo-otp-code");
  const otpDigitInputs = document.querySelectorAll(".otp-digit-input");
  const resendOtpBtn = document.getElementById("resend-otp-btn");
  const resendTimerCount = document.getElementById("resend-timer-count");
  const changePhoneBtn = document.getElementById("change-phone-btn");

  init();

  function init() {
    renderCategoryTabs();
    renderMenuItems();
    updateLiveStoreStatus();
    setupWhatsAppLinks();

    // Authentication Setup
    renderAuthNav();
    setupAuthEventListeners();

    // Init Google Identity Services SDK if available
    authInstance.initGoogleAuth((user) => {
      showAlert(`Welcome back, ${user.name}! 🌿`, "success");
      setTimeout(() => hideAuthModal(), 800);
    });
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

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

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
      heroWhatsAppBtn.rel = "noopener noreferrer";
    }

    if (floatingWhatsAppBtn) {
      floatingWhatsAppBtn.href = buildWhatsAppUrl(generalMsg);
      floatingWhatsAppBtn.target = "_blank";
      floatingWhatsAppBtn.rel = "noopener noreferrer";
    }

    if (contactWhatsAppBtn) {
      contactWhatsAppBtn.href = buildWhatsAppUrl(eventMsg);
      contactWhatsAppBtn.target = "_blank";
      contactWhatsAppBtn.rel = "noopener noreferrer";
    }
  }

  function renderCategoryTabs() {
    if (!categoryContainer) return;
    categoryContainer.innerHTML = MENU_CATEGORIES.map(cat => `
      <button 
        class="category-tab ${cat.id === activeCategory ? 'active' : ''}" 
        data-category="${escapeHtml(cat.id)}"
      >
        <span>${escapeHtml(cat.icon)}</span> ${escapeHtml(cat.name)}
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

    const cleanQuery = searchQuery.trim().toLowerCase();

    const filtered = MENU_ITEMS.filter(item => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(cleanQuery) || 
                            item.description.toLowerCase().includes(cleanQuery);
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      const safeQuery = escapeHtml(searchQuery);
      menuGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-secondary);">
          <p style="font-size: 1.2rem; margin-bottom: 8px;">No items match "${safeQuery}"</p>
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
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)} - Komorebi Cafe Menu" loading="lazy" />
            <div class="card-badge-container">
              ${item.tags.map(tag => `<span class="card-badge">${escapeHtml(tag)}</span>`).join('')}
            </div>
          </div>
          <div class="card-content">
            <div class="card-header">
              <h3 class="card-title">${escapeHtml(item.name)}</h3>
              <span class="card-price">$${item.price.toFixed(2)}</span>
            </div>
            <p class="card-desc">${escapeHtml(item.description)}</p>
            <p class="card-highlight">✨ ${escapeHtml(item.highlights)}</p>
            <div class="card-footer">
              <span style="font-size: 0.78rem; color: var(--text-light);">Showcase Item</span>
              <a href="${itemWaUrl}" target="_blank" rel="noopener noreferrer" class="whatsapp-ask-btn">
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
      searchQuery = e.target.value;
      renderMenuItems();
    });
  }

  // -------------------------------------------------------------
  // 4. AUTHENTICATION SYSTEM CONTROLLERS
  // -------------------------------------------------------------

  // Render Header Auth Button vs Signed-in Dropdown Menu
  function renderAuthNav() {
    const user = authInstance.getUser();

    if (!user) {
      // Signed Out State
      authNavContainer.innerHTML = `
        <button id="open-auth-btn" class="btn btn-account" type="button">
          <svg class="account-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Log In</span>
        </button>
      `;

      document.getElementById("open-auth-btn").addEventListener("click", showAuthModal);
    } else {
      // Signed In State
      const displayName = escapeHtml(user.name || user.phone || "Account");
      const userDetail = escapeHtml(user.email || user.phone || "Signed in");

      authNavContainer.innerHTML = `
        <button id="user-profile-btn" class="user-avatar-btn" type="button" aria-expanded="false">
          <img src="${escapeHtml(user.avatar)}" alt="${displayName}" class="user-header-avatar" />
          <span class="user-header-name">${displayName}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        <div id="user-profile-menu" class="user-dropdown-menu hidden">
          <div class="user-menu-header">
            <img src="${escapeHtml(user.avatar)}" alt="${displayName}" class="menu-avatar" />
            <div class="user-menu-info">
              <h5>${displayName}</h5>
              <p>${userDetail}</p>
            </div>
          </div>
          <div class="user-menu-divider"></div>
          <ul class="user-menu-list">
            <li><a href="#menu" id="menu-view-favorites"><span>🍵</span> Saved Menu Items</a></li>
            <li><a href="#contact" id="menu-contact"><span>📍</span> Cafe Reservations</a></li>
            <li class="logout-item"><button type="button" id="auth-logout-btn"><span>🚪</span> Sign Out</button></li>
          </ul>
        </div>
      `;

      const userProfileBtn = document.getElementById("user-profile-btn");
      const dropdownMenu = document.getElementById("user-profile-menu");
      const logoutBtn = document.getElementById("auth-logout-btn");

      userProfileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isHidden = dropdownMenu.classList.contains("hidden");
        dropdownMenu.classList.toggle("hidden", !isHidden);
        userProfileBtn.setAttribute("aria-expanded", isHidden ? "true" : "false");
      });

      logoutBtn.addEventListener("click", () => {
        authInstance.logout();
        showAlert("Logged out successfully.", "success");
      });

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!authNavContainer.contains(e.target)) {
          dropdownMenu.classList.add("hidden");
          userProfileBtn.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  // Global Auth Event Handlers
  function setupAuthEventListeners() {
    // Listen for auth state changes
    window.addEventListener("auth:change", () => {
      renderAuthNav();
    });

    // Close Auth Modal
    if (closeAuthModalBtn) {
      closeAuthModalBtn.addEventListener("click", hideAuthModal);
    }

    if (authModal) {
      authModal.addEventListener("click", (e) => {
        if (e.target === authModal) hideAuthModal();
      });
    }

    // Modal Tab Switching
    if (tabGoogleBtn && tabPhoneBtn) {
      tabGoogleBtn.addEventListener("click", () => switchAuthTab("google"));
      tabPhoneBtn.addEventListener("click", () => switchAuthTab("phone"));
    }

    // Google Demo Logins
    if (googleDemoBtn1) {
      googleDemoBtn1.addEventListener("click", () => {
        const user = authInstance.loginWithGoogleDemo(0);
        showAlert(`Signed in as ${user.name}! 🌿`, "success");
        setTimeout(() => hideAuthModal(), 600);
      });
    }

    if (googleDemoBtn2) {
      googleDemoBtn2.addEventListener("click", () => {
        const user = authInstance.loginWithGoogleDemo(1);
        showAlert(`Signed in as ${user.name}! 🌿`, "success");
        setTimeout(() => hideAuthModal(), 600);
      });
    }

    // Phone Auth Step 1 - Send OTP
    if (phoneStep1Form) {
      phoneStep1Form.addEventListener("submit", (e) => {
        e.preventDefault();
        const country = countryCodeSelect.value;
        const phone = phoneNumberInput.value;

        try {
          const result = authInstance.sendPhoneOTP(country, phone);
          sentPhoneDisplay.innerText = result.phone;
          demoOtpCodeDisplay.innerText = result.otpDemo;

          phoneStep1Form.classList.add("hidden");
          phoneStep2Form.classList.remove("hidden");
          clearOTPInputs();
          startResendCountdown(60);
          showAlert(`OTP code sent to ${result.phone}`, "success");
        } catch (err) {
          showAlert(err.message, "error");
        }
      });
    }

    // OTP Inputs Auto-advance Focus & Keyboard handling
    otpDigitInputs.forEach((input, idx) => {
      input.addEventListener("input", (e) => {
        const val = e.target.value;
        if (val.length === 1 && idx < otpDigitInputs.length - 1) {
          otpDigitInputs[idx + 1].focus();
        }
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !input.value && idx > 0) {
          otpDigitInputs[idx - 1].focus();
        }
      });

      // Handle paste
      input.addEventListener("paste", (e) => {
        e.preventDefault();
        const pasteData = (e.clipboardData || window.clipboardData).getData("text").trim();
        if (/^\d{6}$/.test(pasteData)) {
          pasteData.split("").forEach((char, i) => {
            if (otpDigitInputs[i]) otpDigitInputs[i].value = char;
          });
          otpDigitInputs[5].focus();
        }
      });
    });

    // Phone Auth Step 2 - Verify OTP
    if (phoneStep2Form) {
      phoneStep2Form.addEventListener("submit", (e) => {
        e.preventDefault();
        const code = Array.from(otpDigitInputs).map(i => i.value).join("");

        if (code.length !== 6) {
          showAlert("Please enter all 6 digits of the OTP code.", "error");
          return;
        }

        try {
          const user = authInstance.verifyPhoneOTP(code);
          showAlert(`Phone verified! Welcome ${user.phone} ☕`, "success");
          setTimeout(() => hideAuthModal(), 700);
        } catch (err) {
          showAlert(err.message, "error");
        }
      });
    }

    // Resend OTP button
    if (resendOtpBtn) {
      resendOtpBtn.addEventListener("click", () => {
        if (resendOtpBtn.disabled) return;
        const country = countryCodeSelect.value;
        const phone = phoneNumberInput.value;
        try {
          const result = authInstance.sendPhoneOTP(country, phone);
          demoOtpCodeDisplay.innerText = result.otpDemo;
          clearOTPInputs();
          startResendCountdown(60);
          showAlert(`New OTP code sent to ${result.phone}`, "success");
        } catch (err) {
          showAlert(err.message, "error");
        }
      });
    }

    // Change Phone Number button
    if (changePhoneBtn) {
      changePhoneBtn.addEventListener("click", () => {
        phoneStep2Form.classList.add("hidden");
        phoneStep1Form.classList.remove("hidden");
        clearInterval(resendCountdownTimer);
        hideAlert();
      });
    }
  }

  // Auth UI Helpers
  function showAuthModal() {
    authModal.classList.remove("hidden");
    authModal.setAttribute("aria-hidden", "false");
    switchAuthTab("google");
    hideAlert();
  }

  function hideAuthModal() {
    authModal.classList.add("hidden");
    authModal.setAttribute("aria-hidden", "true");
    phoneStep2Form.classList.add("hidden");
    phoneStep1Form.classList.remove("hidden");
    clearInterval(resendCountdownTimer);
    clearOTPInputs();
    hideAlert();
  }

  function switchAuthTab(tab) {
    if (tab === "google") {
      tabGoogleBtn.classList.add("active");
      tabPhoneBtn.classList.remove("active");
      panelGoogle.classList.remove("hidden");
      panelPhone.classList.add("hidden");
    } else {
      tabPhoneBtn.classList.add("active");
      tabGoogleBtn.classList.remove("active");
      panelPhone.classList.remove("hidden");
      panelGoogle.classList.add("hidden");
    }
    hideAlert();
  }

  function clearOTPInputs() {
    otpDigitInputs.forEach(i => i.value = "");
    if (otpDigitInputs[0]) otpDigitInputs[0].focus();
  }

  function startResendCountdown(seconds) {
    clearInterval(resendCountdownTimer);
    let remaining = seconds;
    resendOtpBtn.disabled = true;
    resendTimerCount.innerText = remaining;

    resendCountdownTimer = setInterval(() => {
      remaining--;
      resendTimerCount.innerText = remaining;
      if (remaining <= 0) {
        clearInterval(resendCountdownTimer);
        resendOtpBtn.disabled = false;
        resendOtpBtn.innerHTML = `Resend OTP Code`;
      }
    }, 1000);
  }

  function showAlert(msg, type = "error") {
    authAlert.innerText = msg;
    authAlert.className = `auth-alert ${type}`;
    authAlert.classList.remove("hidden");
  }

  function hideAlert() {
    authAlert.innerText = "";
    authAlert.className = "auth-alert hidden";
  }
});
