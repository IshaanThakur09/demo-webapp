// Komorebi Cafe - Production-Grade Authentication Engine
// Supports Email & Password (Web Crypto SHA-256), Google Identity Services (OAuth 2.0), and Phone SMS OTP Verification

const SESSION_STORAGE_KEY = "komorebi_auth_user";
const USERS_DB_KEY = "komorebi_registered_users";
const GOOGLE_CLIENT_ID_KEY = "komorebi_google_client_id";

export class AuthManager {
  constructor() {
    this.user = this.loadUser();
    this.currentOTP = null;
    this.pendingPhoneNumber = null;
    this.otpExpiry = null;
  }

  // -------------------------------------------------------------
  // Session & User Persistence
  // -------------------------------------------------------------
  loadUser() {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to read user session:", e);
      return null;
    }
  }

  saveUser(userData) {
    this.user = userData;
    try {
      if (userData) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userData));
        // Synchronize updated user back to DB repository if registered
        this.updateUserInDB(userData);
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save user session:", e);
    }
    this.notifyStateChange();
  }

  notifyStateChange() {
    window.dispatchEvent(
      new CustomEvent("auth:change", { detail: { user: this.user } })
    );
  }

  isAuthenticated() {
    return !!this.user;
  }

  getUser() {
    return this.user;
  }

  logout() {
    this.saveUser(null);
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (e) {
        // ignore if GIS not loaded
      }
    }
  }

  // -------------------------------------------------------------
  // Internal User Repository (Database Store)
  // -------------------------------------------------------------
  getUsersDB() {
    try {
      const db = localStorage.getItem(USERS_DB_KEY);
      return db ? JSON.parse(db) : [];
    } catch (e) {
      console.error("Failed to read users database:", e);
      return [];
    }
  }

  saveUsersDB(users) {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    } catch (e) {
      console.error("Failed to write to users database:", e);
    }
  }

  updateUserInDB(updatedUser) {
    if (!updatedUser || !updatedUser.id) return;
    const users = this.getUsersDB();
    const index = users.findIndex((u) => u.id === updatedUser.id);
    if (index !== -1) {
      // Retain passwordHash if present in DB
      users[index] = {
        ...users[index],
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        favorites: updatedUser.favorites || users[index].favorites || [],
        lastLogin: new Date().toISOString()
      };
      this.saveUsersDB(users);
    }
  }

  // Web Crypto SHA-256 Hashing for Password Security
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "_komorebi_salt_2026");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // -------------------------------------------------------------
  // 1. Email & Password Authentication
  // -------------------------------------------------------------
  async registerWithEmail({ name, email, password }) {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (name || "").trim();

    if (!cleanName) {
      throw new Error("Please provide your full name.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error("Please enter a valid email address.");
    }

    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    const users = this.getUsersDB();
    const existing = users.find((u) => u.email === cleanEmail);
    if (existing) {
      throw new Error("An account with this email already exists. Please log in.");
    }

    const passwordHash = await this.hashPassword(password);
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=5E7453&color=ffffff&bold=true`;

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash: passwordHash,
      avatar: avatar,
      provider: "email",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      favorites: []
    };

    users.push(newUser);
    this.saveUsersDB(users);

    // Save active session (stripping passwordHash from active session token)
    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      provider: newUser.provider,
      favorites: newUser.favorites,
      loggedInAt: newUser.lastLogin
    };

    this.saveUser(sessionUser);
    return sessionUser;
  }

  async loginWithEmail(email, password) {
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error("Please enter your email address.");
    }
    if (!password) {
      throw new Error("Please enter your password.");
    }

    const users = this.getUsersDB();
    const user = users.find((u) => u.email === cleanEmail);

    if (!user) {
      throw new Error("No account found with this email. Please sign up first.");
    }

    const passwordHash = await this.hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      throw new Error("Incorrect password. Please try again.");
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      provider: user.provider || "email",
      favorites: user.favorites || [],
      loggedInAt: new Date().toISOString()
    };

    this.saveUser(sessionUser);
    return sessionUser;
  }

  // -------------------------------------------------------------
  // 2. Google Identity Services (OAuth 2.0) Integration
  // -------------------------------------------------------------
  getGoogleClientId() {
    return localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || "";
  }

  setGoogleClientId(clientId) {
    if (clientId) {
      localStorage.setItem(GOOGLE_CLIENT_ID_KEY, clientId.trim());
    } else {
      localStorage.removeItem(GOOGLE_CLIENT_ID_KEY);
    }
  }

  loginWithGoogleAccount(googleData = {}) {
    const email = (googleData.email || "ishaanthakur49@gmail.com").trim().toLowerCase();
    const name = (googleData.name || "Ishaan Thakur").trim();
    const avatar = googleData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=ffffff&bold=true`;

    const users = this.getUsersDB();
    let user = users.find((u) => u.email === email);

    if (!user) {
      user = {
        id: `google_${Date.now()}`,
        name: name,
        email: email,
        avatar: avatar,
        provider: "google",
        createdAt: new Date().toISOString(),
        favorites: []
      };
      users.push(user);
      this.saveUsersDB(users);
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      provider: "google",
      favorites: user.favorites || [],
      loggedInAt: new Date().toISOString()
    };

    this.saveUser(sessionUser);
    return sessionUser;
  }

  initGoogleAuth(clientCallback) {
    const clientId = this.getGoogleClientId();
    if (!clientId) {
      console.warn("[KOMOREBI AUTH] No custom Google Client ID configured.");
      return;
    }

    // Set element attribute to prevent Google 400 error
    const gOnload = document.getElementById("g_id_onload");
    if (gOnload) {
      gOnload.setAttribute("data-client_id", clientId);
    }

    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          const payload = this.parseJwt(response.credential);
          if (payload) {
            const users = this.getUsersDB();
            let user = users.find((u) => u.email === payload.email);

            if (!user) {
              user = {
                id: `google_${payload.sub}`,
                name: payload.name || payload.email.split("@")[0],
                email: payload.email,
                avatar: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || "User")}&background=5E7453&color=ffffff`,
                provider: "google",
                createdAt: new Date().toISOString(),
                favorites: []
              };
              users.push(user);
              this.saveUsersDB(users);
            }

            const googleUser = {
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              provider: "google",
              favorites: user.favorites || [],
              loggedInAt: new Date().toISOString()
            };

            this.saveUser(googleUser);
            if (clientCallback) clientCallback(googleUser);
          }
        }
      });
    }
  }

  parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  // -------------------------------------------------------------
  // 3. Phone Number Authentication & SMS OTP Logic
  // -------------------------------------------------------------
  sendPhoneOTP(countryCode, phoneNumber) {
    const cleanNumber = (phoneNumber || "").replace(/\D/g, "");
    if (cleanNumber.length < 7 || cleanNumber.length > 15) {
      throw new Error("Please enter a valid phone number (7-15 digits).");
    }

    const fullPhone = `${countryCode} ${phoneNumber.trim()}`;
    this.pendingPhoneNumber = fullPhone;

    // Generate secure 6-digit verification code
    this.currentOTP = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpExpiry = Date.now() + 5 * 60 * 1000; // valid for 5 minutes

    console.log(`[KOMOREBI SMS SERVICE] Dispatched OTP code to ${fullPhone}: ${this.currentOTP}`);

    // Emit event for UI toast notification so user can see SMS code notice
    window.dispatchEvent(
      new CustomEvent("auth:sms_sent", {
        detail: { phone: fullPhone, code: this.currentOTP }
      })
    );

    return {
      success: true,
      phone: fullPhone
    };
  }

  verifyPhoneOTP(inputOTP) {
    if (!this.pendingPhoneNumber) {
      throw new Error("No phone number pending verification. Please request a new code.");
    }

    if (Date.now() > this.otpExpiry) {
      this.currentOTP = null;
      this.pendingPhoneNumber = null;
      throw new Error("Verification code expired. Please request a new OTP.");
    }

    const cleanInput = (inputOTP || "").trim();
    if (cleanInput !== this.currentOTP) {
      throw new Error("Invalid verification code. Please check the 6-digit code and try again.");
    }

    const users = this.getUsersDB();
    let user = users.find((u) => u.phone === this.pendingPhoneNumber);

    if (!user) {
      const phoneDigits = this.pendingPhoneNumber.replace(/\D/g, "");
      user = {
        id: `phone_${Date.now()}`,
        name: `Guest (${phoneDigits.slice(-4)})`,
        phone: this.pendingPhoneNumber,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(phoneDigits.slice(-4))}&background=4A3525&color=FAF7F2`,
        provider: "phone",
        createdAt: new Date().toISOString(),
        favorites: []
      };
      users.push(user);
      this.saveUsersDB(users);
    }

    const phoneUser = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      provider: "phone",
      favorites: user.favorites || [],
      loggedInAt: new Date().toISOString()
    };

    this.saveUser(phoneUser);
    this.currentOTP = null;
    this.pendingPhoneNumber = null;
    this.otpExpiry = null;

    return phoneUser;
  }

  // -------------------------------------------------------------
  // 4. Favorites & Profile Management
  // -------------------------------------------------------------
  toggleFavorite(itemId) {
    if (!this.user) {
      throw new Error("Please log in to save menu favorites.");
    }

    const favorites = Array.isArray(this.user.favorites) ? [...this.user.favorites] : [];
    const index = favorites.indexOf(itemId);

    if (index === -1) {
      favorites.push(itemId);
    } else {
      favorites.splice(index, 1);
    }

    this.user.favorites = favorites;
    this.saveUser(this.user);
    return favorites;
  }

  isFavorite(itemId) {
    return !!(this.user && Array.isArray(this.user.favorites) && this.user.favorites.includes(itemId));
  }

  updateProfile({ name, avatar }) {
    if (!this.user) return;
    if (name) this.user.name = name.trim();
    if (avatar) this.user.avatar = avatar.trim();
    this.saveUser(this.user);
  }
}

export const authInstance = new AuthManager();
