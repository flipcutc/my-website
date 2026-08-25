/**
 * FlipCut Creation - Hybrid Cloud Database (Supabase PostgreSQL + Local Backup)
 * Automatically stores leads in Supabase cloud PostgreSQL when connected,
 * and maintains a local backup in leads-backup.json.
 */

const fs = require('fs');
const path = require('path');
const { getSupabaseConfig } = require('./supabase');
require('dotenv').config();

const LOCAL_LEADS_FILE = path.join(__dirname, 'leads-backup.json');

function getLocalLeads() {
  try {
    if (fs.existsSync(LOCAL_LEADS_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_LEADS_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

function saveLocalLeads(leads) {
  try {
    fs.writeFileSync(LOCAL_LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
  } catch (e) {}
}

async function requestSupabase(endpoint, options = {}) {
  const cfg = getSupabaseConfig();
  if (!cfg.url || !cfg.anonKey) return null;

  const key = cfg.serviceRoleKey || cfg.anonKey;
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Prefer: options.prefer || 'return=representation',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${cfg.url}/rest/v1/${endpoint}`, {
      ...options,
      headers
    });
    if (res.ok) {
      const text = await res.text();
      return text ? JSON.parse(text) : true;
    }
  } catch (err) {
    // Network or fetch error
  }
  return null;
}

async function initDatabase() {
  const cfg = getSupabaseConfig();
  if (cfg.url && cfg.anonKey) {
    const testRes = await requestSupabase('leads?select=id&limit=1', { method: 'GET' });
    if (testRes !== null) {
      return { success: true, message: 'Supabase PostgreSQL Cloud DB Connected', type: 'supabase' };
    }
    return { success: true, message: 'Supabase Configured (Local storage fallback active)', type: 'supabase-fallback' };
  }
  return { success: false, message: 'Local storage mode enabled.', type: 'file' };
}

async function addLead(lead) {
  const leadId = String(lead.id || Date.now());
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  let defaultPrefix = 'FC-REG-';
  if (lead.paymentId || lead.paymentStatus === 'Paid & Verified' || (lead.status && lead.status.includes('Paid'))) {
    defaultPrefix = 'FC-PAY-';
  } else if (lead.service && lead.service.toLowerCase().includes('webinar')) {
    defaultPrefix = 'FC-WEB-';
  }
  const userId = lead.userId || `${defaultPrefix}${randomSuffix}`;

  const dateStr = lead.date || new Date().toISOString().slice(0, 10);
  const timeStr = lead.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const formattedLead = {
    id: leadId,
    userId: userId,
    date: dateStr,
    time: timeStr,
    name: lead.name || 'Anonymous Client',
    email: lead.email || '',
    phone: lead.phone || '',
    service: lead.service || lead.packageName || 'Video Editing',
    packageName: lead.packageName || lead.service || 'Video Editing',
    budget: lead.budget || lead.amount || '₹0',
    amount: lead.amount || lead.budget || '₹0',
    websiteType: lead.websiteType || '',
    footage: lead.footage || '',
    notes: lead.notes || '',
    message: lead.message || lead.notes || '',
    paymentId: lead.paymentId || '',
    orderId: lead.orderId || '',
    paymentStatus: lead.paymentStatus || (lead.paymentId ? 'Paid & Verified' : 'Inquiry / Pending'),
    status: lead.status || (lead.paymentId ? 'Booked / Paid' : 'New'),
    allDetails: lead.allDetails || lead.notes || lead.message || ''
  };

  // 1. Sync to Supabase cloud table if active
  const sbResult = await requestSupabase('leads', {
    method: 'POST',
    body: JSON.stringify(formattedLead)
  });

  // 2. Always persist to local backup file
  const localLeads = getLocalLeads();
  const existingIdx = localLeads.findIndex(l => String(l.id) === leadId);
  if (existingIdx >= 0) {
    localLeads[existingIdx] = formattedLead;
  } else {
    localLeads.unshift(formattedLead);
  }
  saveLocalLeads(localLeads);

  return formattedLead;
}

async function getAllLeads() {
  // 1. Try fetching from Supabase cloud first
  const cloudLeads = await requestSupabase('leads?select=*&order=created_at.desc', { method: 'GET' });
  if (Array.isArray(cloudLeads) && cloudLeads.length > 0) {
    // Sync to local backup file
    saveLocalLeads(cloudLeads);
    return cloudLeads;
  }

  // 2. Fallback to local storage
  return getLocalLeads();
}

async function updateLeadStatus(id, newStatus) {
  const strId = String(id);

  // 1. Update in Supabase
  await requestSupabase(`leads?id=eq.${encodeURIComponent(strId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus })
  });

  // 2. Update in local file
  const leads = getLocalLeads();
  const target = leads.find(l => String(l.id) === strId);
  if (target) {
    target.status = newStatus;
    saveLocalLeads(leads);
  }
  return true;
}

async function deleteLead(id) {
  const strId = String(id);

  // 1. Delete from Supabase
  await requestSupabase(`leads?id=eq.${encodeURIComponent(strId)}`, {
    method: 'DELETE'
  });

  // 2. Delete from local file
  let leads = getLocalLeads();
  leads = leads.filter(l => String(l.id) !== strId);
  saveLocalLeads(leads);
  return true;
}

function getDbStatus() {
  const cfg = getSupabaseConfig();
  const isConfigured = Boolean(cfg.url && cfg.anonKey);
  return {
    connected: isConfigured,
    type: isConfigured ? 'supabase' : 'file',
    message: isConfigured ? 'Supabase PostgreSQL Cloud Active' : 'Local Storage Mode'
  };
}

module.exports = {
  initDatabase,
  addLead,
  getAllLeads,
  updateLeadStatus,
  deleteLead,
  getDbStatus
};

