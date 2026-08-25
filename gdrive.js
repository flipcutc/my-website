/**
 * FlipCut Creation - 5TB Google Drive Cloud Storage & Backup Manager
 * Handles client raw footage ingestion links, project archive folders, and automated database backups.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = require('./db');

const GDRIVE_CONFIG = {
  masterFolderUrl: process.env.GDRIVE_MASTER_FOLDER_URL || 'https://drive.google.com/drive/folders/1E71ZRh-3eImKRu49AcDaAyj5vqj9tuq6?usp=sharing',
  clientIngestFolderUrl: process.env.GDRIVE_INGEST_FOLDER_URL || 'https://drive.google.com/drive/folders/1E71ZRh-3eImKRu49AcDaAyj5vqj9tuq6?usp=sharing',
  exportsFolderUrl: process.env.GDRIVE_EXPORTS_FOLDER_URL || 'https://drive.google.com/drive/folders/1E71ZRh-3eImKRu49AcDaAyj5vqj9tuq6?usp=sharing',
  webhookUrl: process.env.GDRIVE_WEBHOOK_URL || ''
};

/**
 * Generate a complete SQL + JSON Database Dump for Google Drive Backup
 */
async function generateDriveBackupDump() {
  try {
    const leads = await db.getAllLeads();
    const backupData = {
      timestamp: new Date().toISOString(),
      agency: "FlipCut Creation",
      storageType: "Google Drive 5TB Cloud Storage",
      totalLeads: leads.length,
      leads: leads
    };

    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const fileName = `flipcut_db_backup_${new Date().toISOString().slice(0,10)}_${Date.now()}.json`;
    const filePath = path.join(backupDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');

    return {
      success: true,
      fileName,
      filePath,
      recordCount: leads.length,
      message: `Backup dump created successfully! Ready for Google Drive sync.`
    };
  } catch (err) {
    console.error('Error creating Google Drive backup dump:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Create a structured client folder request on Google Drive
 */
function getClientDriveFolderLink(clientName, serviceType) {
  const sanitizedName = (clientName || 'New_Client').replace(/[^a-zA-Z0-9_-]/g, '_');
  const sanitizedService = (serviceType || 'Video_Edit').replace(/[^a-zA-Z0-9_-]/g, '_');
  const folderName = `FlipCut_${sanitizedName}_${sanitizedService}_${new Date().toISOString().slice(0,10)}`;
  
  return {
    folderName,
    driveMasterUrl: GDRIVE_CONFIG.masterFolderUrl,
    uploadInstruction: `Upload your raw 4K footage (S-Log/BRAW/ProRes) to folder: ${folderName}`
  };
}

/**
 * Universal Google Drive Media Link Converter
 * Converts Google Drive sharing links to direct high-speed CDN image URLs or embed video players.
 */
function parseGoogleDriveUrl(url, type = 'image') {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) return url;

  let fileId = null;
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const openIdMatch = url.match(/\/open\?id=([a-zA-Z0-9_-]+)/);

  if (fileIdMatch) fileId = fileIdMatch[1];
  else if (idParamMatch) fileId = idParamMatch[1];
  else if (openIdMatch) fileId = openIdMatch[1];

  if (!fileId) return url; // Might be a folder link

  if (type === 'video' || type === 'embed') {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  // High-performance Google UserContent CDN image proxy
  return `https://lh3.googleusercontent.com/d/${fileId}=s1920`;
}

module.exports = {
  GDRIVE_CONFIG,
  generateDriveBackupDump,
  getClientDriveFolderLink,
  parseGoogleDriveUrl
};
