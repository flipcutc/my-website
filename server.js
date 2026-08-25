/**
 * FlipCut Creation - Master Backend Server (Express + Local Storage)
 * Uses local file storage for leads and content, with optional Supabase config support.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./db');
const { getSupabaseConfig, saveSupabaseConfig, testAndInitSupabase, authenticateAdmin } = require('./supabase');

/**
 * Unified Safe .env File Updater
 * Preserves all existing credentials and keys while updating specific ones.
 */
function updateEnvFile(keyValuePairs) {
  const envPath = path.join(__dirname, '.env');
  let envData = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  for (const [key, val] of Object.entries(keyValuePairs)) {
    if (val === undefined || val === null) continue;
    const strVal = String(val).trim();
    // Basic key validation: only uppercase alphanum + _
    if (!/^[A-Z0-9_]+$/.test(key)) continue;
    process.env[key] = strVal;

    const regex = new RegExp(`^${escapeRegExp(key)}=.*$`, 'm');
    if (regex.test(envData)) {
      envData = envData.replace(regex, `${key}=${strVal}`);
    } else {
      envData = envData.trim() + `\n${key}=${strVal}\n`;
    }
  }

  envData = envData.replace(/\n{3,}/g, '\n\n').trim() + '\n';
  fs.writeFileSync(envPath, envData, 'utf8');
}

const app = express();
const PORT = Number(process.env.PORT || 8080);

// --- Security headers (helmet-lite) ---
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // HSTS only if https (Vercel)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// --- CORS: allow configured origins or all in dev ---
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin / curl
    if (allowedOrigins.length === 0) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS blocked'), false);
  },
  credentials: true
}));

// --- Body parsers with sane limits (prevent 200MB DoS) ---
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// --- Simple in-memory rate limiter for /api/* (100 req / 15min per IP) ---
const rateStore = new Map();
function rateLimiter(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
  const key = `${ip}:${req.path}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const max = req.path.includes('/api/payment/') ? 30 : 100;
  let entry = rateStore.get(key);
  if (!entry || now - entry.start > windowMs) entry = { start: now, count: 0 };
  entry.count += 1;
  rateStore.set(key, entry);
  if (entry.count > max) return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
  next();
}
app.use('/api/', rateLimiter);
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateStore.entries()) if (now - v.start > 15*60*1000) rateStore.delete(k);
}, 60*1000).unref();

// --- Helpers ---
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function sanitizeString(s, maxLen = 1000) {
  if (typeof s !== 'string') return '';
  return s.slice(0, maxLen).replace(/[<>]/g, '').trim();
}

// Serve static frontend files with proper cache
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (/\.(js|css|png|jpg|jpeg|svg|webp|mp4|webm|woff2?)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// Explicit HTML page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/webinar.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'webinar.html'));
});

app.get('/webinar', (req, res) => {
  res.sendFile(path.join(__dirname, 'webinar.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

/**
 * =========================================================================
 * API ROUTE: DIRECT IMAGE & VIDEO UPLOAD FROM PC (WITH GOOGLE DRIVE SYNC)
 * =========================================================================
 */
app.post('/api/upload', async (req, res) => {
  try {
    const { fileName, base64Data, targetType } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'No file data provided' });
    }
    if (typeof base64Data !== 'string' || base64Data.length > 16 * 1024 * 1024) {
      return res.status(413).json({ success: false, message: 'File too large (max ~12MB). For larger videos use Google Drive link.' });
    }

    // Validate mime type allowlist
    const ALLOWED_MIME = ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','video/mp4','video/webm','video/quicktime'];
    const ALLOWED_EXT = ['.jpg','.jpeg','.png','.webp','.gif','.svg','.mp4','.webm','.mov','.mkv','.avi','.m4v'];

    const matches = base64Data.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
    const mimeType = matches ? matches[1].toLowerCase() : '';
    if (mimeType && !ALLOWED_MIME.includes(mimeType)) {
      return res.status(400).json({ success: false, message: `Unsupported mime type: ${mimeType}` });
    }
    let dataBuffer;
    try {
      dataBuffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(base64Data, 'base64');
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid base64 data' });
    }
    if (dataBuffer.length > 12 * 1024 * 1024) {
      return res.status(413).json({ success: false, message: 'Decoded file exceeds 12MB limit. Use Drive link for larger files.' });
    }

    const rawExt = (path.extname(fileName || 'media.jpg') || '.jpg').toLowerCase();
    if (!ALLOWED_EXT.includes(rawExt)) {
      return res.status(400).json({ success: false, message: `Unsupported file extension: ${rawExt}` });
    }
    const ext = rawExt;
    const isVideo = ['.mp4', '.webm', '.mov', '.mkv', '.avi', '.m4v'].includes(ext);
    const cleanBase = path.basename(fileName || 'media', ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'media';
    const safeTarget = sanitizeString(targetType || '', 20).replace(/[^a-zA-Z0-9_-]/g, '') || (isVideo ? 'video' : 'upload');
    const safeName = `${safeTarget}_${Date.now()}_${cleanBase}${ext}`;
    
    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const filePath = path.join(assetsDir, safeName);
    // Prevent path traversal: ensure filePath is inside assetsDir
    if (!filePath.startsWith(assetsDir)) {
      return res.status(400).json({ success: false, message: 'Invalid file path' });
    }
    fs.writeFileSync(filePath, dataBuffer);

    const relativeUrl = `assets/${safeName}`;
    const fileSizeMb = (dataBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`📁 ${isVideo ? '🎬 Video' : '🖼️ Image'} uploaded from PC: ${relativeUrl} (${fileSizeMb} MB)`);

    const gdriveFolderUrl = process.env.GDRIVE_MASTER_FOLDER_URL || 'https://drive.google.com/drive/folders/1E71ZRh-3eImKRu49AcDaAyj5vqj9tuq6?usp=sharing';

    res.json({
      success: true,
      url: relativeUrl,
      fileName: safeName,
      isVideo: isVideo,
      sizeMb: fileSizeMb,
      gdriveUrl: gdriveFolderUrl,
      driveUrl: gdriveFolderUrl,
      cloudUrl: gdriveFolderUrl,
      message: `${isVideo ? 'Video' : 'Image'} uploaded successfully! Use the Google Drive folder link below in the website or keep the local asset fallback URL.`
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * =========================================================================
 * API ROUTES: LEADS & CRM (Local Storage Persistence)
 * =========================================================================
 */

// 1. Get All Leads from local storage
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await db.getAllLeads();
    res.json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Submit New Project Lead (From Contact Form, Calculator or Webinar) - with validation & sanitization
app.post('/api/leads', async (req, res) => {
  try {
    let { name, email, phone, service, budget, amount, footage, notes, message, websiteType, packageName, paymentId, orderId, paymentStatus, status, userId } = req.body;

    // Sanitize & validate
    name = sanitizeString(name, 100);
    email = sanitizeString(email, 200);
    phone = sanitizeString(phone, 30);
    service = sanitizeString(service, 100);
    websiteType = sanitizeString(websiteType, 100);
    packageName = sanitizeString(packageName, 100);
    budget = sanitizeString(budget, 50);
    amount = sanitizeString(amount, 50);
    footage = sanitizeString(footage, 500);
    notes = sanitizeString(notes, 5000);
    message = sanitizeString(message, 5000);

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format.' });
    }
    if (phone && !/^[\d+\-\s()]{7,20}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone format.' });
    }

    if (!name && !email && !phone) {
      return res.status(400).json({ success: false, error: 'Name, email, or phone is required.' });
    }

    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    let prefix = 'FC-REG-';
    if (paymentId || paymentStatus === 'Paid & Verified' || (status && status.includes('Paid'))) {
      prefix = 'FC-PAY-';
    } else if (service && service.toLowerCase().includes('webinar')) {
      prefix = 'FC-WEB-';
    }
    const finalUserId = userId || `${prefix}${randomDigits}`;

    const savedLead = await db.addLead({
      userId: finalUserId,
      name: name || 'Anonymous Client',
      email: email || '',
      phone: phone || '',
      service: service || packageName || 'Viral Short-Form',
      packageName: packageName || service || 'Viral Short-Form',
      budget: budget || amount || '₹25,000 - ₹50,000',
      amount: amount || budget || '₹25,000 - ₹50,000',
      websiteType: websiteType || '',
      footage: footage || '',
      notes: notes || '',
      message: message || notes || '',
      paymentId: paymentId || '',
      orderId: orderId || '',
      paymentStatus: paymentStatus || (paymentId ? 'Paid & Verified' : 'Inquiry / Pending'),
      status: status || (paymentId ? 'Booked / Paid' : 'New'),
      allDetails: notes || message || ''
    });

    res.status(201).json({
      success: true,
      message: 'Registration and user entries saved successfully.',
      userId: finalUserId,
      data: savedLead
    });
  } catch (err) {
    console.error('Error creating lead:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Update Lead Status
app.put('/api/leads/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const success = await db.updateLeadStatus(req.params.id, status);
    res.json({ success, message: `Lead status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Delete Lead
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const success = await db.deleteLead(req.params.id);
    res.json({ success, message: 'Lead deleted from database.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Supabase config status - mask secrets
app.get('/api/supabase/status', (req, res) => {
  const config = getSupabaseConfig();
  const isConfigured = Boolean(config.url && config.anonKey);
  const mask = (k) => k ? k.slice(0, 10) + '...' + k.slice(-4) : '';
  res.json({
    success: true,
    configured: isConfigured,
    connected: isConfigured,
    url: config.url || '',
    anonKey: config.anonKey ? mask(config.anonKey) : '',
    hasAnonKey: Boolean(config.anonKey),
    hasServiceRoleKey: Boolean(config.serviceRoleKey),
    hasDbUrl: Boolean(config.dbUrl),
    dbUrl: config.dbUrl ? '***masked***' : ''
  });
});

app.post('/api/supabase/config', async (req, res) => {
  try {
    const { url, anonKey, serviceRoleKey, dbUrl } = req.body || {};
    const result = await saveSupabaseConfig({ url, anonKey, serviceRoleKey, dbUrl });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/supabase/test', async (req, res) => {
  try {
    const { url, anonKey, serviceRoleKey, dbUrl } = req.body || {};
    const result = await testAndInitSupabase({ url, anonKey, serviceRoleKey, dbUrl });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const result = await authenticateAdmin(email, password);
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * =========================================================================
 * API ROUTES: MASTER SITE CMS CONTENT (Text, Images, Logos, Pricing)
 * =========================================================================
 */
const CMS_BACKUP_FILE = path.join(__dirname, 'site-content-backup.json');

// Get Site Content
app.get('/api/content', (req, res) => {
  try {
    if (fs.existsSync(CMS_BACKUP_FILE)) {
      const data = JSON.parse(fs.readFileSync(CMS_BACKUP_FILE, 'utf8'));
      return res.json({ success: true, data });
    }
  } catch (e) {}
  res.json({ success: false, message: 'Using default content store' });
});

// Save Site Content (Permanent Multi-Layer Persistence)
app.post('/api/content', async (req, res) => {
  try {
    let content = req.body;
    if (typeof content === 'string') {
      try { content = JSON.parse(content); } catch (_) {}
    }
    if (content && typeof content === 'object' && Object.keys(content).length > 0) {
      // 1. Permanent primary disk storage
      fs.writeFileSync(CMS_BACKUP_FILE, JSON.stringify(content, null, 2), 'utf8');

      // 2. Also keep content-store.js default in sync for instant 0ms offline/static load
      try {
        const contentStorePath = path.join(__dirname, 'content-store.js');
        if (fs.existsSync(contentStorePath)) {
          let storeCode = fs.readFileSync(contentStorePath, 'utf8');
          const marker = 'const DEFAULT_SITE_CONTENT = ';
          const endMarker = '\n// === END_DEFAULT_SITE_CONTENT ===';
          if (storeCode.includes(marker) && storeCode.includes(endMarker)) {
            const startIdx = storeCode.indexOf(marker) + marker.length;
            const endIdx = storeCode.indexOf(endMarker);
            const newStoreCode = storeCode.substring(0, startIdx) + JSON.stringify(content, null, 2) + storeCode.substring(endIdx);
            fs.writeFileSync(contentStorePath, newStoreCode, 'utf8');
          }
        }
      } catch (storeErr) {
        console.warn('content-store fallback sync note:', storeErr.message);
      }
    }

    res.json({ success: true, message: 'Site content saved permanently to disk backup file and content store.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * =========================================================================
 * API ROUTES: DATABASE CONFIGURATION & LIVE TEST
 * =========================================================================
 */

// Get Database Connection Status
app.get('/api/db/status', (req, res) => {
  const status = db.getDbStatus();
  res.json({
    ...status,
    host: process.env.DB_HOST || '',
    port: process.env.DB_PORT || '',
    database: process.env.DB_NAME || '',
    user: process.env.DB_USER || '',
    type: 'file'
  });
});

// Test / Connect to database dynamically
app.post('/api/db/connect', async (req, res) => {
  try {
    await db.initDatabase();
    res.json({
      success: false,
      message: 'SQL integration is disabled in this fresh setup. The project is using local file storage only.',
      type: 'file'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `SQL Connection Error: ${err.message}` });
  }
});

/**
 * =========================================================================
 * API ROUTES: 5TB GOOGLE DRIVE CLOUD STORAGE & BACKUPS
 * =========================================================================
 */
const gdrive = require('./gdrive');

// Get Google Drive Storage Config
app.get('/api/gdrive/config', (req, res) => {
  res.json({
    success: true,
    storageQuota: "5 TB Cloud Storage",
    config: {
      masterFolderUrl: process.env.GDRIVE_MASTER_FOLDER_URL || 'https://drive.google.com/drive/folders/your-5tb-master-folder',
      ingestFolderUrl: process.env.GDRIVE_INGEST_FOLDER_URL || 'https://drive.google.com/drive/folders/your-client-footage-folder',
      exportsFolderUrl: process.env.GDRIVE_EXPORTS_FOLDER_URL || 'https://drive.google.com/drive/folders/your-4k-exports-folder'
    }
  });
});

// Update Google Drive Storage Links
app.post('/api/gdrive/config', (req, res) => {
  try {
    const { masterFolderUrl, ingestFolderUrl, exportsFolderUrl } = req.body;

    updateEnvFile({
      GDRIVE_MASTER_FOLDER_URL: masterFolderUrl || '',
      GDRIVE_INGEST_FOLDER_URL: ingestFolderUrl || '',
      GDRIVE_EXPORTS_FOLDER_URL: exportsFolderUrl || ''
    });

    res.json({ success: true, message: '5TB Google Drive storage folder links saved successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trigger Instant Database Backup for Google Drive
app.post('/api/gdrive/backup', async (req, res) => {
  try {
    const backupResult = await gdrive.generateDriveBackupDump();
    res.json(backupResult);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * =========================================================================
 * API ROUTES: RAZORPAY PAYMENT GATEWAY (INR ₹ & UPI / Cards / NetBanking)
 * =========================================================================
 */
const Razorpay = require('razorpay');
const crypto = require('crypto');

function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID || '';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '';
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

// 1. Get Razorpay Config (Public Key, Mode, Status) - never expose secret
app.get('/api/payment/config', (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const hasSecret = Boolean(process.env.RAZORPAY_KEY_SECRET);
  // Mask keyId for privacy: show first 8 chars only
  const maskedKeyId = keyId ? keyId.slice(0, 12) + '...' : '';
  res.json({
    success: true,
    enabled: process.env.RAZORPAY_ENABLED !== 'false' && Boolean(keyId && hasSecret),
    mode: process.env.RAZORPAY_MODE || 'live',
    keyId: keyId,
    maskedKeyId: maskedKeyId,
    hasSecret: hasSecret,
    currency: 'INR'
  });
});

// 2. Save Razorpay API Key & Secret from Admin Panel
app.post('/api/payment/config', (req, res) => {
  try {
    const { keyId, keySecret, mode, enabled } = req.body;

    const envUpdates = {
      RAZORPAY_MODE: mode || 'live',
      RAZORPAY_ENABLED: enabled !== false ? 'true' : 'false'
    };
    if (keyId !== undefined) envUpdates.RAZORPAY_KEY_ID = keyId.trim();
    if (keySecret !== undefined && keySecret.trim()) envUpdates.RAZORPAY_KEY_SECRET = keySecret.trim();

    updateEnvFile(envUpdates);

    res.json({
      success: true,
      message: 'Razorpay API credentials saved permanently to .env file!'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Verify Live Razorpay Credentials
app.post('/api/payment/test-credentials', async (req, res) => {
  try {
    const { keyId, keySecret } = req.body;
    const verifyKey = keyId || process.env.RAZORPAY_KEY_ID || '';
    const verifySecret = keySecret || process.env.RAZORPAY_KEY_SECRET || '';

    if (!verifyKey || !verifySecret) {
      return res.status(400).json({ success: false, message: 'Please provide both Razorpay Key ID and Secret.' });
    }

    const liveInstance = new Razorpay({ key_id: verifyKey.trim(), key_secret: verifySecret.trim() });
    
    // Fetch payments list with count: 1 as live validation
    await liveInstance.payments.all({ count: 1 });

    res.json({ success: true, message: '✅ Razorpay Live API connection verified successfully!' });
  } catch (err) {
    res.status(400).json({ success: false, message: `❌ Razorpay Connection Failed: ${err.message}` });
  }
});

// 4. Create Razorpay Order
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', packageName, clientName, clientEmail, clientPhone } = req.body;

    const rzp = getRazorpayInstance();
    if (!rzp) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay is not configured. Please enter your Razorpay Key ID & Secret in the Admin Panel.'
      });
    }

    const cleanAmount = Number(String(amount).replace(/[^0-9.]/g, ''));
    if (!cleanAmount || cleanAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount.' });
    }

    const options = {
      amount: Math.round(cleanAmount * 100), // amount in paise
      currency: currency.toUpperCase(),
      receipt: `rcpt_${Date.now()}`,
      notes: {
        package: packageName || 'Custom Production',
        clientName: clientName || 'Client',
        clientEmail: clientEmail || '',
        clientPhone: clientPhone || ''
      }
    };

    const order = await rzp.orders.create(options);

    res.json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID || '',
      currency: options.currency,
      amount: options.amount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `Order creation failed: ${err.message}` });
  }
});

// 5. Verify Razorpay Payment Signature & Record Lead
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, leadData } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    if (!secret) {
      return res.status(400).json({ success: false, message: 'Razorpay Secret Key missing.' });
    }

    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const isWebinar = leadData && leadData.service && leadData.service.toLowerCase().includes('webinar');
      const userId = (leadData && leadData.userId) || `${isWebinar ? 'FC-WEB-' : 'FC-PAY-'}${randomDigits}`;

      let savedRecord = null;
      // Save verified payment to database CRM with all filled entries
      if (leadData) {
        const leadRecord = {
          userId: userId,
          name: leadData.name || 'Razorpay Client',
          email: leadData.email || '',
          phone: leadData.phone || '',
          service: leadData.service || leadData.packageName || 'Retainer Package',
          packageName: leadData.packageName || leadData.service || 'Retainer Package',
          budget: leadData.amount ? `₹${leadData.amount}` : (leadData.budget || '₹0'),
          amount: leadData.amount ? `₹${leadData.amount}` : (leadData.budget || '₹0'),
          websiteType: leadData.websiteType || '',
          footage: leadData.footage || '',
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          paymentStatus: 'Paid & Verified',
          notes: leadData.notes || `[PAID ONLINE via Razorpay]\nUser ID: ${userId}\nPayment ID: ${razorpay_payment_id}\nOrder ID: ${razorpay_order_id}\nAmount: ₹${leadData.amount || ''}\nPlan: ${leadData.packageName || ''}`,
          message: leadData.message || leadData.notes || `[PAID ONLINE via Razorpay]\nUser ID: ${userId}\nPayment ID: ${razorpay_payment_id}\nOrder ID: ${razorpay_order_id}\nAmount: ₹${leadData.amount || ''}\nPlan: ${leadData.packageName || ''}`,
          status: 'Booked / Paid',
          allDetails: `User ID: ${userId} | Payment ID: ${razorpay_payment_id} | Plan: ${leadData.packageName || leadData.service || ''}`
        };
        savedRecord = await db.addLead(leadRecord);
      }

      res.json({
        success: true,
        message: 'Payment verified and registered successfully!',
        userId: userId,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        lead: savedRecord
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature. Verification failed.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: `Payment verification error: ${err.message}` });
  }
});

// Start server if run directly
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, async () => {
    console.log(`🚀 FlipCut Studio Server running at http://localhost:${PORT}`);
    const databaseStatus = db.getDbStatus();
    console.log(`📦 Local storage status: ${databaseStatus.message} (${databaseStatus.type})`);
    await db.initDatabase();
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Stop the running server or start this app with PORT=xxxx.`);
      process.exit(1);
    }

    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  });
}

module.exports = app;
