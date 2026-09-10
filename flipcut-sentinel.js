/**
 * ============================================================================
 * FLIPCUT AUTONOMOUS SELF-HEALING SENTINEL & IMMUNIZATION GUARDIAN (v2.0)
 * ============================================================================
 * 24/7 client-side background resilience engine that intercepts, diagnoses,
 * prevents, and automatically corrects website runtime errors, broken assets,
 * frozen buttons, storage corruption, and network disruptions in real time.
 */

(function initFlipcutSentinel() {
  'use strict';

  // Prevent multiple initializations
  if (window.__FLIPCUT_SENTINEL_ACTIVE__) return;
  window.__FLIPCUT_SENTINEL_ACTIVE__ = true;

  const LOG_KEY = 'flipcut_sentinel_diagnostics';
  const MAX_LOGS = 50;

  const State = {
    errorsIntercepted: 0,
    healedAssetsCount: 0,
    healedStorageCount: 0,
    unstuckButtonsCount: 0,
    startTime: Date.now(),
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
  };

  // Safe diagnostics logging
  function logDiagnostic(type, details) {
    try {
      const entry = {
        type,
        time: new Date().toISOString(),
        details: typeof details === 'string' ? details : (details.message || JSON.stringify(details)),
        url: window.location.pathname
      };
      let logs = [];
      const stored = sessionStorage.getItem(LOG_KEY);
      if (stored) {
        logs = JSON.parse(stored);
      }
      logs.unshift(entry);
      if (logs.length > MAX_LOGS) logs = logs.slice(0, MAX_LOGS);
      sessionStorage.setItem(LOG_KEY, JSON.stringify(logs));
    } catch (_) {}
  }

  // =========================================================================
  // 1. GLOBAL JAVASCRIPT EXCEPTION SHIELD (ZERO-CRASH AUTO-RECOVERY)
  // =========================================================================
  window.addEventListener('error', function(e) {
    State.errorsIntercepted++;
    const errMsg = (e && e.message) ? e.message : 'Unknown Script Error';
    const filename = (e && e.filename) ? e.filename : '';
    
    // Check if error is from harmless 3rd-party adblockers or browser extensions
    const isThirdParty = filename && (
      filename.includes('chrome-extension://') ||
      filename.includes('moz-extension://') ||
      filename.includes('safari-extension://')
    );

    logDiagnostic('SCRIPT_ERROR', {
      message: errMsg,
      file: filename,
      line: e.lineno,
      thirdParty: isThirdParty
    });

    if (isThirdParty) {
      // Suppress extension interference completely
      return true;
    }

    // Attempt auto-healing for common DOM/JSON corruption
    if (errMsg.includes('JSON.parse') || errMsg.includes('SyntaxError')) {
      selfHealStorage();
    }

    // Do not freeze page execution
    return false;
  }, true);

  window.addEventListener('unhandledrejection', function(e) {
    State.errorsIntercepted++;
    const reason = (e && e.reason) ? (e.reason.message || String(e.reason)) : 'Unhandled Promise Rejection';
    
    logDiagnostic('PROMISE_REJECTION', { message: reason });

    // Prevent uncaught errors from stopping UI handlers
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
  });

  // =========================================================================
  // 2. BROKEN ASSET & IMAGE AUTO-HEALING (ZERO BROKEN ICONS)
  // =========================================================================
  const FALLBACK_LOGO = 'assets/logo.png';
  const FALLBACK_SVG = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 240' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230A0F1D'/%3E%3Cstop offset='100%25' stop-color='%231E1B4B'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)' rx='12'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='central' fill='%23818CF8' font-family='sans-serif' font-weight='800' font-size='20'%3EFlipCut Creation%3C/text%3E%3C/svg%3E";

  document.addEventListener('error', function(e) {
    const target = e.target;
    if (target && target.tagName === 'IMG') {
      if (target.dataset.healed) return; // Prevent infinite fallback loops
      target.dataset.healed = 'true';
      State.healedAssetsCount++;

      const isLogo = target.classList.contains('brand-logo-img') || (target.src && target.src.includes('logo'));
      const replacement = isLogo ? FALLBACK_LOGO : FALLBACK_SVG;

      logDiagnostic('ASSET_HEALED', {
        originalSrc: target.src,
        fallbackSrc: replacement
      });

      target.src = replacement;
    }
  }, true);

  // =========================================================================
  // 3. STORAGE INTEGRITY & PRICE IMMUNIZATION (AUTO-PURGE STALE DATA)
  // =========================================================================
  function selfHealStorage() {
    try {
      let healedAny = false;
      const keys = ['flipcut_site_content', 'flipcut_cms_draft', 'flipcut_site_content_backup'];
      
      keys.forEach(k => {
        const raw = localStorage.getItem(k);
        if (!raw) return;

        try {
          const data = JSON.parse(raw);
          let modified = false;

          // Heal Webinar price only if completely missing or empty
          if (data.webinar) {
            const rawP = String(data.webinar.price !== undefined && data.webinar.price !== '' ? data.webinar.price : '').replace(/[^0-9]/g, '');
            if (!rawP || Number(rawP) < 1) {
              data.webinar.price = '49';
              modified = true;
            }
            if (!data.webinar.originalPrice) {
              data.webinar.originalPrice = '999';
              modified = true;
            }
            if (data.webinar.date && (data.webinar.date.includes('Saturday') || data.webinar.date.includes('7:00 PM'))) {
              data.webinar.date = '27th September, Sunday • 10:00 AM IST';
              data.webinar.targetDateTime = '2026-09-27T10:00:00+05:30';
              modified = true;
            }
          }

          // Auto-sync Announcement text price to match dynamic webinar price
          if (data.topAnnouncement && typeof data.topAnnouncement.text === 'string' && data.webinar && data.webinar.price) {
            data.topAnnouncement.text = data.topAnnouncement.text.replace(/₹\s*\d+/g, '₹' + data.webinar.price);
          }

          if (modified) {
            localStorage.setItem(k, JSON.stringify(data));
            healedAny = true;
          }
        } catch (_) {
          // If JSON parse failed completely, reset corrupted entry safely
          localStorage.removeItem(k);
          healedAny = true;
        }
      });

      // Clear popup reload blocker if present
      try {
        sessionStorage.removeItem('flipcut_webinar_popup_dismissed');
      } catch (_) {}

      if (healedAny) {
        State.healedStorageCount++;
        logDiagnostic('STORAGE_HEALED', 'Sanitized stale/corrupted cache and locked webinar price to ₹49');
      }
    } catch (_) {}
  }

  // Run initial storage health-check
  selfHealStorage();

  // =========================================================================
  // 4. BUTTON ANTI-FREEZE GUARDIAN (AUTO-UNLOCK STUCK SUBMIT BUTTONS)
  // =========================================================================
  const trackedButtons = new Map();

  setInterval(function checkFrozenButtons() {
    const buttons = document.querySelectorAll('button[type="submit"], button.btn-primary, button#btnFinalSubmit, button#btnPayRazorpay');
    const now = Date.now();

    buttons.forEach(btn => {
      const text = (btn.textContent || '').toLowerCase();
      const isPending = btn.disabled && (
        text.includes('wait') ||
        text.includes('processing') ||
        text.includes('generating') ||
        text.includes('securing') ||
        text.includes('submitting')
      );

      if (isPending) {
        if (!trackedButtons.has(btn)) {
          trackedButtons.set(btn, {
            start: now,
            originalHtml: btn.innerHTML
          });
        } else {
          const record = trackedButtons.get(btn);
          // If stuck for > 8 seconds, automatically unfreeze and restore button
          if (now - record.start > 8000) {
            btn.disabled = false;
            btn.innerHTML = record.originalHtml || '<i class="fa-solid fa-rotate-right"></i> Try Again';
            trackedButtons.delete(btn);
            State.unstuckButtonsCount++;
            logDiagnostic('BUTTON_UNFROZEN', 'Auto-released stuck button after 8s safety timeout');
            
            // Show helpful notice
            if (typeof window.showToast === 'function') {
              window.showToast('Network delayed. Button unlocked, please tap again.', '#F59E0B');
            }
          }
        }
      } else {
        trackedButtons.delete(btn);
      }
    });
  }, 2000);

  // =========================================================================
  // 5. NETWORK & OFFLINE RESILIENCE GUARDIAN
  // =========================================================================
  window.addEventListener('offline', function() {
    State.isOnline = false;
    logDiagnostic('NETWORK_STATUS', 'User device went offline. Seamlessly utilizing cached storage.');
    if (typeof window.showToast === 'function') {
      window.showToast('📡 You are offline. Showing saved website content.', '#F59E0B');
    }
  });

  window.addEventListener('online', function() {
    State.isOnline = true;
    logDiagnostic('NETWORK_STATUS', 'User reconnected to the internet. Re-synchronizing live data.');
    if (typeof window.showToast === 'function') {
      window.showToast('⚡ Internet restored! Live data synchronized.', '#10B981');
    }
    // Automatically trigger cloud content refresh
    if (typeof window.fetchAndSyncSiteContent === 'function') {
      window.fetchAndSyncSiteContent().catch(() => {});
    }
  });

  // =========================================================================
  // 6. PUBLIC SENTINEL CONTROL & DIAGNOSTICS API (FOR ADMIN & INSPECTOR)
  // =========================================================================
  window.FlipcutSentinel = {
    version: '2.0-Autonomous',
    
    getHealthReport: function() {
      return {
        status: State.errorsIntercepted > 5 ? 'Warning' : 'Healthy',
        uptimeSeconds: Math.round((Date.now() - State.startTime) / 1000),
        isOnline: State.isOnline,
        errorsIntercepted: State.errorsIntercepted,
        healedAssetsCount: State.healedAssetsCount,
        healedStorageCount: State.healedStorageCount,
        unstuckButtonsCount: State.unstuckButtonsCount,
        logs: this.getLogs()
      };
    },

    getLogs: function() {
      try {
        const stored = sessionStorage.getItem(LOG_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (_) {
        return [];
      }
    },

    clearLogs: function() {
      try {
        sessionStorage.removeItem(LOG_KEY);
      } catch (_) {}
    },

    runSelfHeal: function() {
      selfHealStorage();
      document.querySelectorAll('img').forEach(img => {
        if (!img.complete || img.naturalWidth === 0) {
          img.dispatchEvent(new Event('error'));
        }
      });
      return this.getHealthReport();
    }
  };

  console.log('🛡️ [FlipCut Sentinel] Autonomous Self-Healing & Immunization Guardian Active.');
})();
