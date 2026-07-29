// Komorebi Cafe - Authentication System Manager
// Supports Google Sign-In (Google Identity Services) and Phone OTP Verification

const STORAGE_KEY = "komorebi_auth_user";

export class AuthManager {
  constructor() {
    this.user = this.loadUser();
    this.otpTimer = null;
    this.otpSeconds = 0;
    this.currentOTP = null;
    this.pendingPhoneNumber = null;
  }

  // Load user session from localStorage
  loadUser() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to read user session:", e);
      return null;
    }
  }

  // Save user session to localStorage
  saveUser(userData) {
    this.user = userData;
    try {
      if (userData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save user session:", e);
    }
    this.notifyStateChange();
  }

  // Dispatch auth state change event across app
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
      window.google.accounts.id.disableAutoSelect();
    }
  }

  // -------------------------------------------------------------
  // Google Authentication Logic
  // -------------------------------------------------------------
  initGoogleAuth(clientCallback) {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: "1234567890-demo.apps.googleusercontent.com", // standard GIS client id template
        callback: (response) => {
          const user = this.parseJwt(response.credential);
          if (user) {
            const googleUser = {
              id: user.sub,
              name: user.name || user.email.split("@")[0],
              email: user.email,
              avatar: user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=5E7453&color=ffffff`,
              provider: "google",
              loggedInAt: new Date().toISOString()
            };
            this.saveUser(googleUser);
            if (clientCallback) clientCallback(googleUser);
          }
        }
      });
    }
  }

  // Simulates or processes Google Sign-In login
  loginWithGoogleDemo(accountOption = 0) {
    const demoAccounts = [
      {
        id: "google_user_101",
        name: "Elena Rostova",
        email: "elena.rostova@gmail.com",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        provider: "google",
        loggedInAt: new Date().toISOString()
      },
      {
        id: "google_user_102",
        name: "Kenji Takahashi",
        email: "kenji.takahashi@gmail.com",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        provider: "google",
        loggedInAt: new Date().toISOString()
      }
    ];

    const selected = demoAccounts[accountOption] || demoAccounts[0];
    this.saveUser(selected);
    return selected;
  }

  // Parse JWT token from Google GIS
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
  // Phone Number Authentication & OTP Logic
  // -------------------------------------------------------------
  sendPhoneOTP(countryCode, phoneNumber) {
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    if (cleanNumber.length < 7 || cleanNumber.length > 15) {
      throw new Error("Please enter a valid phone number.");
    }

    const fullPhone = `${countryCode} ${phoneNumber.trim()}`;
    this.pendingPhoneNumber = fullPhone;

    // Generate random 6-digit OTP for testing demonstration
    this.currentOTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[KOMOREBI AUTH] Generated OTP for ${fullPhone}: ${this.currentOTP}`);

    return {
      success: true,
      phone: fullPhone,
      otpDemo: this.currentOTP
    };
  }

  verifyPhoneOTP(inputOTP) {
    if (!this.pendingPhoneNumber) {
      throw new Error("No phone number pending verification. Please request a code first.");
    }

    const cleanInput = inputOTP.trim();
    // Accept generated OTP or fallback standard demo code 123456
    if (cleanInput === this.currentOTP || cleanInput === "123456") {
      const phoneUser = {
        id: `phone_${Date.now()}`,
        name: `Guest (${this.pendingPhoneNumber.slice(-4)})`,
        phone: this.pendingPhoneNumber,
        avatar: `https://ui-avatars.com/api/?name=User&background=4A3525&color=FAF7F2`,
        provider: "phone",
        loggedInAt: new Date().toISOString()
      };

      this.saveUser(phoneUser);
      this.currentOTP = null;
      this.pendingPhoneNumber = null;
      return phoneUser;
    } else {
      throw new Error("Invalid verification code. Please check the 6-digit OTP and try again.");
    }
  }
}

export const authInstance = new AuthManager();
