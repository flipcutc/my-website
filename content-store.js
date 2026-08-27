/**
 * FlipCut Creation - Unified Content Store (CMS) & Global Performance Shield
 * Powers dynamic text, media, currency (INR), high-concurrency caching, and layout customization.
 */

// Global Resilience & Zero-Crash Error-Shield for Millions of Concurrent Users
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event && event.message && (event.message.includes('Script error') || event.message.includes('ResizeObserver') || event.message.includes('FontAwesome'))) {
      if (event.preventDefault) event.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (event && event.reason && typeof event.reason === 'string' && event.reason.includes('aborted')) {
      if (event.preventDefault) event.preventDefault();
    }
  });
}

const DEFAULT_SITE_CONTENT = {
  "brand": {
    "name": "FlipCut Creation",
    "tagline": "CREATION",
    "logoUrl": "assets/logo.png",
    "faviconUrl": "assets/favicon.svg",
    "logoHeight": 86,
    "headerBadge": "Open for Q3/Q4 Project Bookings & Retainers"
  },
  "hero": {
    "titlePrefix": "We Transform Raw Footage Into ",
    "titleGradient": "Viral, High-Retention",
    "titleSuffix": " Visual Masterpieces.",
    "description": "FlipCut Creation is a premier post-production and creative editing studio. We engineer scroll-stopping pacing, cinematic color grading, and dynamic sound design that skyrocket views and conversions.",
    "ctaPrimaryText": "Explore Showcase",
    "ctaSecondaryText": "Estimate Cost",
    "stat1Number": "50M+",
    "stat1Label": "Organic Views",
    "stat2Number": "99.4%",
    "stat2Label": "Client Retention",
    "stat3Number": "24-48h",
    "stat3Label": "Avg Turnaround",
    "stat4Number": "500+",
    "stat4Label": "Videos Delivered",
    "videoPreviewImg": "assets/showcase-edit.jpg",
    "videoEmbedUrl": "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
  },
  "about": {
    "subtitle": "Who We Are",
    "title": "Mastery Built on Pacing, Rhythm & Precision",
    "description": "We don't just cut clips together. We craft immersive storytelling experiences calibrated to capture attention in the first 3 seconds and sustain it to the very last frame.",
    "pillar1Title": "Retention Engineering",
    "pillar1Desc": "Every cut, zoom, b-roll transition, and sound effect is strategically timed to trigger algorithmic engagement and maximize audience watch time.",
    "pillar2Title": "Cinematic Color & VFX",
    "pillar2Desc": "We transform flat camera footage into rich, filmic visual masterpieces using industry-standard DaVinci Resolve color pipelines and custom After Effects motion graphics.",
    "pillar3Title": "Reliable Rapid Delivery",
    "pillar3Desc": "Never miss a content schedule. Our streamlined cloud ingestion and dedicated creative leads guarantee quick 24-48h turnarounds without compromising perfection."
  },
  "dailyPrompts": {
    "subtitle": "Daily Creative Inspiration",
    "title": "Daily Visual Masterpiece & Text Prompt",
    "description": "Explore our daily curated visual arts and copy the exact engineering prompts used to create them.",
    "items": [
      {
        "id": "prompt_1",
        "title": "8K Neo-Tokyo Hyper-Car at Golden Hour",
        "date": "Today's Spotlight",
        "tool": "Midjourney v6 & DaVinci",
        "image": "assets/slider-after.jpg",
        "prompt": "Cinematic wide shot of a futuristic matte black supercar driving along a neon-lit coastal highway at golden hour sunset, volumetric god rays, anamorphic lens flare, 35mm film grain, photorealistic, 8k resolution, DaVinci Resolve color graded --ar 16:9 --v 6.0 --style raw"
      },
      {
        "id": "prompt_2",
        "title": "Cyberpunk Holographic Interface & 3D UI",
        "date": "Yesterday's Inspiration",
        "tool": "Cinema 4D & Octane",
        "image": "assets/showcase-edit.jpg",
        "prompt": "Futuristic holographic user interface HUD with glowing data nodes, transparent glassmorphism widgets, deep violet and cyan neon illumination, depth of field blur, 8k octane render, volumetric lighting"
      }
    ]
  },
  "services": {
    "subtitle": "Our Core Services",
    "title": "End-to-End Post-Production Services",
    "description": "From short-form virality to high-budget brand commercials and custom website development, we deliver tailor-made creative assets designed to perform.",
    "items": [
      {
        "id": "srv_video",
        "badge": "Video Editing",
        "icon": "fa-solid fa-video",
        "title": "Viral Reels, Long-form Content",
        "desc": "Fast-paced, hyper-engaging vertical videos tailored for maximum retention, dynamic subtitles, zoom pops, and sound effects.",
        "features": [
          "Dynamic kinetic subtitles",
          "Sound design & trending audio sync",
          "High-retention visual hooks"
        ],
        "btnText": "Order Video Editing",
        "btnLink": "#contact"
      },
      {
        "id": "srv_graphic",
        "badge": "Graphic Design",
        "icon": "fa-solid fa-palette",
        "title": "Poster, Magazines, Cards",
        "desc": "Creative graphic design that transforms ideas into visually striking designs, from branding and social media creatives to marketing materials, with strong visual hierarchy, modern aesthetics, and attention-grabbing layouts.",
        "features": [
          "Narrative flow & story arc editing",
          "Multi-cam syncing & audio cleanup",
          "Custom high-CTR thumbnail design"
        ],
        "btnText": "Order Graphic Design",
        "btnLink": "#contact"
      },
      {
        "id": "srv_website",
        "badge": "Website Building",
        "icon": "fa-solid fa-laptop-code",
        "title": "UI & UX Design | Full Stack Website",
        "desc": "Creating intuitive UI/UX experiences and fully functional full-stack websites that combine modern design, seamless user journeys, responsive interfaces, and powerful backend functionality.",
        "features": [
          "4K cinematic color grading",
          "Brand-aligned visual identities",
          "Direct-response ad variations (A/B)"
        ],
        "btnText": "Order Website Building",
        "btnLink": "#contact"
      }
    ]
  },
  "workflow": {
    "subtitle": "How We Work",
    "title": "A Frictionless 5-Step Production Pipeline",
    "description": "From the moment you drop your raw files to final 4K delivery, experience a collaborative and stress-free process."
  },
  "portfolio": {
    "subtitle": "Featured Creations",
    "title": "Multidisciplinary Creative Showcase",
    "description": "Explore our curated works across Video Editing, Graphic Design, Web UI/UX Architecture, and Client Live Deliverables.",
    "sliderBeforeImg": "assets/slider-before.jpg",
    "sliderAfterImg": "assets/slider-after.jpg",
    "sliderBeforeLabel": "RAW S-LOG3",
    "sliderAfterLabel": "FLIPCUT 4K MASTER",
    "items": [
      {
        "id": "pf_1787641540180",
        "title": "Unlimited Videos in ONE Click",
        "category": "reels",
        "isVertical": true,
        "type": "video",
        "tag": "Viral Reel & Short",
        "videoUrl": "assets/portfolio_video_1787641524942____Unlimited_Videos_in_ONE_Click______What_if_you_could_generate_unlimited_AI_videos_with_just_o.mp4",
        "image": "assets/showcase-edit.jpg",
        "linkUrl": "https://drive.google.com/drive/folders/1E71ZRh-3eImKRu49AcDaAyj5vqj9tuq6?usp=sharing",
        "views": "40k Views",
        "stat2": "+92% Retention"
      },
      {
        "id": "pf_1787641385037",
        "title": "Generative AI Video",
        "category": "reels",
        "isVertical": true,
        "type": "video",
        "tag": "Viral Reel & Short",
        "videoUrl": "assets/portfolio_video_1787641319039____Unlimited_Images_in_ONE_Click______What_if_you_could_generate_unlimited_AI_images_with_just_o.mp4",
        "image": "assets/showcase-edit.jpg",
        "linkUrl": "https://drive.google.com/drive/folders/1E71ZRh-3eImKRu49AcDaAyj5vqj9tuq6?usp=sharing",
        "views": "1.2M Views",
        "stat2": "+92% Retention"
      },
      {
        "id": "pf_1787639899743",
        "title": "The India International Science Festival,",
        "category": "reels",
        "isVertical": true,
        "type": "video",
        "tag": "Viral Reel & Short",
        "videoUrl": "assets/video_1_1787641039321_The_India_International_Science_Festival__organized_by_the_Government_of_India_at_Anna_Universit.mp4",
        "image": "assets/showcase-edit.jpg",
        "linkUrl": "https://drive.google.com/file/d/1gX5B7ZypY19UdEEqt9mQPdZ5USQOqky4/view?usp=drive_link",
        "views": "1.2k Views",
        "stat2": ""
      }
    ]
  },
  "pricing": {
    "title": "Transparent Packages. Zero Hidden Fees.",
    "description": "Choose an agile per-project tier or secure dedicated retainer bandwidth for ongoing growth.",
    "starter": {
      "name": "Starter Creator",
      "price": "14,999",
      "period": "/ month",
      "desc": "Ideal for solo creators looking to scale short-form output.",
      "features": [
        "8 Short-Form Videos / month",
        "48-Hour Turnaround SLA",
        "2 Revision Rounds / video",
        "Standard Motion Graphics"
      ],
      "btnText": "Select Starter"
    },
    "growth": {
      "popularBadge": "Most Popular Choice",
      "name": "Pro Growth Tier",
      "price": "34,999",
      "period": "/ month",
      "desc": "For high-output creators & brands scaling YouTube + Shorts.",
      "features": [
        "16 Short-Form Videos / month",
        "4 Long-Form YouTube Edits (8-15 min)",
        "24-48h Guaranteed Delivery",
        "Unlimited Revisions",
        "Dedicated Lead Video Editor",
        "DaVinci 4K Color Grading Included"
      ],
      "btnText": "Select Pro Growth"
    },
    "enterprise": {
      "name": "Studio Enterprise",
      "price": "69,999",
      "period": "/ month",
      "desc": "Full-service dedicated post-production department.",
      "features": [
        "Unlimited Short-Form + Long-Form",
        "24-Hour Rush Turnaround",
        "Dedicated Senior Editor & Motion Lead",
        "3D Motion Graphics & Blender VFX",
        "Private Slack / WhatsApp Channel",
        "Project Files & Full Raw Assets"
      ],
      "btnText": "Contact Enterprise"
    }
  },
  "calculator": {
    "baseRates": {
      "reels": 1500,
      "youtube": 4500,
      "commercial": 9999,
      "motion": 6500
    },
    "addons": {
      "thumb": 499,
      "express": 1499,
      "raw": 999
    }
  },
  "testimonials": {
    "subtitle": "Client Voices",
    "title": "Trusted by Modern Creators & Brands",
    "description": "Hear how FlipCut Creation transformed their view counts and engagement metrics.",
    "items": [
      {
        "id": 1,
        "author": "Marcus Sterling",
        "role": "Tech Creator (450K Subs)",
        "avatar": "MS",
        "quote": "FlipCut revolutionized our YouTube workflow. Their retention hooks and sound design boosted our average view duration from 42% to 68% in just 30 days."
      },
      {
        "id": 2,
        "author": "Elena Vance",
        "role": "Host, The Velocity Podcast",
        "avatar": "EV",
        "quote": "The turnaround speed is unbelievable. We drop our raw podcast recording on Monday and by Wednesday we have 12 viral Reels ready to publish."
      },
      {
        "id": 3,
        "author": "David Keller",
        "role": "Creative Director, Apex Motors",
        "avatar": "DK",
        "quote": "Their DaVinci Resolve color grading took our luxury automobile ad campaign to a whole new level. The visuals look like an 8-figure Bollywood/Hollywood production."
      }
    ]
  },
  "faq": {
    "items": [
      {
        "q": "How fast is the turnaround time?",
        "a": "Short-form Reels and TikToks are typically delivered within 24 to 48 hours. Long-form YouTube edits take 48 to 72 hours. Rush 24-hour turnaround is also available on demand."
      },
      {
        "q": "How do we send our raw footage?",
        "a": "You can share your raw files via Google Drive, Dropbox, WeTransfer, or Frame.io. We maintain high-speed gigabit fiber connections for rapid multi-gigabyte ingestion."
      },
      {
        "q": "How many revisions do I get?",
        "a": "Individual projects include 2 full revision rounds. All our monthly Retainer tiers (Growth & Enterprise) include unlimited revisions to ensure you get 100% satisfaction."
      },
      {
        "q": "Do I receive the editable project files?",
        "a": "Yes! We can provide full Adobe Premiere Pro (.prproj), After Effects (.aep), and DaVinci Resolve project archives with organized bins upon request."
      }
    ]
  },
  "runningBanner": {
    "enabled": true,
    "speed": "normal",
    "items": [
      {
        "icon": "fa-solid fa-bolt",
        "text": "50M+ ORGANIC VIEWS GENERATED"
      },
      {
        "icon": "fa-solid fa-palette",
        "text": "DAVINCI RESOLVE 4K COLOR GRADING"
      },
      {
        "icon": "fa-solid fa-clock-rotate-left",
        "text": "24-48H GUARANTEED TURNAROUND"
      },
      {
        "icon": "fa-brands fa-tiktok",
        "text": "VIRAL REELS & SHORTS HOOK OPTIMIZATION"
      },
      {
        "icon": "fa-solid fa-cube",
        "text": "BESPOKE 3D MOTION GRAPHICS & VFX"
      },
      {
        "icon": "fa-brands fa-google-drive",
        "text": "5TB HIGH-SPEED CLOUD STORAGE"
      },
      {
        "icon": "fa-brands fa-whatsapp",
        "text": "DIRECT 1-ON-1 WHATSAPP COLLABORATION"
      },
      {
        "icon": "fa-solid fa-crown",
        "text": "TOP 1% RETENTION STORYTELLING"
      }
    ]
  },
  "sectionsVisibility": {
    "headerBadge": true,
    "headerThemeToggle": true,
    "headerCta": true,
    "navWebinarPill": true,
    "hero": true,
    "runningBanner": true,
    "about": true,
    "dailyPrompts": true,
    "services": true,
    "workflow": true,
    "portfolio": true,
    "whyUs": true,
    "pricing": true,
    "testimonials": true,
    "calculator": false,
    "contact": true,
    "footer": true,
    "heroStats": true,
    "heroVideoCard": true,
    "aboutPillars": true,
    "beforeAfterSlider": false,
    "portfolioFilters": true,
    "whyUsGrid": true,
    "techStack": true,
    "contactDriveLink": true,
    "floatingWhatsApp": true,
    "backToTopBtn": true
  },
  "contact": {
    "title": "Ready to Level Up Your Content?",
    "description": "Fill out the project brief below or reach out directly on WhatsApp for an immediate consultation.",
    "submitBtnText": "Submit Project Brief",
    "whatsappBtnText": "Quick WhatsApp",
    "formLabels": {
      "nameLabel": "Your Name *",
      "namePlaceholder": "e.g. Rahul Sharma",
      "emailLabel": "Email Address *",
      "emailPlaceholder": "rahul@creator.in",
      "phoneLabel": "WhatsApp / Mobile Number *",
      "phonePlaceholder": "+91 98765 43210",
      "serviceLabel": "Service / Project Type",
      "budgetLabel": "Estimated Budget (₹ INR)",
      "footageLabel": "Raw Footage / Reference Link",
      "footagePlaceholder": "https://drive.google.com/drive/folders/1E71ZRh-3eImKRu49AcDaAyj5vqj9tuq6?usp=sharing",
      "driveLinkText": "Open FlipCut 5TB Drive",
      "driveLinkUrl": "https://drive.google.com/drive/folders/1E71ZRh-3eImKRu49AcDaAyj5vqj9tuq6?usp=sharing",
      "notesLabel": "Project Details & Vision",
      "notesPlaceholder": "Describe your vision, target audience, preferred editing style, and deadline..."
    },
    "budgetOptions": [
      {
        "value": "10k-25k",
        "label": "₹10,000 - ₹25,000"
      },
      {
        "value": "25k-50k",
        "label": "₹25,000 - ₹50,000"
      },
      {
        "value": "50k-100k",
        "label": "₹50,000 - ₹1,00,000"
      },
      {
        "value": "100k+",
        "label": "₹1,00,000+ (Custom Retainer)"
      }
    ],
    "serviceOptions": [
      {
        "value": "reels",
        "label": "Viral Short-Form (Reels / TikTok)"
      },
      {
        "value": "youtube",
        "label": "YouTube Long-Form Production"
      },
      {
        "value": "commercial",
        "label": "Commercial / Brand Film"
      },
      {
        "value": "motion",
        "label": "Motion Graphics & 3D Visuals"
      },
      {
        "value": "retainer",
        "label": "Monthly Retainer Bandwidth"
      }
    ],
    "email": "contact@flipcutcreation.com",
    "phone": "+91 70102 70151",
    "whatsappNum": "917010270151",
    "whatsappMessage": "Hi FlipCut Creation, I would like to discuss a video editing project!",
    "instagramHandle": "@flipcutcreation",
    "youtubeChannel": "FlipCut Official",
    "copyrightText": "© 2026 FlipCut Creation. All rights reserved. Precision Engineered Post-Production."
  },
  "webinar": {
    "enabled": true,
    "badge": "Exclusive Live Masterclass Webinar",
    "title": "How to Build & Scale High-Converting Websites That Drive Real Sales",
    "description": "Join FlipCut Creation's lead architects for an interactive live session on building high-retention E-commerce, Portfolio, and Service sites with cinematic visual assets.",
    "date": "Saturday, 7:00 PM IST",
    "duration": "90 Minutes Live + Q&A",
    "seats": "Limited 100 Seats",
    "price": "99",
    "originalPrice": "999",
    "formTitle": "Fill Out Your Webinar Brief",
    "formSubtitle": "Enter your details, select your website type, and complete payment via GPay / Netbanking to unlock your pass.",
    "whatsappGroupLink": "https://chat.whatsapp.com/B5hdxy7LbkNCrWRsHMtW8h",
    "whatsappGroupMsg": "Hi FlipCut Team! I just registered for the Live Masterclass Webinar. Please add me to the VIP Group!"
  }
};
// === END_DEFAULT_SITE_CONTENT ===

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function deepMergeObjects(target, source) {
  if (!source || typeof source !== 'object') return target;
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMergeObjects(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}
if (typeof window !== 'undefined') window.deepMergeObjects = deepMergeObjects;

function formatMediaUrl(url, type) {
  if (!url) return '';
  return url;
}

/**
 * Get active site content with Automatic Multi-Layer Self-Healing
 */
function getSiteContent() {
  try {
    if (typeof localStorage !== 'undefined') {
      let saved = localStorage.getItem('flipcut_cms_draft') || localStorage.getItem('flipcut_site_content') || localStorage.getItem('flipcut_site_content_backup');
      if (!saved && typeof sessionStorage !== 'undefined') {
        saved = sessionStorage.getItem('flipcut_site_content');
      }
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = deepMergeObjects(JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT)), parsed);
        
        // Auto-heal arrays if empty
        if (!merged.dailyPrompts || !Array.isArray(merged.dailyPrompts.items) || merged.dailyPrompts.items.length === 0) {
          merged.dailyPrompts = JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT.dailyPrompts));
        }
        if (!merged.services || !Array.isArray(merged.services.items) || merged.services.items.length === 0) {
          merged.services = JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT.services));
        }
        if (!merged.portfolio || !Array.isArray(merged.portfolio.items) || merged.portfolio.items.length === 0) {
          merged.portfolio = JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT.portfolio));
        }

        return merged;
      }
    }
  } catch (e) {
    console.error('Safe fallback to master default content:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT));
}

function getContentApiBase() {
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.protocol.startsWith('http') && (window.location.port === '8080' || window.location.port === '')) {
      return '';
    }
    if (window.location.protocol.startsWith('http')) {
      return `http://${window.location.hostname}:8080`;
    }
    return 'http://localhost:8080';
  }
  return '';
}
if (typeof window !== 'undefined') {
  window.getContentApiBase = getContentApiBase;
}

const CLOUD_SUPABASE_URL = 'https://cznixvdphwbjdnnmapvb.supabase.co';
const CLOUD_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bml4dmRwaHdiamRubm1hcHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NTgwMTgsImV4cCI6MjEwMzEzNDAxOH0.dTLN1DCbUiBawZq8YlS5Bol-i81JFKhKpPKCboyocuQ';

/**
 * Asynchronously fetch latest saved site content from server / Supabase Cloud database
 * and synchronize to all storage layers with auto-healing.
 */
async function fetchAndSyncSiteContent() {
  // 1. Try Node.js backend if available
  try {
    const apiBase = getContentApiBase();
    if (apiBase) {
      const res = await fetch(`${apiBase}/api/content`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          const merged = deepMergeObjects(JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT)), json.data);
          if (typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem('flipcut_site_content', JSON.stringify(merged));
              localStorage.setItem('flipcut_site_content_backup', JSON.stringify(merged));
            } catch (_) {}
          }
          return merged;
        }
      }
    }
  } catch (_) {}

  // 2. Direct Cloud Fetch from Supabase PostgreSQL (Supports static hosting like GitHub Pages)
  try {
    const sbRes = await fetch(`${CLOUD_SUPABASE_URL}/rest/v1/leads?id=eq.CMS_SITE_CONTENT_LIVE&select=*`, {
      headers: {
        apikey: CLOUD_SUPABASE_KEY,
        Authorization: `Bearer ${CLOUD_SUPABASE_KEY}`
      },
      cache: 'no-store'
    });
    if (sbRes.ok) {
      const rows = await sbRes.json();
      if (rows && rows.length > 0 && rows[0].message) {
        const cloudData = JSON.parse(rows[0].message);
        if (cloudData && typeof cloudData === 'object') {
          const merged = deepMergeObjects(JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT)), cloudData);
          if (typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem('flipcut_site_content', JSON.stringify(merged));
              localStorage.setItem('flipcut_site_content_backup', JSON.stringify(merged));
            } catch (_) {}
          }
          return merged;
        }
      }
    }
  } catch (sbErr) {
    console.warn('Supabase cloud fetch note:', sbErr);
  }

  return getSiteContent();
}

/**
 * Save updated site content to localStorage, backup layer, Node backend, and Supabase Cloud Database
 */
async function saveSiteContent(content) {
  let localSaved = false;
  let serverSaved = false;
  let cloudSaved = false;

  try {
    const serialized = JSON.stringify(content);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('flipcut_site_content', serialized);
      localStorage.setItem('flipcut_site_content_backup', serialized);
      localSaved = true;
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('flipcut_site_content', serialized);
    }
  } catch (localErr) {
    console.warn('localStorage quota warning:', localErr);
  }

  // 1. Sync to Node.js backend server if available
  try {
    const apiBase = getContentApiBase();
    if (apiBase) {
      const res = await fetch(`${apiBase}/api/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      if (res.ok) serverSaved = true;
    }
  } catch (_) {}

  // 2. Sync directly to Dual Cloud (Google Firebase Firestore + Supabase Cloud Database)
  if (typeof window.publishCmsToDualCloud === 'function') {
    try {
      await window.publishCmsToDualCloud(content);
      cloudSaved = true;
    } catch (_) {}
  } else {
    try {
      const payload = {
        id: 'CMS_SITE_CONTENT_LIVE',
        name: 'CMS_CONFIG_STORE',
        service: 'CMS_STORAGE',
        message: JSON.stringify(content),
        status: 'ACTIVE_CMS'
      };
      const sbRes = await fetch(`${CLOUD_SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          apikey: CLOUD_SUPABASE_KEY,
          Authorization: `Bearer ${CLOUD_SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(payload)
      });
      if (sbRes.ok) {
        cloudSaved = true;
      }
    } catch (cloudErr) {
      console.warn('Supabase cloud save note:', cloudErr);
    }
  }

  // 3. Real-time Instant Broadcast to all open tabs & windows (0ms latency live update)
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flipcut:cms-updated', { detail: content }));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('flipcut_cms_channel');
        bc.postMessage({ type: 'CMS_UPDATED', content: content });
        bc.close();
      }
    }
  } catch (_) {}

  return localSaved || serverSaved || cloudSaved;
}

/**
 * Reset site content to defaults
 */
function resetSiteContentToDefaults() {
  localStorage.removeItem('flipcut_site_content');
  try {
    const apiBase = getContentApiBase();
    fetch(`${apiBase}/api/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(DEFAULT_SITE_CONTENT)
    }).catch(err => { });
  } catch (e) { }
  return DEFAULT_SITE_CONTENT;
}

if (typeof module !== 'undefined') {
  module.exports = {
    DEFAULT_SITE_CONTENT,
    getSiteContent,
    fetchAndSyncSiteContent,
    saveSiteContent,
    resetSiteContentToDefaults
  };
}
