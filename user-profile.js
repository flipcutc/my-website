/**
 * FlipCut Creation - VIP User Profile & Firebase Google Authentication Engine
 * - One-click Google Login via Firebase Auth (popup & redirect fallback)
 * - Realtime Database & Firestore instant profile sync
 * - Header Avatar, Name, Email, VIP Pass badge & Dropdown
 * - Automatic pre-fill of Contact and Webinar forms
 */

(function () {
  'use strict';

  function getCookie(name) {
    try {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (match) return decodeURIComponent(match[2]);
    } catch (_) {}
    return null;
  }

  function setCookie(name, value, days = 365) {
    try {
      const d = new Date();
      d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
    } catch (_) {}
  }

  /* -------------------------------------------------------------
     1. STORAGE HELPERS (Auth User & Webinar Pass Profile)
     ------------------------------------------------------------- */
  function getAuthUser() {
    try {
      const raw = localStorage.getItem('flipcut_auth_user');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    try {
      const cookieRaw = getCookie('flipcut_auth_user');
      if (cookieRaw) return JSON.parse(cookieRaw);
    } catch (_) {}
    return null;
  }

  function setAuthUser(user) {
    if (!user) {
      clearAuthUser();
      return;
    }
    try {
      const jsonStr = JSON.stringify(user);
      localStorage.setItem('flipcut_auth_user', jsonStr);
      setCookie('flipcut_auth_user', jsonStr, 365);
    } catch (_) {}
  }

  function clearAuthUser() {
    try {
      localStorage.removeItem('flipcut_auth_user');
      setCookie('flipcut_auth_user', '', -1);
    } catch (_) {}
  }

  function getUserProfile() {
    try {
      const raw = localStorage.getItem('flipcut_user_profile');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    try {
      const cookieRaw = getCookie('flipcut_user_profile');
      if (cookieRaw) {
        const parsed = JSON.parse(cookieRaw);
        localStorage.setItem('flipcut_user_profile', cookieRaw);
        return parsed;
      }
    } catch (_) {}
    return null;
  }

  function saveUserProfile(profileData) {
    if (!profileData) return;
    const current = getUserProfile() || {};
    const updated = {
      ...current,
      ...profileData,
      webinarRegistered: true,
      lastUpdated: new Date().toISOString()
    };
    try {
      const jsonStr = JSON.stringify(updated);
      localStorage.setItem('flipcut_user_profile', jsonStr);
      setCookie('flipcut_user_profile', jsonStr, 365);
    } catch (_) {}

    renderUserProfileHeader();

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('flipcut_user_channel');
        bc.postMessage({ type: 'PROFILE_UPDATED', profile: updated });
        bc.close();
      }
    } catch (_) {}
  }

  function logoutUserProfile(promptConfirm = true) {
    if (promptConfirm && !confirm('Sign out of your Registered VIP Pass profile on this device?')) {
      return;
    }
    try {
      localStorage.removeItem('flipcut_user_profile');
      setCookie('flipcut_user_profile', '', -1);
    } catch (_) {}
    renderUserProfileHeader();

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('flipcut_user_channel');
        bc.postMessage({ type: 'PROFILE_LOGGED_OUT' });
        bc.close();
      }
    } catch (_) {}
  }

  /* -------------------------------------------------------------
     2. GOOGLE AUTHENTICATION (Firebase Auth)
     ------------------------------------------------------------- */
  async function signInWithGoogle() {
    try {
      if (typeof firebase === 'undefined' || typeof firebase.auth !== 'function') {
        alert('Connecting to Google Login... Please wait 2 seconds and click again.');
        return;
      }

      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      // Add loading state to button
      const btns = document.querySelectorAll('#headerGoogleLoginBtn, #mobileGoogleLoginBtn');
      btns.forEach(b => {
        b.dataset.origHtml = b.innerHTML;
        b.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Connecting...</span>';
        b.disabled = true;
      });

      const result = await firebase.auth().signInWithPopup(provider);
      const user = result.user;

      if (user) {
        const authData = {
          uid: user.uid,
          name: user.displayName || 'Google User',
          email: user.email || '',
          photoURL: user.photoURL || '',
          provider: 'google.com'
        };
        setAuthUser(authData);

        // Sync to Realtime Database & Firestore
        if (typeof window.syncAuthUserToDatabase === 'function') {
          await window.syncAuthUserToDatabase(user);
        }

        renderUserProfileHeader();
        prefillFormsWithUser(authData);
        showToastNotification('Welcome, ' + (user.displayName || 'Creator') + '!');
      }
    } catch (err) {
      console.error('[Google Sign-In Error]', err);
      if (err.code === 'auth/popup-blocked') {
        // Fallback to redirect
        try {
          const provider = new firebase.auth.GoogleAuthProvider();
          await firebase.auth().signInWithRedirect(provider);
        } catch (_) {}
      } else if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, nothing needed
      } else if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
        alert('Google Sign-in is being enabled in Firebase Console. Please verify Google provider is active.');
      } else {
        alert('Google Sign-In note: ' + (err.message || err.code));
      }
    } finally {
      const btns = document.querySelectorAll('#headerGoogleLoginBtn, #mobileGoogleLoginBtn');
      btns.forEach(b => {
        if (b.dataset.origHtml) b.innerHTML = b.dataset.origHtml;
        b.disabled = false;
      });
      renderUserProfileHeader();
    }
  }

  async function signOutUser() {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        if (typeof firebase !== 'undefined' && typeof firebase.auth === 'function') {
          await firebase.auth().signOut();
        }
      } catch (e) {
        console.warn('Sign out note:', e);
      }
      clearAuthUser();
      logoutUserProfile(false);
      renderUserProfileHeader();
      showToastNotification('Signed out successfully.');
    }
  }

  /* -------------------------------------------------------------
     3. AUTO-PREFILL FORMS WITH USER INFO
     ------------------------------------------------------------- */
  function prefillFormsWithUser(user) {
    if (!user) return;
    try {
      const nameInputs = document.querySelectorAll('#clientName, #webinarName, input[name="name"]');
      nameInputs.forEach(inp => {
        if (inp && !inp.value && user.name) inp.value = user.name;
      });

      const emailInputs = document.querySelectorAll('#clientEmail, #webinarEmail, input[name="email"]');
      emailInputs.forEach(inp => {
        if (inp && !inp.value && user.email) inp.value = user.email;
      });
    } catch (_) {}
  }

  /* -------------------------------------------------------------
     4. LOOKUP USER PASS (Supabase / Cloud DB)
     ------------------------------------------------------------- */
  async function lookupUserPass(query) {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return { success: false, message: 'Please enter your Name, Mobile Number, or User ID.' };
    }
    const cleanQ = encodeURIComponent(query.trim());
    const SUPABASE_SYNC_URL = 'https://cznixvdphwbjdnnmapvb.supabase.co';
    const SUPABASE_SYNC_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bml4dmRwaHdiamRubm1hcHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NTgwMTgsImV4cCI6MjEwMzEzNDAxOH0.dTLN1DCbUiBawZq8YlS5Bol-i81JFKhKpPKCboyocuQ';

    try {
      const url = `${SUPABASE_SYNC_URL}/rest/v1/leads?or=(phone.ilike.*${cleanQ}*,name.ilike.*${cleanQ}*,id.ilike.*${cleanQ}*,email.ilike.*${cleanQ}*)&limit=5`;
      const res = await fetch(url, {
        headers: { apikey: SUPABASE_SYNC_KEY, Authorization: 'Bearer ' + SUPABASE_SYNC_KEY }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const lead = rows[0];
          const restored = {
            userId: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            websiteType: lead.websiteType || 'Webinar Masterclass',
            paymentId: lead.paymentId || 'Confirmed Pass',
            amount: lead.budget || lead.amount || '₹99',
            webinarRegistered: true
          };
          saveUserProfile(restored);
          return { success: true, lead: restored };
        }
      }
    } catch (e) {
      console.warn('Cloud pass lookup note:', e);
    }
    return { success: false, message: 'No registered webinar pass found for the entered details. Please check your spelling or register a pass.' };
  }

  /* -------------------------------------------------------------
     5. RENDER HEADER (Google User + VIP Pass Badge)
     ------------------------------------------------------------- */
  function renderUserProfileHeader() {
    const authUser = getAuthUser();
    const profile = getUserProfile();
    const isLoggedIn = !!(authUser || (profile && profile.webinarRegistered));

    const googleDesktopBtn = document.getElementById('headerGoogleLoginBtn');
    const googleMobileBtn = document.getElementById('mobileGoogleLoginBtn');
    const userWrap = document.getElementById('headerUserProfileWrap');

    // Toggle Google Sign-in buttons
    if (googleDesktopBtn) {
      googleDesktopBtn.style.display = isLoggedIn ? 'none' : 'inline-flex';
    }
    if (googleMobileBtn) {
      googleMobileBtn.style.display = isLoggedIn ? 'none' : 'inline-flex';
    }

    if (!userWrap) return;

    if (!isLoggedIn) {
      userWrap.style.display = 'none';
      return;
    }

    // Show Profile Pill
    userWrap.style.display = 'inline-block';

    const displayName = (authUser && authUser.name) || (profile && profile.name) || 'Valued Creator';
    const displayEmail = (authUser && authUser.email) || (profile && profile.email) || '-';
    const displayPhone = (profile && profile.phone) || '-';
    const displayUid = (profile && profile.userId) || (authUser ? ('FC-' + authUser.uid.substring(0, 8).toUpperCase()) : 'FC-CREATOR');
    const photoURL = authUser && authUser.photoURL;

    // Avatar image or crown icon
    const avatarCircle = userWrap.querySelector('.user-avatar-circle');
    if (avatarCircle) {
      if (photoURL) {
        avatarCircle.innerHTML = `<img src="${photoURL}" alt="${displayName}" class="user-avatar-img" referrerpolicy="no-referrer" onerror="this.outerHTML='<i class=\\'fa-solid fa-user\\'></i>'">`;
      } else {
        avatarCircle.innerHTML = `<i class="fa-solid fa-crown"></i>`;
      }
    }

    // Header UID / Short Name
    const uidText = document.getElementById('headerUserUidText');
    if (uidText) {
      const firstName = displayName.split(' ')[0];
      uidText.textContent = firstName.length > 12 ? firstName.substring(0, 10) + '..' : firstName;
    }

    // Badge label
    const passBadge = userWrap.querySelector('.user-pass-badge');
    if (passBadge) {
      if (profile && profile.webinarRegistered) {
        passBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> VIP Pass`;
        passBadge.style.color = '#10B981';
      } else {
        passBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Google Verified`;
        passBadge.style.color = '#3B82F6';
      }
    }

    // Card Details
    const cardAvatar = document.querySelector('.profile-card-avatar');
    if (cardAvatar) {
      if (photoURL) {
        cardAvatar.innerHTML = `<img src="${photoURL}" alt="${displayName}" class="card-avatar-img" referrerpolicy="no-referrer" onerror="this.outerHTML='<i class=\\'fa-solid fa-user-check\\'></i>'">`;
      } else {
        cardAvatar.innerHTML = `<i class="fa-solid fa-user-check"></i>`;
      }
    }

    const cardName = document.getElementById('cardProfileName');
    if (cardName) cardName.textContent = displayName;

    const cardUid = document.getElementById('cardProfileUid');
    if (cardUid) cardUid.textContent = displayUid;

    const cardPhone = document.getElementById('cardProfilePhone');
    if (cardPhone) cardPhone.textContent = displayPhone;

    const cardEmail = document.getElementById('cardProfileEmail');
    if (cardEmail) cardEmail.textContent = displayEmail;

    const cardPassType = document.getElementById('cardProfilePassType');
    if (cardPassType) {
      if (profile && profile.websiteType) {
        cardPassType.textContent = `Webinar Pass (${profile.websiteType})`;
      } else if (profile && profile.webinarRegistered) {
        cardPassType.textContent = 'Webinar Live Masterclass';
      } else {
        cardPassType.textContent = 'Google Verified Account';
      }
    }

    const cardPayStatus = document.getElementById('cardProfilePaymentStatus');
    if (cardPayStatus) {
      if (profile && profile.amount) {
        cardPayStatus.textContent = `✅ ${profile.amount} Confirmed (Razorpay)`;
      } else {
        cardPayStatus.textContent = `✅ Google Account Connected`;
      }
    }

    const cardWaBtn = document.getElementById('cardProfileWhatsAppBtn');
    if (cardWaBtn) {
      const siteContent = (typeof getSiteContent === 'function') ? getSiteContent() : null;
      const groupLink = siteContent?.webinar?.whatsappGroupLink || 'https://chat.whatsapp.com/B5hdxy7LbkNCrWRsHMtW8h';
      cardWaBtn.href = groupLink;
    }
  }

  /* -------------------------------------------------------------
     6. TOAST NOTIFICATION
     ------------------------------------------------------------- */
  function showToastNotification(msg) {
    try {
      let toast = document.getElementById('flipcutToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'flipcutToast';
        toast.className = 'flipcut-toast-notification';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    } catch (_) {}
  }

  /* -------------------------------------------------------------
     7. INITIALIZATION & EVENT LISTENERS
     ------------------------------------------------------------- */
  function initUserProfileEvents() {
    renderUserProfileHeader();

    // Firebase Auth State Observer
    if (typeof firebase !== 'undefined' && typeof firebase.auth === 'function') {
      try {
        firebase.auth().onAuthStateChanged(async (user) => {
          if (user) {
            const authData = {
              uid: user.uid,
              name: user.displayName || 'Google User',
              email: user.email || '',
              photoURL: user.photoURL || '',
              provider: 'google.com'
            };
            setAuthUser(authData);
            if (typeof window.syncAuthUserToDatabase === 'function') {
              window.syncAuthUserToDatabase(user);
            }
            prefillFormsWithUser(authData);
          } else {
            clearAuthUser();
          }
          renderUserProfileHeader();
        });
      } catch (e) {
        console.warn('[Firebase Auth Observer Note]', e);
      }
    }

    // Header pill click toggle
    const btn = document.getElementById('headerUserProfileBtn');
    const wrap = document.getElementById('headerUserProfileWrap');
    if (btn && wrap) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        wrap.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (!wrap.contains(e.target)) {
          wrap.classList.remove('active');
        }
      });
    }

    // Multi-tab sync
    window.addEventListener('storage', (e) => {
      if (e.key === 'flipcut_user_profile' || e.key === 'flipcut_auth_user') {
        renderUserProfileHeader();
      }
    });

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('flipcut_user_channel');
        bc.onmessage = () => renderUserProfileHeader();
      }
    } catch (_) {}

    // Pre-fill forms on initial load if auth user exists
    const existingAuth = getAuthUser();
    if (existingAuth) prefillFormsWithUser(existingAuth);
  }

  // Expose global methods
  window.getUserProfile = getUserProfile;
  window.saveUserProfile = saveUserProfile;
  window.lookupUserPass = lookupUserPass;
  window.logoutUserProfile = logoutUserProfile;
  window.renderUserProfileHeader = renderUserProfileHeader;
  window.signInWithGoogle = signInWithGoogle;
  window.signOutUser = signOutUser;
  window.getAuthUser = getAuthUser;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserProfileEvents);
  } else {
    initUserProfileEvents();
  }
})();
