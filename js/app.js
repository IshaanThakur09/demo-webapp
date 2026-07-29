// Komorebi Cafe - Showcase Application & Functional Authentication UI Logic

import { CAFE_INFO, MENU_CATEGORIES, MENU_ITEMS } from "./data.js";
import { authInstance } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  let activeCategory = "all";
  let searchQuery = "";
  let resendCountdownTimer = null;
  let isSignUpMode = false; // Email auth form state

  // DOM Elements
  const menuGrid = document.getElementById("menu-grid");
  const categoryContainer = document.getElementById("menu-categories");
  const searchInput = document.getElementById("search-input");
  const statusBadge = document.getElementById("status-badge");
  const heroWhatsAppBtn = document.getElementById("hero-whatsapp-btn");
  const floatingWhatsAppBtn = document.getElementById("floating-whatsapp-btn");
  const contactWhatsAppBtn = document.getElementById("contact-whatsapp-btn");

  // Auth Nav DOM Elements
  const authNavContainer = document.getElementById("auth-nav-container");

  // Auth Modal DOM Elements
  const authModal = document.getElementById("auth-modal");
  const closeAuthModalBtn = document.getElementById("close-auth-modal");
  const tabEmailBtn = document.getElementById("tab-email-btn");
  const tabGoogleBtn = document.getElementById("tab-google-btn");
  const tabPhoneBtn = document.getElementById("tab-phone-btn");
  const panelEmail = document.getElementById("panel-email");
  const panelGoogle = document.getElementById("panel-google");
  const panelPhone = document.getElementById("panel-phone");
  const authAlert = document.getElementById("auth-alert");

  // Email Auth DOM Elements
  const emailAuthForm = document.getElementById("email-auth-form");
  const emailFormSubtitle = document.getElementById("email-form-subtitle");
  const signupNameGroup = document.getElementById("signup-name-group");
  const emailNameInput = document.getElementById("email-name-input");
  const emailAddressInput = document.getElementById("email-address-input");
  const emailPasswordInput = document.getElementById("email-password-input");
  const togglePasswordBtn = document.getElementById("toggle-password-btn");
  const emailSubmitBtn = document.getElementById("email-submit-btn");
  const emailTogglePrompt = document.getElementById("email-toggle-prompt");
  const toggleAuthModeBtn = document.getElementById("toggle-auth-mode-btn");

  // Google Auth DOM Elements
  const toggleClientIdConfigBtn = document.getElementById("toggle-client-id-config");
  const clientIdInputBox = document.getElementById("client-id-input-box");
  const googleClientIdInput = document.getElementById("google-client-id-input");
  const saveClientIdBtn = document.getElementById("save-client-id-btn");

  // Phone Auth DOM Elements
  const phoneStep1Form = document.getElementById("phone-step-1-form");
  const phoneStep2Form = document.getElementById("phone-step-2-form");
  const countryCodeSelect = document.getElementById("country-code-select");
  const phoneNumberInput = document.getElementById("phone-number-input");
  const sentPhoneDisplay = document.getElementById("sent-phone-display");
  const otpDigitInputs = document.querySelectorAll(".otp-digit-input");
  const resendOtpBtn = document.getElementById("resend-otp-btn");
  const resendTimerCount = document.getElementById("resend-timer-count");
  const changePhoneBtn = document.getElementById("change-phone-btn");

  // Profile Modal DOM Elements
  const profileModal = document.getElementById("profile-modal");
  const closeProfileModalBtn = document.getElementById("close-profile-modal");
  const profileAvatarDisplay = document.getElementById("profile-avatar-display");
  const profileNameDisplay = document.getElementById("profile-name-display");
  const profileDetailDisplay = document.getElementById("profile-detail-display");
  const profileProviderBadge = document.getElementById("profile-provider-badge");
  const favoritesCountBadge = document.getElementById("favorites-count-badge");
  const favoritesItemsList = document.getElementById("favorites-items-list");
  const updateProfileForm = document.getElementById("update-profile-form");
  const updateNameInput = document.getElementById("update-name-input");

  // Toast Container
  const toastContainer = document.getElementById("toast-container");

  init();

  function init() {
    renderCategoryTabs();
    renderMenuItems();
    updateLiveStoreStatus();
    setupWhatsAppLinks();

    // Authentication Setup
    renderAuthNav();
    setupAuthEventListeners();
    setupProfileEventListeners();

    // Listen for SMS OTP notifications
    window.addEventListener("auth:sms_sent", (e) => {
      showToast(`📲 SMS Sent to ${e.detail.phone}! Verification Code: ${e.detail.code}`, "info", 8000);
    });

    // Init Google Identity Services SDK if configured
    authInstance.initGoogleAuth((user) => {
      showToast(`Welcome back, ${user.name}! 🌿`, "success");
      setTimeout(() => hideAuthModal(), 800);
    });
  }

  // -------------------------------------------------------------
  // 1. Live Store Hours & WhatsApp Integration
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

  // -------------------------------------------------------------
  // 2. Menu Rendering & Favorites Management
  // -------------------------------------------------------------
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
      const isFav = authInstance.isFavorite(item.id);

      return `
        <div class="menu-card" data-id="${escapeHtml(item.id)}">
          <div class="card-img-wrapper">
            <button type="button" class="favorite-toggle-btn ${isFav ? 'active' : ''}" data-item-id="${escapeHtml(item.id)}" title="${isFav ? 'Remove from favorites' : 'Save to favorites'}">
              ${isFav ? '❤️' : '🤍'}
            </button>
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

    // Attach favorite heart button click listeners
    menuGrid.querySelectorAll(".favorite-toggle-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const itemId = btn.dataset.itemId;
        if (!authInstance.isAuthenticated()) {
          showAuthModal();
          showAlert("Please log in to save menu favorites.", "error");
          return;
        }

        try {
          const favorites = authInstance.toggleFavorite(itemId);
          const nowFav = favorites.includes(itemId);
          btn.innerHTML = nowFav ? '❤️' : '🤍';
          btn.classList.toggle("active", nowFav);
          showToast(nowFav ? "Saved item to your favorites! ❤️" : "Removed item from favorites.", "success");
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderMenuItems();
    });
  }

  // -------------------------------------------------------------
  // 3. AUTHENTICATION UI CONTROLLERS
  // -------------------------------------------------------------

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
            <li><button type="button" id="menu-view-favorites"><span>🍵</span> Account & Saved Items</button></li>
            <li><a href="#contact" id="menu-contact"><span>📍</span> Cafe Reservations</a></li>
            <li class="logout-item"><button type="button" id="auth-logout-btn"><span>🚪</span> Sign Out</button></li>
          </ul>
        </div>
      `;

      const userProfileBtn = document.getElementById("user-profile-btn");
      const dropdownMenu = document.getElementById("user-profile-menu");
      const viewFavoritesBtn = document.getElementById("menu-view-favorites");
      const logoutBtn = document.getElementById("auth-logout-btn");

      userProfileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isHidden = dropdownMenu.classList.contains("hidden");
        dropdownMenu.classList.toggle("hidden", !isHidden);
        userProfileBtn.setAttribute("aria-expanded", isHidden ? "true" : "false");
      });

      if (viewFavoritesBtn) {
        viewFavoritesBtn.addEventListener("click", () => {
          dropdownMenu.classList.add("hidden");
          showProfileModal();
        });
      }

      logoutBtn.addEventListener("click", () => {
        authInstance.logout();
        showToast("Logged out successfully.", "info");
      });

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!authNavContainer.contains(e.target)) {
          dropdownMenu.classList.add("hidden");
          userProfileBtn.setAttribute("aria-expanded", "false");
        }
      });
    }

    // Re-render menu grid to update favorite hearts
    renderMenuItems();
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

    // Tab Switching
    if (tabEmailBtn && tabGoogleBtn && tabPhoneBtn) {
      tabEmailBtn.addEventListener("click", () => switchAuthTab("email"));
      tabGoogleBtn.addEventListener("click", () => switchAuthTab("google"));
      tabPhoneBtn.addEventListener("click", () => switchAuthTab("phone"));
    }

    // Password Toggle
    if (togglePasswordBtn && emailPasswordInput) {
      togglePasswordBtn.addEventListener("click", () => {
        const isPassword = emailPasswordInput.type === "password";
        emailPasswordInput.type = isPassword ? "text" : "password";
        togglePasswordBtn.innerText = isPassword ? "🙈" : "👁️";
      });
    }

    // Email Sign In vs Sign Up Toggle
    if (toggleAuthModeBtn) {
      toggleAuthModeBtn.addEventListener("click", () => {
        isSignUpMode = !isSignUpMode;
        if (isSignUpMode) {
          signupNameGroup.classList.remove("hidden");
          emailFormSubtitle.innerText = "Create a new account with your email and password";
          emailSubmitBtn.innerText = "Create Account 🌱";
          emailTogglePrompt.innerText = "Already have an account?";
          toggleAuthModeBtn.innerText = "Sign In";
        } else {
          signupNameGroup.classList.add("hidden");
          emailFormSubtitle.innerText = "Sign in with your registered email and password";
          emailSubmitBtn.innerText = "Sign In 🌿";
          emailTogglePrompt.innerText = "Don't have an account yet?";
          toggleAuthModeBtn.innerText = "Create an Account";
        }
        hideAlert();
      });
    }

    // Email Auth Form Submit
    if (emailAuthForm) {
      emailAuthForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = emailAddressInput.value;
        const password = emailPasswordInput.value;
        const name = emailNameInput.value;

        emailSubmitBtn.disabled = true;
        emailSubmitBtn.innerText = "Processing...";

        try {
          if (isSignUpMode) {
            const user = await authInstance.registerWithEmail({ name, email, password });
            showToast(`Account created successfully! Welcome, ${user.name} 🌱`, "success");
          } else {
            const user = await authInstance.loginWithEmail(email, password);
            showToast(`Welcome back, ${user.name}! 🌿`, "success");
          }
          setTimeout(() => hideAuthModal(), 600);
        } catch (err) {
          showAlert(err.message, "error");
        } finally {
          emailSubmitBtn.disabled = false;
          emailSubmitBtn.innerText = isSignUpMode ? "Create Account 🌱" : "Sign In 🌿";
        }
      });
    }

    // Google Client ID Settings Config Toggle
    if (toggleClientIdConfigBtn && clientIdInputBox) {
      toggleClientIdConfigBtn.addEventListener("click", () => {
        clientIdInputBox.classList.toggle("hidden");
        googleClientIdInput.value = authInstance.getGoogleClientId();
      });
    }

    if (saveClientIdBtn && googleClientIdInput) {
      saveClientIdBtn.addEventListener("click", () => {
        authInstance.setGoogleClientId(googleClientIdInput.value);
        showToast("Google Client ID updated successfully!", "success");
        clientIdInputBox.classList.add("hidden");
        authInstance.initGoogleAuth((user) => {
          showToast(`Welcome back, ${user.name}! 🌿`, "success");
          setTimeout(() => hideAuthModal(), 800);
        });
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

          phoneStep1Form.classList.add("hidden");
          phoneStep2Form.classList.remove("hidden");
          clearOTPInputs();
          startResendCountdown(60);
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
          showAlert("Please enter all 6 digits of the SMS code.", "error");
          return;
        }

        try {
          const user = authInstance.verifyPhoneOTP(code);
          showToast(`Phone verified! Welcome ${user.phone} ☕`, "success");
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
          authInstance.sendPhoneOTP(country, phone);
          clearOTPInputs();
          startResendCountdown(60);
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

  // -------------------------------------------------------------
  // 4. USER PROFILE MODAL CONTROLLERS
  // -------------------------------------------------------------
  function setupProfileEventListeners() {
    if (closeProfileModalBtn) {
      closeProfileModalBtn.addEventListener("click", hideProfileModal);
    }

    if (profileModal) {
      profileModal.addEventListener("click", (e) => {
        if (e.target === profileModal) hideProfileModal();
      });
    }

    if (updateProfileForm) {
      updateProfileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newName = updateNameInput.value.trim();
        if (newName) {
          authInstance.updateProfile({ name: newName });
          showToast("Profile name updated successfully!", "success");
          renderProfileData();
        }
      });
    }
  }

  function showProfileModal() {
    renderProfileData();
    profileModal.classList.remove("hidden");
    profileModal.setAttribute("aria-hidden", "false");
  }

  function hideProfileModal() {
    profileModal.classList.add("hidden");
    profileModal.setAttribute("aria-hidden", "true");
  }

  function renderProfileData() {
    const user = authInstance.getUser();
    if (!user) return;

    profileAvatarDisplay.src = user.avatar;
    profileNameDisplay.innerText = user.name || user.phone || "User Account";
    profileDetailDisplay.innerText = user.email || user.phone || "Signed in";
    profileProviderBadge.innerText = (user.provider || "Email").toUpperCase();
    updateNameInput.value = user.name || "";

    // Favorites List Rendering
    const favorites = Array.isArray(user.favorites) ? user.favorites : [];
    favoritesCountBadge.innerText = favorites.length;

    if (favorites.length === 0) {
      favoritesItemsList.innerHTML = `<p class="text-secondary text-sm">No saved items yet. Click the ❤️ icon on any menu item to save it!</p>`;
    } else {
      const favItems = MENU_ITEMS.filter(item => favorites.includes(item.id));
      favoritesItemsList.innerHTML = favItems.map(item => `
        <div class="favorite-card">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
          <div class="favorite-info">
            <h6>${escapeHtml(item.name)}</h6>
            <span>$${item.price.toFixed(2)}</span>
          </div>
        </div>
      `).join("");
    }
  }

  // -------------------------------------------------------------
  // 5. AUTH UI HELPERS & TOAST SYSTEM
  // -------------------------------------------------------------
  function showAuthModal() {
    authModal.classList.remove("hidden");
    authModal.setAttribute("aria-hidden", "false");
    switchAuthTab("email");
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
    tabEmailBtn.classList.toggle("active", tab === "email");
    tabGoogleBtn.classList.toggle("active", tab === "google");
    tabPhoneBtn.classList.toggle("active", tab === "phone");

    panelEmail.classList.toggle("hidden", tab !== "email");
    panelGoogle.classList.toggle("hidden", tab !== "google");
    panelPhone.classList.toggle("hidden", tab !== "phone");

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
        resendOtpBtn.innerHTML = `Resend Code`;
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

  function showToast(msg, type = "success", duration = 4000) {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${msg}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
});
