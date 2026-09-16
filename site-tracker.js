/**
 * FlipCut Creation - Real-time Site Visitor Tracker & Click-Stream Engine
 * Captures IP, Geolocation, Current Page, Device/OS, Traffic Referrer, and User Interactions.
 * 100% Non-blocking, isolated from payments and leads.
 */
(function() {
  'use strict';

  // Prevent double initialization
  if (window.__FLIPCUT_TRACKER_INITIALIZED__) return;
  window.__FLIPCUT_TRACKER_INITIALIZED__ = true;

  const SUPABASE_SYNC_URL = 'https://cznixvdphwbjdnnmapvb.supabase.co';
  const SUPABASE_SYNC_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bml4dmRwaHdiamRubm1hcHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NTgwMTgsImV4cCI6MjEwMzEzNDAxOH0.dTLN1DCbUiBawZq8YlS5Bol-i81JFKhKpPKCboyocuQ';

  // 1. Session & Visitor ID Management
  function getVisitorId() {
    let vid = localStorage.getItem('fc_vid');
    if (!vid) {
      vid = 'V-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
      try { localStorage.setItem('fc_vid', vid); } catch (_) {}
    }
    return vid;
  }

  function getSessionId() {
    let sid = sessionStorage.getItem('fc_sid');
    if (!sid) {
      sid = 'VIS_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7).toUpperCase();
      try { sessionStorage.setItem('fc_sid', sid); } catch (_) {}
    }
    return sid;
  }

  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  const sessionStartTime = Date.now();

  // 2. Device, OS & Browser Detection
  function detectClientInfo() {
    const ua = navigator.userAgent || '';
    let deviceType = 'Desktop';
    if (/iPad|Tablet|(android(?!.*mobile))/i.test(ua)) {
      deviceType = 'Tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) {
      deviceType = 'Mobile';
    }

    let os = 'Unknown OS';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Linux/i.test(ua)) os = 'Linux';

    let browser = 'Unknown Browser';
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
    else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';
    else if (/MSIE|Trident\//i.test(ua)) browser = 'IE';

    return {
      device: deviceType,
      os: os,
      browser: browser,
      screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      language: navigator.language || 'en-US'
    };
  }

  // 3. Traffic Source & Referrer Detection
  function detectTrafficSource() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const refParam = urlParams.get('ref') || urlParams.get('source');

    if (utmSource) {
      let src = utmSource;
      if (utmMedium) src += ` (${utmMedium})`;
      return src;
    }
    if (refParam) return `Ref: ${refParam}`;

    const ref = (document.referrer || '').toLowerCase();
    if (!ref) return 'Direct Traffic';
    if (ref.includes('instagram.com') || ref.includes('l.instagram.com')) return 'Instagram';
    if (ref.includes('google.')) return 'Google Search';
    if (ref.includes('facebook.com') || ref.includes('fb.com') || ref.includes('l.facebook.com')) return 'Facebook';
    if (ref.includes('youtube.com') || ref.includes('youtu.be')) return 'YouTube';
    if (ref.includes('whatsapp') || ref.includes('wa.me')) return 'WhatsApp';
    if (ref.includes('linkedin.com')) return 'LinkedIn';
    if (ref.includes('twitter.com') || ref.includes('t.co') || ref.includes('x.com')) return 'Twitter / X';

    try {
      const refHost = new URL(document.referrer).hostname;
      if (refHost === window.location.hostname) return 'Internal Navigation';
      return refHost;
    } catch (_) {
      return 'Referral Link';
    }
  }

  // 4. IP & Geolocation Resolver (Fast, free, cached in sessionStorage)
  async function resolveGeoLocation() {
    const cachedGeo = sessionStorage.getItem('fc_geo');
    if (cachedGeo) {
      try { return JSON.parse(cachedGeo); } catch (_) {}
    }

    const defaultGeo = {
      ip: 'Anonymous',
      city: 'Unknown City',
      region: 'Unknown Region',
      country: 'India',
      countryCode: 'IN',
      flag: '🇮🇳'
    };

    // Attempt primary fast API (ipapi.co)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        const geo = {
          ip: data.ip || 'Anonymous',
          city: data.city || 'Unknown City',
          region: data.region || 'Unknown Region',
          country: data.country_name || 'India',
          countryCode: data.country_code || 'IN',
          flag: getCountryFlag(data.country_code || 'IN')
        };
        sessionStorage.setItem('fc_geo', JSON.stringify(geo));
        return geo;
      }
    } catch (_) {}

    // Fallback API (freeipapi.com)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('https://freeipapi.com/api/json', { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        const geo = {
          ip: data.ipAddress || 'Anonymous',
          city: data.cityName || 'Unknown City',
          region: data.regionName || 'Unknown Region',
          country: data.countryName || 'India',
          countryCode: data.countryCode || 'IN',
          flag: getCountryFlag(data.countryCode || 'IN')
        };
        sessionStorage.setItem('fc_geo', JSON.stringify(geo));
        return geo;
      }
    } catch (_) {}

    return defaultGeo;
  }

  function getCountryFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '🌐';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  // 5. State & Sync Manager
  const clientInfo = detectClientInfo();
  const trafficSource = detectTrafficSource();
  let currentGeo = null;
  let lastAction = 'Landed on page';
  let isSending = false;

  async function pushVisitorSession(status = 'ONLINE') {
    if (isSending) return;
    isSending = true;

    try {
      if (!currentGeo) {
        currentGeo = await resolveGeoLocation();
      }

      const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
      const locationLabel = `${currentGeo.city}, ${currentGeo.region}, ${currentGeo.country}`;
      const deviceLabel = `${clientInfo.device} (${clientInfo.os}) • ${clientInfo.browser}`;

      const meta = {
        sessionId: sessionId,
        visitorId: visitorId,
        ip: currentGeo.ip,
        city: currentGeo.city,
        region: currentGeo.region,
        country: currentGeo.country,
        countryCode: currentGeo.countryCode,
        flag: currentGeo.flag,
        device: clientInfo.device,
        os: clientInfo.os,
        browser: clientInfo.browser,
        screen: clientInfo.screen,
        referrer: trafficSource,
        page: window.location.pathname || '/',
        pageTitle: document.title || 'FlipCut Creation',
        lastAction: lastAction,
        isOnline: status === 'ONLINE',
        status: status,
        durationSeconds: durationSeconds,
        firstSeen: new Date(sessionStartTime).toISOString(),
        lastSeen: new Date().toISOString()
      };

      const payload = {
        id: sessionId,
        name: `${currentGeo.flag} ${locationLabel}`,
        email: currentGeo.ip,
        phone: deviceLabel,
        service: 'SITE_VISITOR_ANALYTICS',
        budget: trafficSource,
        message: JSON.stringify(meta),
        status: status
      };

      // Non-blocking background push to Supabase
      if (navigator.sendBeacon && status !== 'ONLINE') {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(`${SUPABASE_SYNC_URL}/rest/v1/leads`, blob);
      } else {
        await fetch(`${SUPABASE_SYNC_URL}/rest/v1/leads`, {
          method: 'POST',
          keepalive: true,
          headers: {
            apikey: SUPABASE_SYNC_KEY,
            Authorization: `Bearer ${SUPABASE_SYNC_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal'
          },
          body: JSON.stringify(payload)
        });
      }

      // Also mirror to BroadcastChannel for 0ms instant local tab updates
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('flipcut_live_analytics');
          bc.postMessage({ type: 'VISITOR_UPDATE', data: meta });
          bc.close();
        } catch (_) {}
      }
    } catch (err) {
      // Gracefully silent - never disrupt website
    } finally {
      isSending = false;
    }
  }

  // 6. User Click & Interaction Listener
  function initClickTracking() {
    document.addEventListener('click', function(e) {
      try {
        const target = e.target.closest('button, a, [role="button"], .btn, input[type="submit"], .cta-button, .pricing-card, .faq-question');
        if (!target) return;

        let label = (target.innerText || target.value || target.getAttribute('aria-label') || target.title || '').trim();
        if (!label && target.querySelector('i')) {
          label = target.querySelector('i').className;
        }
        if (label.length > 50) label = label.substring(0, 50) + '...';

        const tagName = target.tagName.toLowerCase();
        const actionText = label ? `Clicked "${label}" (${tagName})` : `Clicked <${tagName}>`;

        lastAction = actionText;

        // Debounced sync for high-value clicks
        clearTimeout(window.__fc_click_timer);
        window.__fc_click_timer = setTimeout(() => {
          pushVisitorSession('ONLINE');
        }, 800);
      } catch (_) {}
    }, { passive: true });
  }

  // 7. Lifecycle & Heartbeat Setup
  function initLifecycle() {
    // Initial land
    setTimeout(() => {
      pushVisitorSession('ONLINE');
    }, 500);

    // Heartbeat every 30 seconds while tab is active
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        pushVisitorSession('ONLINE');
      }
    }, 30000);

    // Visibility change handling
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        pushVisitorSession('IDLE');
      } else {
        lastAction = 'Returned to tab';
        pushVisitorSession('ONLINE');
      }
    });

    // Page exit / unload
    window.addEventListener('pagehide', () => {
      lastAction = 'Left website';
      pushVisitorSession('LEFT');
    });
  }

  // Run tracker after page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initClickTracking();
      initLifecycle();
    });
  } else {
    initClickTracking();
    initLifecycle();
  }
})();
