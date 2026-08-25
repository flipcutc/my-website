/**
 * FlipCut Creation - Supabase connection helper
 * Allows the admin to save keys and validate a new Supabase project.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

function normalizeSupabaseUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') return '';
  let url = inputUrl.trim().replace(/^["']|["']$/g, '');
  if (!url) return '';

  // Extract project ref from dashboard URL (e.g. https://supabase.com/dashboard/project/abcdefghijklm)
  const dashMatch = url.match(/supabase\.com\/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashMatch) {
    return `https://${dashMatch[1]}.supabase.co`;
  }

  // If user pasted just the 15-25 char project ID
  if (/^[a-z0-9_-]{15,25}$/i.test(url)) {
    return `https://${url}.supabase.co`;
  }

  // Ensure protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Strip trailing slashes, /rest/v1, /auth/v1
  url = url.replace(/\/+$/, '')
           .replace(/\/rest\/v1\/?$/i, '')
           .replace(/\/auth\/v1\/?$/i, '');

  return url;
}

function cleanApiKey(key) {
  if (!key || typeof key !== 'string') return '';
  return key.trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '');
}

function getSupabaseConfig() {
  return {
    url: normalizeSupabaseUrl(process.env.SUPABASE_URL || ''),
    anonKey: cleanApiKey(process.env.SUPABASE_ANON_KEY || ''),
    serviceRoleKey: cleanApiKey(process.env.SUPABASE_SERVICE_ROLE_KEY || ''),
    dbUrl: (process.env.SUPABASE_DB_URL || '').trim().replace(/^["']|["']$/g, '')
  };
}

function updateEnvFile(keyValuePairs) {
  const envPath = path.join(__dirname, '.env');
  let envData = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  for (const [key, val] of Object.entries(keyValuePairs)) {
    if (val === undefined || val === null) continue;
    const strVal = String(val).trim();
    process.env[key] = strVal;

    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envData)) {
      envData = envData.replace(regex, `${key}=${strVal}`);
    } else {
      envData = envData.trim() + `\n${key}=${strVal}\n`;
    }
  }

  envData = envData.replace(/\n{3,}/g, '\n\n').trim() + '\n';
  fs.writeFileSync(envPath, envData, 'utf8');
}

async function saveSupabaseConfig(config = {}) {
  const current = getSupabaseConfig();
  
  const rawUrl = config.url !== undefined && config.url !== '' ? config.url : current.url;
  const rawAnon = config.anonKey !== undefined && config.anonKey !== '' ? config.anonKey : current.anonKey;
  const rawService = config.serviceRoleKey !== undefined && config.serviceRoleKey !== '' ? config.serviceRoleKey : current.serviceRoleKey;
  const rawDbUrl = config.dbUrl !== undefined && config.dbUrl !== '' ? config.dbUrl : current.dbUrl;

  const normalizedUrl = normalizeSupabaseUrl(rawUrl);
  const cleanedAnon = cleanApiKey(rawAnon);
  const cleanedService = cleanApiKey(rawService);

  const next = {
    SUPABASE_URL: normalizedUrl,
    SUPABASE_ANON_KEY: cleanedAnon,
    SUPABASE_SERVICE_ROLE_KEY: cleanedService,
    SUPABASE_DB_URL: rawDbUrl ? rawDbUrl.trim() : ''
  };

  updateEnvFile(next);
  return {
    success: true,
    message: 'Supabase API credentials saved to .env successfully.',
    config: getSupabaseConfig()
  };
}

async function testAndInitSupabase(config = {}) {
  const current = getSupabaseConfig();
  
  const targetUrl = normalizeSupabaseUrl(config.url || current.url);
  const targetKey = cleanApiKey(config.anonKey || config.serviceRoleKey || current.anonKey || current.serviceRoleKey);

  if (!targetUrl) {
    return { success: false, message: 'Please provide a valid Supabase Project URL (e.g. https://your-project.supabase.co).' };
  }
  if (!targetKey) {
    return { success: false, message: 'Please provide your Supabase Anon Key (or Service Role Key).' };
  }

  try {
    // 1. Test Auth service health endpoint (works for all active Supabase projects)
    try {
      const authRes = await fetch(`${targetUrl}/auth/v1/health`, {
        method: 'GET',
        headers: {
          apikey: targetKey,
          Authorization: `Bearer ${targetKey}`,
          Accept: 'application/json'
        }
      });

      if (authRes.ok) {
        return {
          success: true,
          message: 'Supabase API connection verified and active!',
          url: targetUrl,
          connected: true
        };
      }
    } catch (_) {}

    // 2. Test Auth settings endpoint
    try {
      const settingsRes = await fetch(`${targetUrl}/auth/v1/settings`, {
        method: 'GET',
        headers: {
          apikey: targetKey,
          Authorization: `Bearer ${targetKey}`,
          Accept: 'application/json'
        }
      });

      if (settingsRes.ok) {
        return {
          success: true,
          message: 'Supabase API connection verified and active!',
          url: targetUrl,
          connected: true
        };
      }
    } catch (_) {}

    // 3. Test PostgREST OpenAPI spec endpoint
    const response = await fetch(`${targetUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: targetKey,
        Authorization: `Bearer ${targetKey}`,
        Accept: 'application/json'
      }
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Supabase API connection verified and active!',
        url: targetUrl,
        connected: true
      };
    }

    // Check status code for helpful guidance
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || errJson.error_description || JSON.stringify(errJson);
    } catch (_) {
      errorDetail = await response.text().catch(() => '');
    }

    if (response.status === 401) {
      return {
        success: false,
        message: `Supabase Auth Failed (HTTP 401): Invalid API key or expired token. ${errorDetail ? '(' + errorDetail + ')' : 'Please copy the anon public key from Project Settings > API.'}`
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        message: `Supabase Project Not Found (HTTP 404). Check that your URL matches: https://<project-ref>.supabase.co`
      };
    }

    if (response.status === 403) {
      return {
        success: false,
        message: `Supabase Project is paused or restricted (HTTP 403). Log in to supabase.com/dashboard and click Restore Project.`
      };
    }

    return {
      success: false,
      message: `Supabase connection failed (HTTP ${response.status} ${response.statusText})${errorDetail ? ': ' + errorDetail : ''}`
    };
  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.cause?.code === 'ENOTFOUND') {
      return {
        success: false,
        message: `Cannot reach Supabase host (${targetUrl}). Please check the Project URL and your internet connection.`
      };
    }
    return {
      success: false,
      message: `Supabase connection error: ${error.message}`
    };
  }
}

async function authenticateAdmin(email, password, config = {}) {
  const cfg = { ...getSupabaseConfig(), ...config };
  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' };
  }
  if (!cfg.url || !cfg.anonKey) {
    return { success: false, message: 'Supabase API is not configured yet.' };
  }

  try {
    const response = await fetch(`${cfg.url}/auth/v1/token`, {
      method: 'POST',
      headers: {
        apikey: cfg.anonKey,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.anonKey}`
      },
      body: JSON.stringify({
        email,
        password,
        grant_type: 'password'
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        message: data?.error_description || data?.message || 'Supabase authentication failed.'
      };
    }

    return {
      success: true,
      message: 'Supabase authentication successful.',
      user: data.user || { email },
      session: data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

async function uploadMediaToSupabase() {
  return {
    success: false,
    message: 'Media upload should use the configured Google Drive folder link or local static assets.'
  };
}

module.exports = {
  getSupabaseConfig,
  saveSupabaseConfig,
  testAndInitSupabase,
  authenticateAdmin,
  uploadMediaToSupabase,
  normalizeSupabaseUrl,
  cleanApiKey,
  getSupabase: getSupabaseConfig
};
