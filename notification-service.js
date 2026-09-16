/**
 * FlipCut Creation - Instant Order & Lead Notification Engine
 * Sends instant mobile push alerts via Telegram Bot and email notifications via Gmail.
 * 100% Non-blocking, isolated from payments and database leads.
 */
(function() {
  'use strict';

  if (window.__FLIPCUT_NOTIFICATIONS_INITIALIZED__) return;
  window.__FLIPCUT_NOTIFICATIONS_INITIALIZED__ = true;

  const SUPABASE_URL = 'https://cznixvdphwbjdnnmapvb.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bml4dmRwaHdiamRubm1hcHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NTgwMTgsImV4cCI6MjEwMzEzNDAxOH0.dTLN1DCbUiBawZq8YlS5Bol-i81JFKhKpPKCboyocuQ';

  // Default alert settings structure
  const DEFAULT_SETTINGS = {
    telegramEnabled: true,
    telegramBotToken: '',
    telegramChatId: '',
    emailEnabled: true,
    emailRecipient: 'flipcutcreation@gmail.com',
    notifyOnWebinar: true,
    notifyOnInquiry: true
  };

  // Get cached settings from localStorage for 0ms access
  function getAlertSettings() {
    try {
      const cached = localStorage.getItem('fc_alert_settings');
      if (cached) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
      }
    } catch (_) {}
    return DEFAULT_SETTINGS;
  }

  // Sync latest alert settings from Supabase in the background
  async function syncAlertSettings() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.CMS_ALERT_SETTINGS&select=message`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows[0] && rows[0].message) {
          const cloudSettings = JSON.parse(rows[0].message);
          const merged = { ...DEFAULT_SETTINGS, ...cloudSettings };
          localStorage.setItem('fc_alert_settings', JSON.stringify(merged));
          return merged;
        }
      }
    } catch (_) {}
    return getAlertSettings();
  }

  // Pre-sync settings on page load
  syncAlertSettings().catch(() => {});

  // Send Telegram Bot Push Notification
  async function sendTelegramAlert(data, settings) {
    if (!settings.telegramEnabled) return;
    const token = (settings.telegramBotToken || '').trim();
    const chatId = (settings.telegramChatId || '').trim();
    if (!token || !chatId) return;

    const rawPhone = (data.phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.length === 10 ? '91' + rawPhone : rawPhone;
    const isPass = data.type === 'WEBINAR_PASS';
    const headerTitle = isPass ? '🎟 <b>NEW WEBINAR TICKET PASS BOOKED!</b>' : '💼 <b>NEW CREATIVE PROJECT INQUIRY!</b>';

    const messageHtml = `
${headerTitle}
━━━━━━━━━━━━━━━━━━
👤 <b>Customer:</b> ${data.name || 'Anonymous'}
📞 <b>Phone:</b> <code>+${cleanPhone}</code>
✉️ <b>Email:</b> ${data.email || 'None'}
🎯 <b>Service:</b> ${data.service || (isPass ? 'Full-Stack Web Dev Masterclass' : 'Video Production')}
💰 <b>Amount:</b> <b>${data.amount || (isPass ? '₹499' : 'Quote Requested')}</b>
🆔 <b>Order ID:</b> <code>${data.id || data.userId || '-'}</code>
${data.paymentId ? `💳 <b>Razorpay ID:</b> <code>${data.paymentId}</code>\n` : ''}${data.notes ? `📝 <b>Details:</b> <i>${data.notes}</i>\n` : ''}⏰ <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
━━━━━━━━━━━━━━━━━━
💬 <a href="https://wa.me/${cleanPhone}"><b>👉 Open WhatsApp Chat Directly</b></a>
    `.trim();

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: messageHtml,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('[Telegram Alert Note]', err);
    }
  }

  // Send Email Notification to Admin Gmail via FormSubmit REST API
  async function sendEmailAlert(data, settings) {
    if (!settings.emailEnabled) return;
    const email = (settings.emailRecipient || '').trim();
    if (!email || !email.includes('@')) return;

    const isPass = data.type === 'WEBINAR_PASS';
    const subject = isPass 
      ? `🎟 New Webinar Pass: ${data.name} (${data.amount || '₹499'})` 
      : `💼 New Project Inquiry: ${data.name} (${data.service || 'Creative'})`;

    const emailPayload = {
      _subject: subject,
      _template: 'table',
      _captcha: 'false',
      'Event Type': isPass ? 'Webinar Ticket Pass' : 'Project Inquiry / Brief',
      'Customer Name': data.name || '-',
      'Phone Number': data.phone || '-',
      'Email Address': data.email || '-',
      'Service / Category': data.service || (isPass ? 'Webinar Ticket' : 'Video Editing'),
      'Amount / Budget': data.amount || data.budget || '-',
      'Reference ID': data.id || data.userId || '-',
      'Razorpay Payment ID': data.paymentId || 'N/A',
      'Notes / Details': data.notes || data.message || 'None',
      'Timestamp': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });
    } catch (err) {
      console.warn('[Email Alert Note]', err);
    }
  }

  // Main Public Dispatcher: Completely Asynchronous & Non-Blocking
  window.sendFlipCutOrderAlert = function(orderData) {
    setTimeout(async () => {
      try {
        const settings = getAlertSettings();
        await Promise.allSettled([
          sendTelegramAlert(orderData, settings),
          sendEmailAlert(orderData, settings)
        ]);
      } catch (err) {
        // Silent catch - never disrupt customer checkout flow
      }
    }, 50);
  };

  // Expose configuration helpers for Admin Panel
  window.__fcAlerts = {
    getSettings: getAlertSettings,
    syncSettings: syncAlertSettings,
    sendTelegramAlert: sendTelegramAlert,
    sendEmailAlert: sendEmailAlert
  };

})();
