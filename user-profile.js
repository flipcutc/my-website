/**
 * FlipCut Creation - VIP User Profile & Header Pass Badge Engine
 * Automatically creates user profile after Webinar Registration / Payment
 * and renders VIP Profile Pill & Dropdown in site header across all pages.
 */

(function () {
  'use strict';

  function getUserProfile() {
    try {
      const raw = localStorage.getItem('flipcut_user_profile');
      if (raw) return JSON.parse(raw);
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
      localStorage.setItem('flipcut_user_profile', JSON.stringify(updated));
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

  function logoutUserProfile() {
    if (confirm('Sign out of your Registered VIP Pass profile on this device?')) {
      try {
        localStorage.removeItem('flipcut_user_profile');
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
      cardPayStatus.textContent = `✅ ${profile.amount || '₹2'} Confirmed (Razorpay)`;
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
  window.logoutUserProfile = logoutUserProfile;
  window.renderUserProfileHeader = renderUserProfileHeader;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserProfileEvents);
  } else {
    initUserProfileEvents();
  }
})();
