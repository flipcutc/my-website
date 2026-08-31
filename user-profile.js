/**
 * FlipCut Creation - VIP User Profile & Header Pass Badge Engine
 * Automatically creates user profile after Webinar Registration / Payment
 * and renders VIP Profile Pill & Dropdown in site header across all pages.
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

  /**
   * Look up User Pass from Cloud Database by Name, Phone, or User ID (No password required)
   */
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

  function logoutUserProfile() {
    if (confirm('Sign out of your Registered VIP Pass profile on this device?')) {
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
  }

  function renderUserProfileHeader() {
    const profile = getUserProfile();
    const wrap = document.getElementById('headerUserProfileWrap');
    if (!wrap) return;

    if (!profile || !profile.webinarRegistered) {
      wrap.style.display = 'none';
      return;
    }

    wrap.style.display = 'inline-block';

    const uidText = document.getElementById('headerUserUidText');
    if (uidText) uidText.textContent = profile.userId || 'FC-WEB-00000';

    const cardName = document.getElementById('cardProfileName');
    if (cardName) cardName.textContent = profile.name || 'Valued Creator';

    const cardUid = document.getElementById('cardProfileUid');
    if (cardUid) cardUid.textContent = profile.userId || 'FC-WEB-00000';

    const cardPhone = document.getElementById('cardProfilePhone');
    if (cardPhone) cardPhone.textContent = profile.phone || '-';

    const cardEmail = document.getElementById('cardProfileEmail');
    if (cardEmail) cardEmail.textContent = profile.email || '-';

    const cardPassType = document.getElementById('cardProfilePassType');
    if (cardPassType) {
      cardPassType.textContent = profile.websiteType ? `Webinar Pass (${profile.websiteType})` : 'Webinar Live Masterclass';
    }

    const cardPayStatus = document.getElementById('cardProfilePaymentStatus');
    if (cardPayStatus) {
      cardPayStatus.textContent = `✅ ${profile.amount || '₹99'} Confirmed (Razorpay)`;
    }

    const cardWaBtn = document.getElementById('cardProfileWhatsAppBtn');
    if (cardWaBtn) {
      const siteContent = (typeof getSiteContent === 'function') ? getSiteContent() : null;
      const groupLink = siteContent?.webinar?.whatsappGroupLink || 'https://chat.whatsapp.com/B5hdxy7LbkNCrWRsHMtW8h';
      cardWaBtn.href = groupLink;
    }
  }

  function initUserProfileEvents() {
    renderUserProfileHeader();

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

    // Listen for storage events across tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'flipcut_user_profile') {
        renderUserProfileHeader();
      }
    });

    // Listen for BroadcastChannel events
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('flipcut_user_channel');
        bc.onmessage = () => {
          renderUserProfileHeader();
        };
      }
    } catch (_) {}
  }

  // Expose global methods
  window.getUserProfile = getUserProfile;
  window.saveUserProfile = saveUserProfile;
  window.lookupUserPass = lookupUserPass;
  window.logoutUserProfile = logoutUserProfile;
  window.renderUserProfileHeader = renderUserProfileHeader;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserProfileEvents);
  } else {
    initUserProfileEvents();
  }
})();
