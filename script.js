/**
 * FlipCut Creation - Main Interactive Application Script (INR & CMS Enabled)
 * Powers dynamic DOM hydration from Content Store, Indian Rupee (₹) pricing, and all interactions.
 */

// Version-Aware Intelligent Cache Purge
const FLIPCUT_CURRENT_BUILD = '20260827_V9';
try {
  const lastBuild = localStorage.getItem('flipcut_build_ver');
  if (lastBuild !== FLIPCUT_CURRENT_BUILD) {
    localStorage.setItem('flipcut_build_ver', FLIPCUT_CURRENT_BUILD);
    localStorage.removeItem('flipcut_site_content');
    localStorage.removeItem('flipcut_cms_draft');
  }
} catch (_) {}

// Global Master Content
let siteAppContent = (typeof getSiteContent === 'function') ? getSiteContent() : DEFAULT_SITE_CONTENT;
let content = siteAppContent;

// Real-Time 0ms Live Sync across tabs when Admin publishes
if (typeof window !== 'undefined') {
  window.addEventListener('flipcut:cms-updated', (e) => {
    if (e && e.detail) {
      siteAppContent = e.detail;
      content = siteAppContent;
      hydratePageFromCMS(siteAppContent);
    }
  });

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('flipcut_cms_channel');
      bc.onmessage = (msg) => {
        if (msg && msg.data && msg.data.content) {
          siteAppContent = msg.data.content;
          content = siteAppContent;
          hydratePageFromCMS(siteAppContent);
        }
      };
    }
  } catch (_) {}
}

/* ==========================================================================
   0. DYNAMIC CMS HYDRATION FROM CONTENT STORE (Instant Zero-Flicker Execution)
   ========================================================================== */
function hydratePageFromCMS(customContent) {
  content = customContent || ((typeof getSiteContent === 'function') ? getSiteContent() : siteAppContent);
  siteAppContent = content;
  if (!content) return;

    // 0. COMPREHENSIVE SECTIONS, HEADERS & CARDS VISIBILITY CONTROL
    if (content.sectionsVisibility) {
      const sv = content.sectionsVisibility;
      const setVis = (id, visible) => {
        const el = document.getElementById(id);
        if (el) el.style.display = (visible !== false) ? '' : 'none';
      };

      // 1. Header & Nav Controls
      setVis('heroBadgeWrap', sv.headerBadge);
      setVis('themeToggleBtn', sv.headerThemeToggle);
      setVis('headerCtaBtn', sv.headerCta);
      setVis('navWebinarItem', sv.navWebinarPill);

      // 2. All Major Page Sections
      const isTopAnnOn = (sv.topAnnouncement !== false) && (!content.topAnnouncement || content.topAnnouncement.enabled !== false);
      setVis('topAnnouncementBar', isTopAnnOn);
      setVis('hero', sv.hero);
      setVis('about', sv.about);
      setVis('dailyPrompts', sv.dailyPrompts !== undefined ? sv.dailyPrompts : true);
      setVis('services', sv.services);
      setVis('workflow', sv.workflow);
      setVis('portfolio', sv.portfolio);
      setVis('why-us', sv.whyUs);
      setVis('pricing', sv.pricing);
      setVis('testimonials', sv.testimonials);
      setVis('calculator', sv.calculator);
      setVis('contact', sv.contact);
      setVis('siteFooter', sv.footer);

      // 3. Specific Cards & Feature Modules
      setVis('heroStatsRow', sv.heroStats);
      setVis('heroVisualWrap', sv.heroVideoCard);
      setVis('aboutPillarsGrid', sv.aboutPillars);
      setVis('beforeAfterBox', sv.beforeAfterSlider);
      setVis('portfolioFilterBar', sv.portfolioFilters);
      setVis('whyUsGrid', sv.whyUsGrid);
      setVis('techStackWrap', sv.techStack);
      setVis('contactDriveLink', sv.contactDriveLink);
      setVis('mobileFloatingWa', sv.floatingWhatsApp);
      setVis('backToTopBtn', sv.backToTopBtn);
    }

    // 0.1 TOP ANNOUNCEMENT & OFFER STATIC BANNER
    const topBar = document.getElementById('topAnnouncementBar');
    const annData = content.topAnnouncement || {
      enabled: true,
      badge: '🔥 LIVE MASTERCLASS',
      text: 'Exclusive Web Creation & Scaling Masterclass at <strong>₹199 Only!</strong>',
      btnText: 'Book Ticket Pass',
      btnUrl: 'webinar.html'
    };

    const isTopAnnActive = (!content.sectionsVisibility || content.sectionsVisibility.topAnnouncement !== false) &&
                           (annData.enabled !== false);

    const webinarPrice = (content.webinar && content.webinar.price) ? String(content.webinar.price).replace(/[^0-9]/g, '') : '199';

    if (topBar) {
      if (!isTopAnnActive) {
        topBar.classList.add('is-hidden');
        document.documentElement.classList.remove('has-announcement');
        document.body.classList.remove('has-announcement');
      } else {
        topBar.classList.remove('is-hidden');
        document.documentElement.classList.add('has-announcement');
        document.body.classList.add('has-announcement');
        const badgeText = document.getElementById('topAnnouncementBadgeText');
        const textEl = document.getElementById('topAnnouncementText');
        const btnEl = document.getElementById('topAnnouncementCtaBtn');
        const btnText = document.getElementById('topAnnouncementBtnText');

        if (badgeText && annData.badge) badgeText.textContent = annData.badge;
        if (textEl) {
          let rawText = annData.text || 'Exclusive Web Creation & Scaling Masterclass at <strong>₹199 Only!</strong>';
          rawText = rawText.replace(/₹\s*\d+/g, '₹' + webinarPrice);
          textEl.innerHTML = rawText;
        }
        if (btnEl && annData.btnUrl) btnEl.href = annData.btnUrl;
        if (btnText && annData.btnText) btnText.textContent = annData.btnText;
      }
    }

    // 1. Header & Brand
    const headerBadgeText = document.getElementById('headerBadgeText');
    if (headerBadgeText && content.brand) headerBadgeText.textContent = content.brand.headerBadge || '';

    // Desktop Nav Link
    const navWebinarLink = document.querySelector('#navWebinarItem a');
    if (navWebinarLink) {
      navWebinarLink.innerHTML = `<i class="fa-solid fa-ticket"></i> Webinar (₹${webinarPrice})`;
    }

    // Mobile Nav Drawer Link
    const mobileNavWebinarSpan = document.querySelector('.mobile-nav-links a[href="webinar.html"] span');
    if (mobileNavWebinarSpan) {
      mobileNavWebinarSpan.textContent = `Live Masterclass Webinar (₹${webinarPrice})`;
    }

    const brandLogos = document.querySelectorAll('.brand-logo-img');
    const customLogoHeight = (content.brand && content.brand.logoHeight) ? content.brand.logoHeight : 60;
    brandLogos.forEach(img => {
      if (content.brand && content.brand.logoUrl) img.src = content.brand.logoUrl;
      img.style.setProperty('height', `${customLogoHeight}px`, 'important');
      img.style.maxHeight = '140px';
    });

    // Universal Dynamic Favicon Update from CMS
    if (content.brand && content.brand.faviconUrl) {
      if (typeof window.applyDynamicFavicon === 'function') {
        window.applyDynamicFavicon(content.brand.faviconUrl);
      }
    }

    // 2. Hero Section
    const heroTitle = document.getElementById('heroTitle');
    if (heroTitle && content.hero) {
      heroTitle.innerHTML = `${content.hero.titlePrefix || ''}<span class="text-gradient">${content.hero.titleGradient || ''}</span>${content.hero.titleSuffix || ''}`;
    }

    const heroDesc = document.getElementById('heroDescription');
    if (heroDesc && content.hero) heroDesc.textContent = content.hero.description || '';

    const heroStat1Num = document.getElementById('heroStat1Num');
    const heroStat1Lbl = document.getElementById('heroStat1Lbl');
    if (heroStat1Num && content.hero) heroStat1Num.textContent = content.hero.stat1Number || '50M+';
    if (heroStat1Lbl && content.hero) heroStat1Lbl.textContent = content.hero.stat1Label || 'Organic Views';

    const heroStat2Num = document.getElementById('heroStat2Num');
    const heroStat2Lbl = document.getElementById('heroStat2Lbl');
    if (heroStat2Num && content.hero) heroStat2Num.textContent = content.hero.stat2Number || '99.4%';
    if (heroStat2Lbl && content.hero) heroStat2Lbl.textContent = content.hero.stat2Label || 'Client Retention';

    const heroStat3Num = document.getElementById('heroStat3Num');
    const heroStat3Lbl = document.getElementById('heroStat3Lbl');
    if (heroStat3Num && content.hero) heroStat3Num.textContent = content.hero.stat3Number || '24-48h';
    if (heroStat3Lbl && content.hero) heroStat3Lbl.textContent = content.hero.stat3Label || 'Avg Turnaround';

    const heroStat4Num = document.getElementById('heroStat4Num');
    const heroStat4Lbl = document.getElementById('heroStat4Lbl');
    if (heroStat4Num && content.hero) heroStat4Num.textContent = content.hero.stat4Number || '500+';
    if (heroStat4Lbl && content.hero) heroStat4Lbl.textContent = content.hero.stat4Label || 'Videos Delivered';

    const heroPreviewImgEl = document.getElementById('heroVideoPreviewImg') || document.querySelector('.video-screen-frame img');
    if (heroPreviewImgEl && content.hero && content.hero.videoPreviewImg) {
      heroPreviewImgEl.src = formatMediaUrl(content.hero.videoPreviewImg, 'image');
    }

    // 3. About & 3 Pillars
    if (content.about) {
      const aboutSub = document.getElementById('aboutSubtitle');
      const aboutTtl = document.getElementById('aboutTitle');
      const aboutDsc = document.getElementById('aboutDescription');
      if (aboutSub && content.about.subtitle) aboutSub.textContent = content.about.subtitle;
      if (aboutTtl && content.about.title) aboutTtl.textContent = content.about.title;
      if (aboutDsc && content.about.description) aboutDsc.textContent = content.about.description;

      const p1T = document.getElementById('pillar1Title');
      const p1D = document.getElementById('pillar1Desc');
      if (p1T && content.about.pillar1Title) p1T.textContent = content.about.pillar1Title;
      if (p1D && content.about.pillar1Desc) p1D.textContent = content.about.pillar1Desc;

      const p2T = document.getElementById('pillar2Title');
      const p2D = document.getElementById('pillar2Desc');
      if (p2T && content.about.pillar2Title) p2T.textContent = content.about.pillar2Title;
      if (p2D && content.about.pillar2Desc) p2D.textContent = content.about.pillar2Desc;

      const p3T = document.getElementById('pillar3Title');
      const p3D = document.getElementById('pillar3Desc');
      if (p3T && content.about.pillar3Title) p3T.textContent = content.about.pillar3Title;
      if (p3D && content.about.pillar3Desc) p3D.textContent = content.about.pillar3Desc;
    }

    // 3.1 Daily Creative Image & AI Text Prompt Spotlight
    try {
      if (content.dailyPrompts) {
        const dpSub = document.getElementById('dailyPromptSubtitle');
        const dpTtl = document.getElementById('dailyPromptTitle');
        const dpDsc = document.getElementById('dailyPromptDescription');
        if (dpSub && content.dailyPrompts.subtitle) dpSub.textContent = content.dailyPrompts.subtitle;
        if (dpTtl && content.dailyPrompts.title) dpTtl.textContent = content.dailyPrompts.title;
        if (dpDsc && content.dailyPrompts.description) dpDsc.textContent = content.dailyPrompts.description;

        renderFrontendDailyPrompts(content);
      }
    } catch (dpErr) {
      console.warn('Daily prompts hydration note:', dpErr);
    }

    // 4. Services Grid
    try {
      if (content.services) {
        const srvSub = document.getElementById('servicesSubtitle');
        const srvTtl = document.getElementById('servicesTitle');
        const srvDsc = document.getElementById('servicesDescription');
        if (srvSub && content.services.subtitle) srvSub.textContent = content.services.subtitle;
        if (srvTtl && content.services.title) srvTtl.textContent = content.services.title;
        if (srvDsc && content.services.description) srvDsc.textContent = content.services.description;

        const srvGrid = document.getElementById('servicesGrid');
        if (srvGrid && content.services.items && content.services.items.length > 0) {
          srvGrid.innerHTML = '';
          // Filter out empty placeholder cards if any
          const activeServices = content.services.items.filter(s => (s.title && s.title.trim()) || (s.badge && s.badge.trim()));
          
          activeServices.forEach(srv => {
            const srvBox = document.createElement('div');
            srvBox.className = 'service-box';
            let featuresHtml = '';
            if (srv.features && Array.isArray(srv.features) && srv.features.length > 0) {
              featuresHtml = srv.features.filter(f => f && f.trim()).map(f => `<li><i class="fa-solid fa-check text-gradient"></i> ${f}</li>`).join('');
            } else {
              featuresHtml = `<li><i class="fa-solid fa-check text-gradient"></i> Premium Turnkey Delivery</li>`;
            }

            const btnText = srv.btnText || (`Order ${srv.badge || 'Service'}`);
            const btnLink = srv.btnLink || '#contact';
            const iconClass = srv.icon || 'fa-solid fa-wand-magic-sparkles';
            const escapedName = (srv.title || srv.badge || '').replace(/'/g, "\\'");

            srvBox.innerHTML = `
              <div>
                <div class="service-header">
                  <span class="service-badge">${srv.badge || 'Service'}</span>
                  <i class="${iconClass} text-gradient" style="font-size: 1.45rem;"></i>
                </div>
                <h3>${srv.title || ''}</h3>
                <p>${srv.desc || ''}</p>
                <ul class="service-features-list">
                  ${featuresHtml}
                </ul>
              </div>
              <a href="${btnLink}" class="btn btn-secondary" onclick="window.selectServiceInContact('${escapedName}')" style="width: 100%; justify-content: center;">${btnText}</a>
            `;
            srvGrid.appendChild(srvBox);
          });
        }
      }
    } catch (srvErr) {
      console.warn('Services hydration note:', srvErr);
    }

    // 4.1 Workflow 5-Step Pipeline
    try {
      if (content.workflow) {
        const wfSub = document.getElementById('workflowSubtitle');
        const wfTtl = document.getElementById('workflowTitle') || document.querySelector('#workflow .section-header h2');
        const wfDsc = document.getElementById('workflowDesc') || document.querySelector('#workflow .section-header p');
        if (wfSub && content.workflow.subtitle) wfSub.textContent = content.workflow.subtitle;
        if (wfTtl && content.workflow.title) wfTtl.textContent = content.workflow.title;
        if (wfDsc && content.workflow.description) wfDsc.textContent = content.workflow.description;

        if (content.workflow.steps && Array.isArray(content.workflow.steps) && content.workflow.steps.length > 0) {
          const track = document.getElementById('workflowStepsTrack') || document.querySelector('.workflow-steps-track');
          if (track) {
            track.innerHTML = content.workflow.steps.map((st, idx) => `
              <div class="workflow-step-card">
                <div class="step-number-bubble">${st.step || (idx + 1)}</div>
                <h4>${st.title || 'Pipeline Step'}</h4>
                <p>${st.desc || ''}</p>
              </div>
            `).join('');
          }
        }
      }
    } catch (wfErr) {
      console.warn('Workflow hydration note:', wfErr);
    }

    // 5. Portfolio Showcase
    try {
      if (content.portfolio) {
        const pfSub = document.getElementById('portfolioSubtitle');
        if (pfSub && content.portfolio.subtitle) pfSub.textContent = content.portfolio.subtitle;

        renderFrontendPortfolio(content);
      }
    } catch (pfErr) {
      console.warn('Portfolio hydration note:', pfErr);
    }

    // 5.1 Why Choose Us & Creative Tooling
    try {
      if (content.whyUs) {
        const whySub = document.getElementById('whySubtitle');
        const whyTtl = document.getElementById('whyTitle');
        const whyDsc = document.getElementById('whyDesc');
        if (whySub && content.whyUs.subtitle) whySub.textContent = content.whyUs.subtitle;
        if (whyTtl && content.whyUs.title) whyTtl.textContent = content.whyUs.title;
        if (whyDsc && content.whyUs.description) whyDsc.textContent = content.whyUs.description;

        if (content.whyUs.features && Array.isArray(content.whyUs.features) && content.whyUs.features.length > 0) {
          const grid = document.getElementById('whyUsGrid');
          if (grid) {
            grid.innerHTML = content.whyUs.features.map(f => `
              <div class="why-feature-box">
                <span class="why-icon text-gradient"><i class="${f.icon || 'fa-solid fa-headset'}"></i></span>
                <h4>${f.title || ''}</h4>
                <p>${f.desc || ''}</p>
              </div>
            `).join('');
          }
        }

        const techTitle = document.getElementById('techStackTitle');
        if (techTitle && content.whyUs.toolingTitle) techTitle.textContent = content.whyUs.toolingTitle;

        if (content.whyUs.tools && Array.isArray(content.whyUs.tools) && content.whyUs.tools.length > 0) {
          const badgesRow = document.getElementById('techBadgesRow');
          if (badgesRow) {
            badgesRow.innerHTML = content.whyUs.tools.map(t => `
              <div class="tech-badge-item"><i class="${t.icon || 'fa-solid fa-cube'}" style="color: ${t.color || '#9999FF'};"></i> ${t.name || ''}</div>
            `).join('');
          }
        }
      }
    } catch (whyErr) {
      console.warn('Why Choose Us hydration note:', whyErr);
    }

    // 6. Pricing Plans (INR ₹)
    if (content.pricing) {
      const prSub = document.getElementById('pricingSubtitle');
      if (prSub && content.pricing.subtitle) prSub.textContent = content.pricing.subtitle;

      const pTitle = document.getElementById('pricingTitle');
      const pDesc = document.getElementById('pricingDesc');
      if (pTitle && content.pricing.title) pTitle.textContent = content.pricing.title;
      if (pDesc && content.pricing.description) pDesc.textContent = content.pricing.description;

      const pricingGrid = document.getElementById('pricingGrid');
      if (pricingGrid && (content.pricing.starter || content.pricing.growth || content.pricing.enterprise)) {
        pricingGrid.innerHTML = '';

        // Starter
        if (content.pricing.starter) {
          const st = content.pricing.starter;
          const feats = (st.features || []).map(f => `<li><i class="fa-solid fa-circle-check text-gradient"></i> ${f}</li>`).join('');
          const c1 = document.createElement('div');
          c1.className = 'pricing-card';
          c1.innerHTML = `
            <div class="pricing-header">
              <h3>${st.name || 'Starter Creator'}</h3>
              <p>${st.desc || ''}</p>
              <div class="pricing-price-wrap">
                <span class="price-amount">₹${st.price || '14,999'}</span>
                <span class="price-period">${st.period || '/ month'}</span>
              </div>
              <ul class="pricing-feature-list">
                ${feats}
              </ul>
            </div>
            <button type="button" class="btn btn-secondary" onclick="window.startPlanCheckout('${st.name || 'Starter Creator'}', '${st.price || '14,999'}')" style="width: 100%; cursor: pointer;">${st.btnText || 'Select Starter'}</button>
          `;
          pricingGrid.appendChild(c1);
        }

        // Pro Growth (Featured)
        if (content.pricing.growth) {
          const gr = content.pricing.growth;
          const feats = (gr.features || []).map(f => `<li><i class="fa-solid fa-circle-check text-gradient"></i> ${f}</li>`).join('');
          const c2 = document.createElement('div');
          c2.className = 'pricing-card featured-plan is-active-mobile';
          c2.innerHTML = `
            <div class="pricing-badge-popular">${gr.popularBadge || 'Most Popular Choice'}</div>
            <div class="pricing-header">
              <h3>${gr.name || 'Pro Growth Tier'}</h3>
              <p>${gr.desc || ''}</p>
              <div class="pricing-price-wrap">
                <span class="price-amount">₹${gr.price || '34,999'}</span>
                <span class="price-period">${gr.period || '/ month'}</span>
              </div>
              <ul class="pricing-feature-list">
                ${feats}
              </ul>
            </div>
            <button type="button" class="btn btn-primary" onclick="window.startPlanCheckout('${gr.name || 'Pro Growth Tier'}', '${gr.price || '34,999'}')" style="width: 100%; cursor: pointer;">
              <span>${gr.btnText || 'Select Pro Growth'}</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          `;
          pricingGrid.appendChild(c2);
        }

        // Studio Enterprise
        if (content.pricing.enterprise) {
          const ent = content.pricing.enterprise;
          const feats = (ent.features || []).map(f => `<li><i class="fa-solid fa-circle-check text-gradient"></i> ${f}</li>`).join('');
          const c3 = document.createElement('div');
          c3.className = 'pricing-card';
          c3.innerHTML = `
            <div class="pricing-header">
              <h3>${ent.name || 'Studio Enterprise'}</h3>
              <p>${ent.desc || ''}</p>
              <div class="pricing-price-wrap">
                <span class="price-amount">₹${ent.price || '69,999'}</span>
                <span class="price-period">${ent.period || '/ month'}</span>
              </div>
              <ul class="pricing-feature-list">
                ${feats}
              </ul>
            </div>
            <button type="button" class="btn btn-secondary" onclick="window.startPlanCheckout('${ent.name || 'Studio Enterprise'}', '${ent.price || '69,999'}')" style="width: 100%; cursor: pointer;">${ent.btnText || 'Contact Enterprise'}</button>
          `;
          pricingGrid.appendChild(c3);
        }

        if (typeof window.switchPricingPlan === 'function') {
          window.switchPricingPlan(window.__activePlanIndex !== undefined ? window.__activePlanIndex : 1);
        }
      }
    }

    // 7. Testimonials Grid
    if (content.testimonials) {
      const tSub = document.getElementById('testimonialsSubtitle');
      if (tSub && content.testimonials.subtitle) tSub.textContent = content.testimonials.subtitle;

      const tGrid = document.getElementById('testimonialsGrid');
      if (tGrid && content.testimonials.items && content.testimonials.items.length > 0) {
        tGrid.innerHTML = '';
        content.testimonials.items.forEach(item => {
          const tCard = document.createElement('div');
          tCard.className = 'testimonial-card';
          const initials = (item.author || 'FC').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
          tCard.innerHTML = `
            <div class="testimonial-stars">
              <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
            </div>
            <p class="testimonial-quote">"${item.quote || ''}"</p>
            <div class="testimonial-author-wrap">
              <div class="author-avatar">${initials}</div>
              <div class="author-info">
                <h4>${item.author || 'Creator'}</h4>
                <span>${item.role || 'Partner'}</span>
              </div>
            </div>
          `;
          tGrid.appendChild(tCard);
        });
      }
    }

    // 8. FAQ Accordion
    if (content.faq) {
      const faqTitle = document.getElementById('faqHeaderTitle');
      if (faqTitle && content.faq.title) faqTitle.textContent = content.faq.title;

      if (content.faq.items) {
        const faqWrap = document.getElementById('faqAccordionWrap');
        if (faqWrap && content.faq.items.length > 0) {
          faqWrap.innerHTML = '';
          content.faq.items.forEach((item, idx) => {
            const faqItem = document.createElement('div');
            faqItem.className = `faq-item ${idx === 0 ? 'active' : ''}`;
            faqItem.innerHTML = `
              <button class="faq-question-btn">
                <span>${item.q || ''}</span>
                <i class="fa-solid fa-chevron-down faq-chevron"></i>
              </button>
              <div class="faq-answer" style="${idx === 0 ? 'max-height: 180px;' : ''}">
                <div class="faq-answer-content">
                  ${item.a || ''}
                </div>
              </div>
            `;
            faqWrap.appendChild(faqItem);
          });
        }
      }
    }

    // 9. Contact Section & Footer Links
    if (content.contact) {
      const cntSub = document.getElementById('contactSubtitle');
      if (cntSub && content.contact.subtitle) cntSub.textContent = content.contact.subtitle;

      const cTitle = document.getElementById('contactTitle');
      const cDesc = document.getElementById('contactDesc');
      if (cTitle && content.contact.title) cTitle.textContent = content.contact.title;
      if (cDesc && content.contact.description) cDesc.textContent = content.contact.description;

      // Form Field Labels & Placeholders
      if (content.contact.formLabels) {
        const fl = content.contact.formLabels;
        const setTxt = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
        const setPh = (id, val) => { const el = document.getElementById(id); if (el && val) el.placeholder = val; };

        setTxt('lblClientName', fl.nameLabel);
        setPh('clientName', fl.namePlaceholder);

        setTxt('lblClientEmail', fl.emailLabel);
        setPh('clientEmail', fl.emailPlaceholder);

        setTxt('lblClientPhone', fl.phoneLabel);
        setPh('clientPhone', fl.phonePlaceholder);

        setTxt('lblProjectType', fl.serviceLabel);
        setTxt('lblProjectBudget', fl.budgetLabel);

        setTxt('lblProjectFootage', fl.footageLabel);
        setPh('projectFootageUrl', fl.footagePlaceholder);

        setTxt('contactDriveLinkText', fl.driveLinkText);
        const driveLink = document.getElementById('contactDriveLink');
        if (driveLink && fl.driveLinkUrl) driveLink.href = fl.driveLinkUrl;

        setTxt('lblProjectNotes', fl.notesLabel);
        setPh('projectNotes', fl.notesPlaceholder);
      }

      // Budget Options (Amounts / Ranges)
      if (content.contact.budgetOptions && Array.isArray(content.contact.budgetOptions)) {
        const budgetSel = document.getElementById('projectBudget');
        if (budgetSel && content.contact.budgetOptions.length > 0) {
          budgetSel.innerHTML = '';
          content.contact.budgetOptions.forEach((opt, idx) => {
            const optEl = document.createElement('option');
            optEl.value = opt.value || opt.label;
            optEl.textContent = opt.label;
            if (idx === 1) optEl.selected = true;
            budgetSel.appendChild(optEl);
          });
        }
      }

      // Service Options
      if (content.contact.serviceOptions && Array.isArray(content.contact.serviceOptions)) {
        const srvSel = document.getElementById('projectTypeSelect');
        if (srvSel && content.contact.serviceOptions.length > 0) {
          srvSel.innerHTML = '';
          content.contact.serviceOptions.forEach((opt, idx) => {
            const optEl = document.createElement('option');
            optEl.value = opt.value || opt.label;
            optEl.textContent = opt.label;
            srvSel.appendChild(optEl);
          });
        }
      }

      const subBtnText = document.getElementById('contactSubmitBtnText');
      if (subBtnText && content.contact.submitBtnText) subBtnText.textContent = content.contact.submitBtnText;

      const waBtnText = document.getElementById('contactWhatsappBtnText');
      if (waBtnText && content.contact.whatsappBtnText) waBtnText.textContent = content.contact.whatsappBtnText;

      const waBtn = document.getElementById('contactWhatsappBtn');
      const mobileFloatingWa = document.getElementById('mobileFloatingWa');
      const mobileNavWhatsapp = document.getElementById('mobileNavWhatsapp');

      if (content.contact.whatsappNum) {
        const cleanNum = content.contact.whatsappNum.replace(/[^0-9]/g, '');
        const msg = encodeURIComponent(content.contact.whatsappMessage || 'Hi FlipCut Creation, I would like to discuss a video editing project!');
        const waUrl = `https://wa.me/${cleanNum}?text=${msg}`;
        if (waBtn) waBtn.href = waUrl;
        if (mobileFloatingWa) mobileFloatingWa.href = waUrl;
        if (mobileNavWhatsapp) mobileNavWhatsapp.href = waUrl;
      }

      // Legacy contact footer overrides
      if (content.contact.copyrightText) {
        const footerCopy = document.getElementById('footerCopyrightText');
        if (footerCopy) footerCopy.textContent = content.contact.copyrightText;
      }
    }

    // 10. Footer Section CMS Hydration
    try {
      const footerData = content.footer || {};
      const contactData = content.contact || {};

      const footerDesc = document.getElementById('footerBrandDesc');
      if (footerDesc && footerData.brandDesc) footerDesc.textContent = footerData.brandDesc;

      const navTtl = document.getElementById('footerNavTitle');
      if (navTtl && footerData.navTitle) navTtl.textContent = footerData.navTitle;

      const srvTtl = document.getElementById('footerServicesTitle');
      if (srvTtl && footerData.servicesTitle) srvTtl.textContent = footerData.servicesTitle;

      const connTtl = document.getElementById('footerConnectTitle');
      if (connTtl && footerData.connectTitle) connTtl.textContent = footerData.connectTitle;

      const footerEmail = document.getElementById('footerEmailLink');
      const emailVal = footerData.email || contactData.email;
      if (footerEmail && emailVal) {
        footerEmail.innerHTML = `<i class="fa-solid fa-envelope"></i> ${emailVal}`;
        footerEmail.href = `mailto:${emailVal}`;
      }

      const footerInstaAnchor = document.getElementById('footerInstagramAnchor');
      const footerInsta = document.getElementById('footerInstagramLink');
      const instaHandle = footerData.instagramHandle || footerData.instagramUrl || contactData.instagramHandle;
      const instaUrl = footerData.instagramUrl || (instaHandle && instaHandle.startsWith('http') ? instaHandle : (instaHandle ? `https://instagram.com/${instaHandle.replace('@', '')}` : 'https://instagram.com'));
      if (footerInsta && instaHandle) footerInsta.textContent = instaHandle;
      if (footerInstaAnchor && instaUrl) footerInstaAnchor.href = instaUrl;

      const footerYtAnchor = document.getElementById('footerYoutubeAnchor');
      const footerYt = document.getElementById('footerYoutubeLink');
      const ytChannel = footerData.youtubeChannel || footerData.youtubeUrl || contactData.youtubeChannel;
      const ytUrl = footerData.youtubeUrl || (ytChannel && ytChannel.startsWith('http') ? ytChannel : (ytChannel ? `https://youtube.com/${ytChannel.replace('@', '')}` : 'https://youtube.com'));
      if (footerYt && ytChannel) footerYt.textContent = ytChannel;
      if (footerYtAnchor && ytUrl) footerYtAnchor.href = ytUrl;

      const footerWaAnchor = document.getElementById('footerWhatsappAnchor');
      const footerWa = document.getElementById('footerWhatsappLink');
      const waText = footerData.whatsappText || 'WhatsApp Chat';
      const waNum = footerData.whatsappNum || contactData.whatsappNum;
      const waUrl = footerData.whatsappUrl || (waNum ? `https://wa.me/${String(waNum).replace(/[^0-9]/g, '')}` : 'https://wa.me/917010270151');
      if (footerWa) footerWa.textContent = waText;
      if (footerWaAnchor) footerWaAnchor.href = waUrl;

      const footerCopy = document.getElementById('footerCopyrightText');
      const copyVal = footerData.copyrightText || contactData.copyrightText;
      if (footerCopy && copyVal) footerCopy.textContent = copyVal;

      const footerTagline = document.getElementById('footerTaglineText');
      if (footerTagline && footerData.tagline) footerTagline.textContent = footerData.tagline;
    } catch (ftErr) {
      console.warn('Footer hydration note:', ftErr);
    }

    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.add('hydrated');
    }
  }

  window.hydratePageFromCMS = hydratePageFromCMS;

  // Immediate synchronous execution on file load (0ms Pre-Paint)
  try {
    hydratePageFromCMS();
  } catch (_) {}

  /* ==========================================================================
     TOAST NOTIFICATION HELPER
     ========================================================================== */
  function showToast(message, borderColor = 'var(--brand-indigo)') {
    const toast = document.getElementById('toastBox');
    const msg = document.getElementById('toastMsg');
    if (!toast || !msg) return;
    msg.textContent = message;
    toast.style.borderColor = borderColor;
    toast.classList.add('show');
    clearTimeout(toast.toastTimeout);
    toast.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
  window.showToast = showToast;

  document.addEventListener('DOMContentLoaded', () => {

    // 1. Re-run hydration on DOM ready to guarantee 100% element capture
    hydratePageFromCMS();

    // 2. Background Cloud fetch & silent sync
    if (typeof fetchAndSyncSiteContent === 'function') {
      fetchAndSyncSiteContent().then(latestContent => {
        if (latestContent) {
          siteAppContent = latestContent;
          hydratePageFromCMS(latestContent);
        }
      }).catch(() => {});
    }

  /* ==========================================================================
     MOBILE NAVIGATION DRAWER & TOUCH HANDLERS
     ========================================================================== */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  const mobileNavCloseBtn = document.getElementById('mobileNavCloseBtn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, #mobileNavCta, #mobileNavWhatsapp');

  function openMobileNav(e) {
    if (e && e.cancelable && e.type !== 'click') e.preventDefault();
    if (mobileNavDrawer) mobileNavDrawer.classList.add('active');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.add('active');
    if (mobileMenuBtn) {
      mobileMenuBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      mobileMenuBtn.setAttribute('aria-label', 'Close Menu');
      mobileMenuBtn.classList.add('is-open');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav(e) {
    if (e && e.cancelable && e.type !== 'click') e.preventDefault();
    if (mobileNavDrawer) mobileNavDrawer.classList.remove('active');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.remove('active');
    if (mobileMenuBtn) {
      mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars-staggered"></i>';
      mobileMenuBtn.setAttribute('aria-label', 'Open Menu');
      mobileMenuBtn.classList.remove('is-open');
    }
    document.body.style.overflow = '';
  }

  function toggleMobileNav(e) {
    if (e) e.stopPropagation();
    if (mobileNavDrawer && mobileNavDrawer.classList.contains('active')) {
      closeMobileNav(e);
    } else {
      openMobileNav(e);
    }
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileNav);
    mobileMenuBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      toggleMobileNav(e);
    });
  }

  if (mobileNavCloseBtn) {
    mobileNavCloseBtn.addEventListener('click', closeMobileNav);
    mobileNavCloseBtn.addEventListener('touchend', closeMobileNav);
  }
  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', closeMobileNav);
    mobileNavBackdrop.addEventListener('touchend', closeMobileNav);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });

  /* ==========================================================================
     1. THEME TOGGLE (Luxury White Mode Default / Dark Mode)
     ========================================================================== */
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const htmlElement = document.documentElement;

  function updateThemeUI(isDark) {
    if (isDark) {
      htmlElement.setAttribute('data-theme', 'dark');
      themeToggleBtns.forEach(btn => {
        btn.innerHTML = '<i class="fa-solid fa-sun" style="color: #F59E0B;"></i>';
        btn.setAttribute('title', 'Switch to Luxury Light Mode');
        btn.setAttribute('aria-label', 'Switch to Luxury Light Mode');
      });
    } else {
      htmlElement.removeAttribute('data-theme');
      themeToggleBtns.forEach(btn => {
        btn.innerHTML = '<i class="fa-solid fa-moon" style="color: #6366F1;"></i>';
        btn.setAttribute('title', 'Switch to Cinematic Dark Mode');
        btn.setAttribute('aria-label', 'Switch to Cinematic Dark Mode');
      });
    }
  }

  const savedTheme = localStorage.getItem('flipcut_theme') || 'light';
  updateThemeUI(savedTheme === 'dark');

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCurrentlyDark = htmlElement.getAttribute('data-theme') === 'dark';
      if (isCurrentlyDark) {
        localStorage.setItem('flipcut_theme', 'light');
        updateThemeUI(false);
        showToast('Switched to Luxury Light Mode ☀️');
      } else {
        localStorage.setItem('flipcut_theme', 'dark');
        updateThemeUI(true);
        showToast('Switched to Cinematic Dark Mode 🌙');
      }
    });

    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      btn.click();
    });
  });

  /* ==========================================================================
     2. STICKY HEADER & BACK-TO-TOP SCROLL LISTENER
     ========================================================================== */
  const siteHeader = document.getElementById('siteHeader');
  const backToTopBtn = document.getElementById('backToTopBtn');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    if (siteHeader) {
      if (scrollPos > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    if (backToTopBtn) {
      if (scrollPos > 500) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     3. INTERACTIVE BEFORE & AFTER COMPARISON SLIDER (DaVinci Resolve Grade)
     ========================================================================== */
  const sliderContainer = document.getElementById('beforeAfterSlider');
  const beforeWrap = document.getElementById('beforeWrap');
  const beforeImg = document.getElementById('beforeImg');
  const sliderHandle = document.getElementById('sliderHandle');

  if (sliderContainer && beforeWrap && beforeImg && sliderHandle) {
    let isDragging = false;

    function setSliderPosition(xPos) {
      const rect = sliderContainer.getBoundingClientRect();
      let offsetX = xPos - rect.left;
      
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;

      const percentage = (offsetX / rect.width) * 100;

      beforeWrap.style.width = `${percentage}%`;
      sliderHandle.style.left = `${percentage}%`;
      beforeImg.style.width = `${rect.width}px`;
    }

    function syncSliderImgWidth() {
      if (sliderContainer && beforeImg) {
        beforeImg.style.width = `${sliderContainer.offsetWidth}px`;
      }
    }

    window.addEventListener('resize', syncSliderImgWidth);
    syncSliderImgWidth();

    // Mouse Events
    sliderContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      setSliderPosition(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      setSliderPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch Events for Mobile / Tablet
    sliderContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches.length > 0) {
        setSliderPosition(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches.length > 0) {
        setSliderPosition(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  /* ==========================================================================
     4. REAL-TIME DYNAMIC PROJECT COST CALCULATOR (IN RUPEES ₹)
     ========================================================================== */
  const formatNames = {
    'reels': 'Viral Short-Form',
    'youtube': 'YouTube Long-Form',
    'commercial': 'Commercial / Ad',
    'motion': '3D Motion Graphics'
  };

  const DEFAULT_CALC_RATES = {
    reels: 1500,
    youtube: 4500,
    commercial: 9999,
    motion: 6500
  };

  const DEFAULT_CALC_ADDONS = {
    thumb: 499,
    express: 1499,
    raw: 999
  };

  function updateCostCalculation() {
    if (!document.getElementById('videoVolumeSlider')) return;
    try {
      const formatRadios = document.querySelectorAll('input[name="calcFormat"]');
      const volumeSlider = document.getElementById('videoVolumeSlider');
      const volumeCountDisplay = document.getElementById('volumeCountDisplay');
      const addonThumb = document.getElementById('addonThumb');
      const addonExpress = document.getElementById('addonExpress');
      const addonRaw = document.getElementById('addonRaw');

      const summaryFormatName = document.getElementById('summaryFormatName');
      const summaryQuantity = document.getElementById('summaryQuantity');
      const summaryDiscount = document.getElementById('summaryDiscount');
      const summaryAddons = document.getElementById('summaryAddons');
      const summaryTotalAmount = document.getElementById('summaryTotalAmount');

      // 1. Base rate in INR (₹)
      const baseRates = (content && content.calculator && content.calculator.baseRates)
        ? Object.assign({}, DEFAULT_CALC_RATES, content.calculator.baseRates)
        : DEFAULT_CALC_RATES;

      const addonsConfig = (content && content.calculator && content.calculator.addons)
        ? Object.assign({}, DEFAULT_CALC_ADDONS, content.calculator.addons)
        : DEFAULT_CALC_ADDONS;

      let baseRate = 1500;
      let formatKey = 'reels';

      formatRadios.forEach(radio => {
        if (radio.checked) {
          formatKey = radio.value;
          baseRate = baseRates[formatKey] || parseFloat(radio.dataset.base) || 1500;
        }
      });

      // 2. Video Quantity
      let count = 4;
      if (volumeSlider) {
        const parsed = parseInt(volumeSlider.value);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 20) {
          count = parsed;
        }
        // Visual gradient track fill
        const percent = ((count - 1) / (20 - 1)) * 100;
        volumeSlider.style.background = `linear-gradient(to right, #6366F1 0%, #7C3AED ${percent}%, var(--border-medium) ${percent}%, var(--border-medium) 100%)`;
      }

      if (volumeCountDisplay) {
        volumeCountDisplay.textContent = `${count} ${count === 1 ? 'Video' : 'Videos'}`;
      }

      // Highlight active preset button if match
      document.querySelectorAll('.calc-preset-btn').forEach(btn => {
        const q = parseInt(btn.getAttribute('data-qty'));
        if (q === count) {
          btn.style.background = 'var(--brand-indigo)';
          btn.style.color = '#FFFFFF';
          btn.style.borderColor = 'var(--brand-indigo)';
        } else {
          btn.style.background = 'var(--bg-tertiary)';
          btn.style.color = 'var(--text-secondary)';
          btn.style.borderColor = 'var(--border-medium)';
        }
      });

      // 3. Volume Discount Tier
      let discountPercent = 0;
      if (count >= 12) {
        discountPercent = 0.15; // 15% OFF
      } else if (count >= 8) {
        discountPercent = 0.10; // 10% OFF
      } else if (count >= 4) {
        discountPercent = 0.10; // 10% OFF
      } else if (count >= 2) {
        discountPercent = 0.05; // 5% OFF
      }

      const subtotal = baseRate * count;
      const discountAmount = subtotal * discountPercent;
      const discountedBase = subtotal - discountAmount;

      // 4. Calculate Add-ons in INR (₹)
      let addonsTotal = 0;
      if (addonThumb && addonThumb.checked) {
        const thumbRate = addonsConfig.thumb || 499;
        addonsTotal += (thumbRate * count);
      }
      if (addonExpress && addonExpress.checked) {
        const expressRate = addonsConfig.express || 1499;
        addonsTotal += expressRate;
      }
      if (addonRaw && addonRaw.checked) {
        const rawRate = addonsConfig.raw || 999;
        addonsTotal += rawRate;
      }

      const grandTotal = Math.round(discountedBase + addonsTotal);

      // 5. Update UI Summary in INR (₹)
      if (summaryFormatName) summaryFormatName.textContent = formatNames[formatKey] || 'Viral Short-Form';
      if (summaryQuantity) summaryQuantity.textContent = `${count} ${count === 1 ? 'Video' : 'Videos'}`;
      if (summaryDiscount) {
        summaryDiscount.textContent = discountPercent > 0 ? `${Math.round(discountPercent * 100)}% OFF` : 'Standard Rate';
        summaryDiscount.style.color = discountPercent > 0 ? '#10B981' : 'var(--text-muted)';
      }
      if (summaryAddons) summaryAddons.textContent = `₹${addonsTotal.toLocaleString('en-IN')}`;
      if (summaryTotalAmount) summaryTotalAmount.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
    } catch (calcErr) {
      console.error('Calculator calculation error:', calcErr);
    }
  }

  window.updateCostCalculation = updateCostCalculation;

  window.stepCalcQty = function(delta) {
    const slider = document.getElementById('videoVolumeSlider');
    if (!slider) return;
    let current = parseInt(slider.value) || 4;
    current = Math.max(1, Math.min(20, current + delta));
    slider.value = current;
    updateCostCalculation();
  };

  window.setCalcPreset = function(qty) {
    const slider = document.getElementById('videoVolumeSlider');
    if (!slider) return;
    slider.value = qty;
    updateCostCalculation();
  };

  // Bind native calculator event listeners
  const volumeSlider = document.getElementById('videoVolumeSlider');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', updateCostCalculation);
    volumeSlider.addEventListener('change', updateCostCalculation);
  }

  document.querySelectorAll('input[name="calcFormat"]').forEach(radio => {
    radio.addEventListener('change', updateCostCalculation);
  });

  const addonThumb = document.getElementById('addonThumb');
  const addonExpress = document.getElementById('addonExpress');
  const addonRaw = document.getElementById('addonRaw');
  if (addonThumb) addonThumb.addEventListener('change', updateCostCalculation);
  if (addonExpress) addonExpress.addEventListener('change', updateCostCalculation);
  if (addonRaw) addonRaw.addEventListener('change', updateCostCalculation);

  // Initial calculation on page load
  updateCostCalculation();

  const calcApplyBtn = document.getElementById('calcApplyBtn');
  if (calcApplyBtn) {
    calcApplyBtn.addEventListener('click', () => {
      const targetSelect = document.getElementById('projectTypeSelect');
      const notesArea = document.getElementById('projectNotes');
      const contactSection = document.getElementById('contact');
      const volumeSlider = document.getElementById('videoVolumeSlider');
      const summaryTotalAmount = document.getElementById('summaryTotalAmount');

      let activeFormat = 'reels';
      document.querySelectorAll('input[name="calcFormat"]').forEach(r => { if (r.checked) activeFormat = r.value; });
      if (targetSelect) targetSelect.value = activeFormat;

      const qty = volumeSlider ? volumeSlider.value : '4';
      const quoteVal = summaryTotalAmount ? summaryTotalAmount.textContent : '₹5,400';

      if (notesArea) {
        notesArea.value = `[Calculator Estimate: ${quoteVal} for ${qty}x ${formatNames[activeFormat]} with selected add-ons].\nAdditional details: `;
      }

      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        showToast('Estimate transferred to Project Brief! Fill in your details.');
      }
    });
  }

  /* ==========================================================================
     4.5 DAILY CREATIVE IMAGE & TEXT PROMPT SPOTLIGHT
     ========================================================================== */
  window.copyPromptText = function(text, btnElement) {
    if (!text) return;
    const executeCopy = () => {
      if (btnElement) {
        const originalHtml = btnElement.innerHTML;
        btnElement.classList.add('copied');
        btnElement.innerHTML = '<i class="fa-solid fa-check"></i> <span>Copied!</span>';
        setTimeout(() => {
          btnElement.classList.remove('copied');
          btnElement.innerHTML = originalHtml;
        }, 2200);
      }
      showToast('📋 Creative Text Prompt copied to clipboard!', '#10B981');
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(executeCopy).catch(() => {
        executeCopy();
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      executeCopy();
    }
  };

  window.usePromptStyleInOrder = function(promptTitle, promptTool) {
    const contactSection = document.getElementById('contact');
    const notesEl = document.getElementById('projectNotes');
    const serviceSelect = document.getElementById('projectTypeSelect');
    
    if (serviceSelect) {
      serviceSelect.value = 'motion';
    }
    if (notesEl) {
      notesEl.value = `Hi FlipCut Studio! I want to create a video/visual project inspired by your Daily Spotlight: "${promptTitle}" (${promptTool}).\nProject details: `;
    }
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      showToast(`Selected style "${promptTitle}"! Fill in your brief below.`, 'var(--brand-indigo)');
    }
  };

  window.selectServiceInContact = function(serviceName) {
    if (!serviceName) return;
    const contactSection = document.getElementById('contact');
    const notesEl = document.getElementById('projectNotes');
    if (notesEl) {
      notesEl.value = `Hi FlipCut Studio! I want to order service: "${serviceName}".\nProject requirements: `;
    }
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      showToast(`Selected "${serviceName}"! Fill in your project brief below.`, 'var(--brand-indigo)');
    }
  };

  function renderFrontendDailyPrompts(passedContent) {
    const data = passedContent || content || siteAppContent || ((typeof getSiteContent === 'function') ? getSiteContent() : DEFAULT_SITE_CONTENT);
    const container = document.getElementById('dailyPromptContainer');
    if (!container) return;
    if (!data || !data.dailyPrompts || !data.dailyPrompts.items || data.dailyPrompts.items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
          <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 2rem; margin-bottom: 12px; display: block; color: var(--brand-indigo);"></i>
          <p>No daily creative prompts published yet. Add new prompts directly from the Admin Panel!</p>
        </div>
      `;
      return;
    }

    const items = data.dailyPrompts.items;
    const featured = items[0];
    const historyItems = items.slice(1);

    const featImgUrl = formatMediaUrl(featured.image || 'assets/slider-after.jpg', 'image');
    const featEscapedPrompt = (featured.prompt || '').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

    let featuredHtml = `
      <div class="daily-prompt-card-featured">
        <div class="prompt-image-wrap" onclick="openImageModal('${featImgUrl}', '${(featured.title || 'Daily Artwork').replace(/'/g, "\\'")}', '${featured.tool || 'AI & DaVinci'}')">
          <img src="${featImgUrl}" alt="${featured.title || 'Daily Artwork'}" loading="lazy">
          <div class="prompt-badge-tag">
            <i class="fa-solid fa-sparkles"></i>
            <span>${featured.tool || 'Midjourney v6 & VFX'}</span>
          </div>
          <div class="prompt-date-tag">
            <span>${featured.date || "Today's Spotlight"}</span>
          </div>
        </div>

        <div class="prompt-content-wrap">
          <div class="prompt-header-top">
            <span class="prompt-spotlight-pill"><i class="fa-solid fa-fire"></i> Daily Masterpiece</span>
            <span style="color: var(--text-muted); font-size: 0.82rem;"><i class="fa-solid fa-calendar-day"></i> ${featured.date || "Today"}</span>
          </div>

          <h3 class="prompt-title-text">${featured.title || 'Daily Visual Masterpiece'}</h3>

          <div class="prompt-box-card">
            <div class="prompt-box-header">
              <span class="prompt-box-label"><i class="fa-solid fa-terminal text-gradient"></i> Exact Engineering Prompt</span>
              <button type="button" class="prompt-copy-quick-btn" onclick="window.copyPromptText(\`${featEscapedPrompt}\`, this)">
                <i class="fa-solid fa-copy"></i> Quick Copy
              </button>
            </div>
            <p class="prompt-text-display">${featured.prompt || 'No prompt text specified.'}</p>
          </div>

          <div class="prompt-actions-row">
            <button type="button" class="btn-copy-main" onclick="window.copyPromptText(\`${featEscapedPrompt}\`, this)">
              <i class="fa-solid fa-copy"></i>
              <span>Copy Full Prompt</span>
            </button>
            <button type="button" class="btn-use-style" onclick="window.usePromptStyleInOrder('${(featured.title || '').replace(/'/g, "\\'")}', '${featured.tool || ''}')">
              <i class="fa-solid fa-wand-magic-sparkles text-gradient"></i>
              <span>Create Similar Video</span>
            </button>
          </div>
        </div>
      </div>
    `;

    let historyHtml = '';
    if (historyItems.length > 0) {
      const cardsHtml = historyItems.map(item => {
        const itemImg = formatMediaUrl(item.image || 'assets/showcase-edit.jpg', 'image');
        const escapedPrompt = (item.prompt || '').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
        return `
          <div class="daily-prompt-card-compact">
            <div class="prompt-compact-thumb" onclick="openImageModal('${itemImg}', '${(item.title || 'Creative Prompt').replace(/'/g, "\\'")}', '${item.tool || 'Visual Design'}')">
              <img src="${itemImg}" alt="${item.title || 'Visual'}" loading="lazy">
              <div class="prompt-badge-tag" style="font-size: 0.68rem; padding: 3px 8px; top: 10px; left: 10px;">
                <i class="fa-solid fa-sparkles"></i> ${item.tool || 'Prompt'}
              </div>
              <div class="prompt-date-tag" style="font-size: 0.68rem; padding: 2px 8px; top: 10px; right: 10px;">
                ${item.date || 'Recent'}
              </div>
            </div>
            <div class="prompt-compact-body">
              <h4>${item.title || 'Creative Prompt'}</h4>
              <p class="prompt-compact-text">${item.prompt || ''}</p>
              <div class="prompt-compact-footer">
                <button type="button" class="btn btn-secondary" onclick="window.copyPromptText(\`${escapedPrompt}\`, this)" style="padding: 8px 14px; font-size: 0.82rem; width: 100%; justify-content: center; gap: 6px;">
                  <i class="fa-solid fa-copy"></i> <span>Copy Prompt</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      historyHtml = `
        <div style="margin-top: 16px;">
          <h4 class="daily-prompt-history-title"><i class="fa-solid fa-clock-rotate-left text-gradient"></i> Previous Daily Prompts & Artworks</h4>
          <div class="daily-prompt-grid" style="margin-top: 14px;">
            ${cardsHtml}
          </div>
        </div>
      `;
    }

    container.innerHTML = featuredHtml + historyHtml;
  }

  /* ==========================================================================
     5. DYNAMIC PORTFOLIO SHOWCASE (Video Editing, Graphic Design, UI/UX, Client Works)
     ========================================================================== */
  function getYouTubeId(url) {
    if (!url) return '';
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
    return m ? m[1] : '';
  }

  window.toggleReelCardSound = function(btn) {
    const parent = btn.closest('.portfolio-media-thumb');
    if (!parent) return;
    const video = parent.querySelector('video');
    if (video) {
      video.muted = !video.muted;
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = video.muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
      }
    }
  };

  let allPortfolioCards = [];

  function buildSinglePortfolioCard(item, idx) {
    const card = document.createElement('div');
    const isVertical = item.isVertical ? 'is-vertical' : '';
    let rawCategory = item.category || (item.isVertical ? 'reels' : (item.type === 'video' ? 'video' : (item.type === 'graphic' ? 'graphic' : (item.type === 'uiux' ? 'uiux' : 'clients'))));
    if (item.isVertical) rawCategory = 'reels';
    const category = rawCategory;
    
    card.className = `portfolio-item ${isVertical}`;
    card.dataset.category = category;
    card.dataset.type = item.type || 'link';
    if (item.videoUrl) card.dataset.video = item.videoUrl;
    if (item.linkUrl) card.dataset.link = item.linkUrl;
    if (item.image) card.dataset.image = formatMediaUrl(item.image, 'image');

    const imgUrl = formatMediaUrl(item.image || 'assets/showcase-edit.jpg', 'image');
    const videoSrc = item.videoUrl ? formatMediaUrl(item.videoUrl, 'video') : '';
    const ytId = getYouTubeId(item.videoUrl || '');
    const hasVideo = !!item.videoUrl;

    // Determine Media Thumb Content
    let mediaContent = '';
    let overlayIcon = '<div class="play-badge-icon"><i class="fa-solid fa-play"></i></div>';

    if (item.isVertical && (item.type === 'video' || category === 'video' || category === 'reels' || hasVideo)) {
      // Vertical 9:16 Auto-Playing Reel in Loop!
      if (ytId) {
        mediaContent = `
          <iframe src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&playsinline=1&modestbranding=1&rel=0" allow="autoplay; encrypted-media" playsinline allowfullscreen style="width:100%; height:100%; border:0; pointer-events:none;"></iframe>
        `;
      } else if (videoSrc) {
        mediaContent = `
          <video class="vertical-reel-video" src="${videoSrc}" poster="${imgUrl}" autoplay loop muted playsinline preload="metadata"></video>
          <button class="reel-sound-btn" onclick="event.stopPropagation(); window.toggleReelCardSound(this)" title="Toggle Sound"><i class="fa-solid fa-volume-xmark"></i></button>
        `;
      } else {
        mediaContent = `
          <img src="${imgUrl}" alt="${item.title || 'Viral Reel'}" loading="lazy">
        `;
      }
      overlayIcon = '<div class="play-badge-icon" style="width:auto; padding:8px 16px; border-radius:var(--radius-pill); font-size:0.82rem; font-weight:700; gap:6px;"><i class="fa-solid fa-expand"></i> <span>Watch 4K</span></div>';
    } else if (hasVideo && (item.type === 'video' || category === 'video' || !item.linkUrl)) {
      // Horizontal 16:9 Video
      if (videoSrc && (videoSrc.endsWith('.mp4') || videoSrc.endsWith('.webm') || videoSrc.includes('assets/'))) {
        mediaContent = `
          <video src="${videoSrc}" poster="${imgUrl}" muted playsinline preload="metadata" loop onmouseenter="this.play().catch(()=>{})" onmouseleave="this.pause()" style="width:100%; height:100%; object-fit:cover;"></video>
        `;
      } else {
        mediaContent = `
          <img src="${imgUrl}" alt="${item.title || 'Creative Project'}" loading="lazy">
        `;
      }
      overlayIcon = '<div class="play-badge-icon" style="width:auto; padding:10px 18px; border-radius:var(--radius-pill); font-size:0.85rem; font-weight:700; gap:6px;"><i class="fa-solid fa-play"></i> <span>Play 4K Video</span></div>';
    } else {
      // Graphic / UI/UX / Client / Web Card
      if (item.type === 'link' || category === 'uiux' || category === 'clients' || (item.linkUrl && !item.videoUrl)) {
        overlayIcon = '<div class="play-badge-icon" style="width:auto; padding:10px 18px; border-radius:var(--radius-pill); font-size:0.85rem; font-weight:700; gap:6px;"><i class="fa-solid fa-arrow-up-right-from-square"></i> <span>Open Live Project</span></div>';
      } else if (item.type === 'graphic' || item.type === 'image') {
        overlayIcon = '<div class="play-badge-icon" style="width:auto; padding:10px 18px; border-radius:var(--radius-pill); font-size:0.85rem; font-weight:700; gap:6px;"><i class="fa-solid fa-expand"></i> <span>View Visual</span></div>';
      } else {
        overlayIcon = '<div class="play-badge-icon"><i class="fa-solid fa-play"></i></div>';
      }

      mediaContent = `
        <img src="${imgUrl}" alt="${item.title || 'Creative Project'}" loading="lazy">
      `;
    }

    // Category Icon & Label
    let catIcon = 'fa-solid fa-film';
    let catLabel = '16:9 Video';
    if (item.isVertical || category === 'reels') {
      catIcon = 'fa-solid fa-mobile-screen-button';
      catLabel = '9:16 Reel';
    } else if (category === 'graphic') {
      catIcon = 'fa-solid fa-palette';
      catLabel = 'Graphic Design';
    } else if (category === 'uiux') {
      catIcon = 'fa-solid fa-laptop-code';
      catLabel = 'Web UI & UX';
    } else if (category === 'clients') {
      catIcon = 'fa-solid fa-crown';
      catLabel = 'Client Project';
    }

    const displayTag = item.tag || catLabel;

    card.innerHTML = `
      <div class="portfolio-media-thumb">
        ${mediaContent}
        <div class="portfolio-overlay">
          ${overlayIcon}
        </div>
        <span class="portfolio-thumb-pill">
          <i class="${catIcon}"></i> ${displayTag}
        </span>
      </div>
      <div class="portfolio-info">
        <span class="portfolio-tag">${displayTag}</span>
        <h3 class="portfolio-title">${item.title || 'Creative Showcase Project'}</h3>
        <div class="portfolio-stats">
          <span><i class="fa-solid fa-sparkles text-gradient"></i> ${item.views || '4K Master'}</span>
          <span><i class="fa-solid fa-arrow-trend-up"></i> ${item.stat2 || 'Production Ready'}</span>
        </div>
      </div>
    `;

    // Click interaction
    card.addEventListener('click', () => {
      if (item.videoUrl && (item.type === 'video' || category === 'video' || category === 'reels' || !item.linkUrl)) {
        openVideoModal(formatMediaUrl(item.videoUrl, 'video'));
      } else if ((item.type === 'link' || category === 'uiux' || category === 'clients') && item.linkUrl) {
        window.open(item.linkUrl, '_blank', 'noopener,noreferrer');
      } else if (item.image && (item.type === 'graphic' || item.type === 'image')) {
        openImageModal(imgUrl, item.title, displayTag, item.linkUrl);
      } else if (item.videoUrl) {
        openVideoModal(formatMediaUrl(item.videoUrl, 'video'));
      } else if (item.linkUrl) {
        window.open(item.linkUrl, '_blank', 'noopener,noreferrer');
      } else if (item.image) {
        openImageModal(imgUrl, item.title, displayTag, item.linkUrl);
      }
    });

    return card;
  }

  function renderFrontendPortfolio(passedContent) {
    const data = passedContent || content || siteAppContent || ((typeof getSiteContent === 'function') ? getSiteContent() : DEFAULT_SITE_CONTENT);
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;
    if (!data || !data.portfolio || !data.portfolio.items) return;

    allPortfolioCards = [];
    data.portfolio.items.forEach((item, idx) => {
      const card = buildSinglePortfolioCard(item, idx);
      allPortfolioCards.push({ card, item });
    });

    applyActivePortfolioFilter();

    // Auto-Play Intersection Observer: plays all vertical reels when portfolio is in viewport
    if ('IntersectionObserver' in window) {
      const portfolioSec = document.getElementById('portfolio');
      if (portfolioSec) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            const reelVideos = portfolioGrid.querySelectorAll('.vertical-reel-video');
            reelVideos.forEach(v => {
              if (entry.isIntersecting) {
                v.play().catch(() => {});
              } else {
                v.pause();
              }
            });
          });
        }, { threshold: 0.15 });
        obs.observe(portfolioSec);
      }
    }
  }

  function applyActivePortfolioFilter() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;
    const activeBtn = document.querySelector('.portfolio-filter-bar .filter-btn.active') || document.querySelector('.portfolio-filter-bar .filter-btn');
    const filter = activeBtn ? (activeBtn.dataset.filter || 'reels') : 'reels';

    grid.innerHTML = '';

    const matched = [];
    let onlyVertical = true;

    allPortfolioCards.forEach(({ card, item }) => {
      const itemCat = card.dataset.category;
      const isVert = card.classList.contains('is-vertical');
      let show = false;

      if (filter === 'all') {
        show = true;
      } else if (filter === 'reels' && (itemCat === 'reels' || isVert)) {
        show = true;
      } else if (filter === 'video' && (itemCat === 'video' && !isVert)) {
        show = true;
      } else if (itemCat === filter) {
        show = true;
      }

      if (show) {
        card.style.display = 'flex';
        matched.push(card);
        if (!isVert) onlyVertical = false;
      } else {
        card.style.display = 'none';
      }
    });

    if (matched.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; width: 100%; text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.5;"></i>
          <p>No creations available in this category yet.</p>
        </div>
      `;
      return;
    }

    // 1st Item is Featured (Normal on top in mobile)
    const firstCard = matched[0];
    firstCard.classList.add('portfolio-first-item');
    grid.appendChild(firstCard);

    // Remaining items (2..N) go into the horizontal scroll strip for mobile
    if (matched.length > 1) {
      const sliderCue = document.createElement('div');
      sliderCue.className = 'portfolio-mobile-slider-cue';
      sliderCue.id = 'portfolioMobileSliderCue';
      sliderCue.innerHTML = '<i class="fa-solid fa-arrows-left-right text-gradient"></i> <span>Swipe for more works</span> <i class="fa-solid fa-arrow-right-long text-gradient"></i>';
      grid.appendChild(sliderCue);

      const scrollStrip = document.createElement('div');
      scrollStrip.className = 'portfolio-mobile-scroll-strip';
      scrollStrip.id = 'portfolioMobileScrollStrip';

      for (let i = 1; i < matched.length; i++) {
        const otherCard = matched[i];
        otherCard.classList.remove('portfolio-first-item');
        scrollStrip.appendChild(otherCard);
      }
      grid.appendChild(scrollStrip);
    }

    if (filter === 'reels' || (matched.length > 0 && onlyVertical)) {
      grid.classList.add('vertical-mode');
    } else {
      grid.classList.remove('vertical-mode');
    }
  }

  renderFrontendDailyPrompts();
  renderFrontendPortfolio();

  // Category Filtering Setup
  function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.portfolio-filter-bar .filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyActivePortfolioFilter();
      });
    });
  }
  initPortfolioFilters();

  /* ==========================================================================
     6. VIDEO & IMAGE LIGHTBOX MODALS
     ========================================================================== */
  const videoModal = document.getElementById('videoModal');
  const modalVideoPlayer = document.getElementById('modalVideoPlayer');
  const modalIframe = document.getElementById('modalIframe');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const heroPlayBtn = document.getElementById('heroPlayBtn');

  function openVideoModal(videoUrl) {
    if (!videoModal || !videoUrl) return;
    const isDirectVideo = (
      /\.(mp4|webm|mov|mkv|avi|m4v)(\?.*)?$/i.test(videoUrl) ||
      videoUrl.startsWith('data:video/') ||
      videoUrl.startsWith('blob:') ||
      videoUrl.startsWith('assets/') ||
      videoUrl.includes('/assets/')
    );

    if (isDirectVideo) {
      if (modalIframe) {
        modalIframe.src = '';
        modalIframe.style.display = 'none';
      }
      if (modalVideoPlayer) {
        modalVideoPlayer.src = videoUrl;
        modalVideoPlayer.style.display = 'block';
        modalVideoPlayer.currentTime = 0;
        modalVideoPlayer.play().catch(() => {});
      }
    } else {
      if (modalVideoPlayer) {
        modalVideoPlayer.pause();
        modalVideoPlayer.src = '';
        modalVideoPlayer.style.display = 'none';
      }
      let embedUrl = videoUrl;
      const ytId = getYouTubeId(videoUrl);
      if (ytId) {
        embedUrl = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`;
      } else if (videoUrl.includes('drive.google.com') && !videoUrl.includes('preview')) {
        embedUrl = formatMediaUrl(videoUrl, 'video');
      } else if (!embedUrl.includes('autoplay') && !embedUrl.includes('drive.google.com')) {
        embedUrl = embedUrl.includes('?') ? `${embedUrl}&autoplay=1` : `${embedUrl}?autoplay=1`;
      }
      if (modalIframe) {
        modalIframe.src = embedUrl;
        modalIframe.style.display = 'block';
      }
    }
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    if (videoModal) {
      if (modalVideoPlayer) {
        modalVideoPlayer.pause();
        modalVideoPlayer.src = '';
        modalVideoPlayer.style.display = 'none';
      }
      if (modalIframe) {
        modalIframe.src = '';
        modalIframe.style.display = 'none';
      }
      videoModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeVideoModal);

  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideoModal();
    });
  }

  // Image Lightbox Modal Handlers
  const imageModal = document.getElementById('imageModal');
  const imageModalImg = document.getElementById('imageModalImg');
  const imageModalTitle = document.getElementById('imageModalTitle');
  const imageModalTag = document.getElementById('imageModalTag');
  const imageModalLinkBtn = document.getElementById('imageModalLinkBtn');
  const imageModalCloseBtn = document.getElementById('imageModalCloseBtn');

  function openImageModal(imgSrc, title, tag, linkUrl) {
    if (!imageModal) return;
    if (imageModalImg) imageModalImg.src = imgSrc;
    if (imageModalTitle) imageModalTitle.textContent = title || 'Graphic Design Work';
    if (imageModalTag) imageModalTag.textContent = tag || 'Key Visual / Prototype';
    if (imageModalLinkBtn) {
      if (linkUrl) {
        imageModalLinkBtn.href = linkUrl;
        imageModalLinkBtn.style.display = 'inline-flex';
      } else {
        imageModalLinkBtn.style.display = 'none';
      }
    }
    imageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeImageModal() {
    if (imageModal) {
      imageModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (imageModalCloseBtn) imageModalCloseBtn.addEventListener('click', closeImageModal);
  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) closeImageModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (videoModal && videoModal.classList.contains('active')) closeVideoModal();
      if (imageModal && imageModal.classList.contains('active')) closeImageModal();
    }
  });

  /* ==========================================================================
     7. INTERACTIVE FAQ ACCORDION (Universal Event Delegation)
     ========================================================================== */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-question-btn');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    if (!item) return;

    e.preventDefault();
    const wrap = item.closest('.faq-accordion-wrap') || document.getElementById('faqAccordionWrap');
    const answer = item.querySelector('.faq-answer');
    const isActive = item.classList.contains('active');

    if (wrap) {
      const allItems = wrap.querySelectorAll('.faq-item');
      allItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        }
      });
    }

    if (isActive) {
      item.classList.remove('active');
      if (answer) answer.style.maxHeight = null;
    } else {
      item.classList.add('active');
      if (answer) answer.style.maxHeight = `${answer.scrollHeight + 30}px`;
    }
  });

  /* ==========================================================================
     8. CONTACT FORM SUBMISSION & SQL DATABASE SYNC
     ========================================================================== */
  // =========================================================================
  // STRICT ANTI-DUMMY VALIDATION SUITE (Emails & Phone Numbers)
  // =========================================================================
  function validateFullName(name) {
    if (!name || typeof name !== 'string') return { valid: false, message: 'Please enter your Full Name.' };
    const clean = name.trim();
    if (clean.length < 2) return { valid: false, message: 'Name must be at least 2 characters long.' };
    if (/^\d+$/.test(clean)) return { valid: false, message: 'Name cannot contain only numbers.' };
    const dummyNames = ['test', 'testing', 'admin', 'asdf', 'qwerty', 'dummy', 'fake', 'null', 'demo', 'sample', 'user', 'abc', 'xyz'];
    if (dummyNames.includes(clean.toLowerCase())) {
      return { valid: false, message: 'Please enter your real, genuine full name.' };
    }
    return { valid: true, clean };
  }

  function validatePhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') return { valid: false, message: 'Please enter your 10-digit mobile number.' };
    let clean = phone.trim().replace(/[\s\-\(\)\+]/g, '');
    if (clean.startsWith('91') && clean.length === 12) clean = clean.substring(2);
    if (clean.startsWith('0') && clean.length === 11) clean = clean.substring(1);
    
    if (!/^\d{10}$/.test(clean)) {
      return { valid: false, message: 'Please enter a valid 10-digit mobile number.' };
    }
    if (!/^[6-9]/.test(clean)) {
      return { valid: false, message: 'Mobile number must start with 6, 7, 8, or 9.' };
    }
    if (/^(\d)\1{9}$/.test(clean)) {
      return { valid: false, message: 'Dummy or repeating phone number is not allowed.' };
    }
    const sequentialPatterns = [
      '0123456789', '1234567890', '9876543210', '0987654321', '2345678901',
      '1122334455', '1212121212', '1231231234', '9898989898', '9998887776'
    ];
    if (sequentialPatterns.includes(clean)) {
      return { valid: false, message: 'Dummy sequential phone number is not allowed.' };
    }
    const uniqueCount = new Set(clean.split('')).size;
    if (uniqueCount < 4) {
      return { valid: false, message: 'Please enter a genuine, active mobile number.' };
    }
    return { valid: true, clean };
  }

  function validateEmailAddress(email) {
    if (!email || typeof email !== 'string') return { valid: false, message: 'Please enter your email address.' };
    const clean = email.trim().toLowerCase();
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(clean) || clean.includes('..') || clean.length > 100) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }
    
    const parts = clean.split('@');
    const user = parts[0];
    const domain = parts[1];
    
    const dummyUsers = [
      'test', 'testing', 'dummy', 'fake', 'asdf', 'qwerty', '123', '12345', 'sample',
      'demo', 'user', 'admin', 'null', 'none', 'no', 'abc', 'xyz', 'aaa', 'bbb', 'ccc',
      'test1', 'test2', 'example', 'tester', 'temp', 'junk', 'fakeuser', 'nomail'
    ];
    if (dummyUsers.includes(user)) {
      return { valid: false, message: 'Dummy test emails are not allowed. Please enter your real email.' };
    }
    
    const dummyDomains = [
      'test.com', 'example.com', 'dummy.com', 'sample.com', 'fake.com', 'test.in', 'dummy.in',
      'abc.com', 'xyz.com', 'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
      'trashmail.com', 'throwawaymail.com', 'yopmail.com', 'temp-mail.org', 'fakeinbox.com',
      'dispostable.com', 'sharklasers.com', 'getairmail.com', 'mohmal.com', 'generator.email',
      'inboxbear.com', 'crazymailing.com', 'burnermail.io', 'dropmail.me', 'fakemailgenerator.com',
      'mytemp.email', 'emailondeck.com', 'trashmail.net', 'tempmail.net', 'tempmailaddress.com'
    ];
    if (dummyDomains.includes(domain)) {
      return { valid: false, message: 'Temporary/disposable emails are not allowed. Please enter a genuine email.' };
    }
    
    return { valid: true, clean };
  }

  // =========================================================================
  // USER GUIDANCE VALIDATION MODAL HANDLERS
  // =========================================================================
  window.showValidationGuideModal = function(field, message) {
    const modal = document.getElementById('validationAlertModal');
    const msgEl = document.getElementById('validationAlertMessage');
    const fieldEl = document.getElementById('validationAlertField');
    
    if (msgEl) msgEl.textContent = message;
    if (fieldEl) {
      if (field === 'email') fieldEl.innerHTML = '<i class="fa-solid fa-envelope"></i> Email Address Issue:';
      else if (field === 'phone') fieldEl.innerHTML = '<i class="fa-solid fa-phone"></i> Mobile / WhatsApp Issue:';
      else if (field === 'name') fieldEl.innerHTML = '<i class="fa-solid fa-user"></i> Full Name Issue:';
      else fieldEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Information Required:';
    }

    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    window.__pendingInvalidField = field;
  };

  window.closeValidationGuideModal = function() {
    const modal = document.getElementById('validationAlertModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    const field = window.__pendingInvalidField;
    let targetInput = null;
    if (field === 'name') {
      targetInput = document.getElementById('clientName') || document.getElementById('webinarName');
    } else if (field === 'email') {
      targetInput = document.getElementById('clientEmail') || document.getElementById('webinarEmail');
    } else if (field === 'phone') {
      targetInput = document.getElementById('clientPhone') || document.getElementById('webinarPhone');
    }
    
    if (targetInput) {
      targetInput.focus();
      targetInput.classList.add('input-highlight-error');
      targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => targetInput.classList.remove('input-highlight-error'), 3500);
    }
  };

  window.dismissTopAnnouncement = function() {
    const topBar = document.getElementById('topAnnouncementBar');
    if (topBar) {
      topBar.classList.add('is-hidden');
      document.documentElement.classList.remove('has-announcement');
      document.body.classList.remove('has-announcement');
    }
  };

  window.switchPricingPlan = function(index) {
    window.__activePlanIndex = index;
    const tabs = document.querySelectorAll('.plan-tab-btn');
    const cards = document.querySelectorAll('#pricingGrid .pricing-card');

    tabs.forEach((tab, idx) => {
      if (idx === index) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    cards.forEach((card, idx) => {
      if (idx === index) {
        card.classList.add('is-active-mobile');
      } else {
        card.classList.remove('is-active-mobile');
      }
    });
  };

  const inquiryForm = document.getElementById('projectInquiryForm');

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rawName = document.getElementById('clientName').value.trim();
      const rawEmail = document.getElementById('clientEmail').value.trim();
      const rawPhone = document.getElementById('clientPhone') ? document.getElementById('clientPhone').value.trim() : '';
      const serviceType = document.getElementById('projectTypeSelect').value;
      const budget = document.getElementById('projectBudget').value;
      const footage = document.getElementById('projectFootageUrl').value.trim();
      const notes = document.getElementById('projectNotes').value.trim();
      const honeypot = document.getElementById('inquiryHoneypot')?.value;

      // Anti-Bot & Automated Script Trap
      if (honeypot) {
        console.warn('Bot detected and neutralized.');
        showToast('Brief sent successfully!', '#10B981');
        inquiryForm.reset();
        return;
      }

      const nameValidation = validateFullName(rawName);
      if (!nameValidation.valid) {
        showValidationGuideModal('name', nameValidation.message);
        return;
      }

      const emailValidation = validateEmailAddress(rawEmail);
      if (!emailValidation.valid) {
        showValidationGuideModal('email', emailValidation.message);
        return;
      }

      if (rawPhone) {
        const phoneValidation = validatePhoneNumber(rawPhone);
        if (!phoneValidation.valid) {
          showValidationGuideModal('phone', phoneValidation.message);
          return;
        }
      } else {
        showValidationGuideModal('phone', 'Please provide your active 10-digit mobile / WhatsApp number.');
        return;
      }

      const name = nameValidation.clean;
      const email = emailValidation.clean;
      const phone = validatePhoneNumber(rawPhone).clean || rawPhone;

      // Anti-Duplicate Check (One Email and One Phone allowed only once)
      if (typeof window.checkDuplicateLead === 'function') {
        const dupResult = await window.checkDuplicateLead(email, phone);
        if (dupResult && dupResult.isDuplicate) {
          const matchedItem = dupResult.matchedBy === 'email' ? 'Email Address' : 'Mobile Number';
          showValidationGuideModal(
            dupResult.matchedBy,
            `An inquiry with this ${matchedItem} is already registered under ID: ${dupResult.userId}! Our lead producer is already reviewing your brief and will contact you directly via WhatsApp. There is no need to submit duplicate entries.`
          );
          return;
        }
      }

      const serviceLabels = {
        'reels': 'Viral Short-Form (Reels / TikTok)',
        'youtube': 'YouTube Long-Form Storytelling',
        'commercial': 'Commercial & Brand Film',
        'motion': 'Motion Graphics & 3D Visuals',
        'retainer': 'Monthly Retainer Bandwidth'
      };

      const budgetLabels = {
        '10k-25k': '₹10,000 - ₹25,000',
        '25k-50k': '₹25,000 - ₹50,000',
        '50k-100k': '₹50,000 - ₹1,00,000',
        '100k+': '₹1,00,000+ (Custom Retainer)'
      };

      const leadPayload = {
        name: name,
        email: email,
        phone: phone,
        service: serviceLabels[serviceType] || serviceType,
        budget: budgetLabels[budget] || budget,
        footage: footage,
        notes: notes
      };

      // 1. Submit directly to Dual Cloud (Google Firebase Firestore + Supabase Cloud)
      let assignedUserId = 'FC-REG-' + Math.floor(10000 + Math.random() * 90000);
      leadPayload.userId = assignedUserId;
      leadPayload.id = assignedUserId;

      if (typeof window.pushLeadToDualCloud === 'function') {
        window.pushLeadToDualCloud({
          ...leadPayload,
          service: serviceLabels[serviceType] || serviceType,
          budget: budgetLabels[budget] || budget,
          message: `Footage: ${footage || 'None'} | Notes: ${notes || 'None'}`
        }).catch(() => {});
      } else {
        // Direct Fallback
        try {
          const supabaseLead = {
            id: assignedUserId,
            name: name,
            email: email,
            phone: phone,
            service: serviceLabels[serviceType] || serviceType,
            budget: budgetLabels[budget] || budget,
            message: `Footage: ${footage || 'None'} | Notes: ${notes || 'None'}`,
            status: 'New'
          };
          fetch('https://cznixvdphwbjdnnmapvb.supabase.co/rest/v1/leads', {
            method: 'POST',
            headers: {
              apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bml4dmRwaHdiamRubm1hcHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NTgwMTgsImV4cCI6MjEwMzEzNDAxOH0.dTLN1DCbUiBawZq8YlS5Bol-i81JFKhKpPKCboyocuQ',
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bml4dmRwaHdiamRubm1hcHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NTgwMTgsImV4cCI6MjEwMzEzNDAxOH0.dTLN1DCbUiBawZq8YlS5Bol-i81JFKhKpPKCboyocuQ',
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify(supabaseLead)
          }).catch(() => {});
        } catch (_) {}
      }

      // 2. Submit to Node Express Backend if active
      try {
        const apiBase = (typeof getContentApiBase === 'function') ? getContentApiBase() : '';
        if (apiBase) {
          fetch(`${apiBase}/api/leads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...leadPayload, userId: assignedUserId })
          }).catch(() => {});
        }
      } catch (_) {}

      leadPayload.userId = assignedUserId;

      // 3. Also keep in LocalStorage for offline instant access
      try {
        const existingLeads = JSON.parse(localStorage.getItem('flipcut_leads') || '[]');
        existingLeads.unshift({ ...leadPayload, id: Date.now(), date: new Date().toISOString().slice(0, 10), status: 'New' });
        localStorage.setItem('flipcut_leads', JSON.stringify(existingLeads));
      } catch (_) {}

      // 4. Trigger Luxury Success Popup Modal
      showBriefSuccessModal(leadPayload);
      showToast(`🎉 Registration Successful! User ID: ${assignedUserId}`, '#10B981');
      inquiryForm.reset();
    });
  }

  // Copy User ID Helper
  window.copyModalUserId = function(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.textContent.trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`📋 Copied User ID: ${text}`, '#10B981');
      }).catch(() => {
        showToast(`User ID: ${text}`, 'var(--brand-indigo)');
      });
    } else {
      showToast(`User ID: ${text}`, 'var(--brand-indigo)');
    }
  };

  // Project Brief Success Modal Handlers
  const briefSuccessModal = document.getElementById('briefSuccessModal');
  const briefModalCloseBtn = document.getElementById('briefModalCloseBtn');
  const briefModalOkBtn = document.getElementById('briefModalOkBtn');

  function closeBriefModal() {
    if (briefSuccessModal) briefSuccessModal.classList.remove('active');
  }

  if (briefModalCloseBtn) briefModalCloseBtn.addEventListener('click', closeBriefModal);
  if (briefModalOkBtn) briefModalOkBtn.addEventListener('click', closeBriefModal);

  function showBriefSuccessModal(data) {
    if (!briefSuccessModal) return;
    const uidEl = document.getElementById('briefSuccessUserId');
    const nameEl = document.getElementById('briefSuccessClientName');
    const serviceEl = document.getElementById('briefSuccessService');
    const budgetEl = document.getElementById('briefSuccessBudget');
    const phoneEl = document.getElementById('briefSuccessPhone');
    const emailEl = document.getElementById('briefSuccessEmail');
    const waBtn = document.getElementById('briefSuccessWhatsAppBtn');

    const uid = data.userId || ('FC-REG-' + Math.floor(10000 + Math.random() * 90000));
    if (uidEl) uidEl.textContent = uid;
    if (nameEl) nameEl.textContent = data.name || 'Creator';
    if (serviceEl) serviceEl.textContent = data.service || 'Video Production';
    if (budgetEl) budgetEl.textContent = data.budget || 'Custom';
    if (phoneEl) phoneEl.textContent = data.phone || 'Provided';
    if (emailEl) emailEl.textContent = data.email || '-';

    if (waBtn) {
      const waNum = (content && content.contact && content.contact.whatsappNum) ? content.contact.whatsappNum.replace(/[^0-9]/g, '') : '917010270151';
      const msg = encodeURIComponent(`Hi FlipCut Studio! I registered my project brief [User ID: ${uid}] for ${data.service || 'Video Editing'} (${data.name || 'Client'}). Let's discuss!`);
      waBtn.href = `https://wa.me/${waNum}?text=${msg}`;
    }

    briefSuccessModal.classList.add('active');
  }

  // Admin Hotkey (Ctrl + Shift + A or Cmd + Shift + A)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.location.href = 'admin.html';
    }
  });

  /* ==========================================================================
     11. RAZORPAY PAYMENT GATEWAY CLIENT CHECKOUT & MODAL
     ========================================================================== */
  const paymentSuccessModal = document.getElementById('paymentSuccessModal');
  const payModalCloseBtn = document.getElementById('payModalCloseBtn');
  const payModalOkBtn = document.getElementById('payModalOkBtn');

  function closePaymentModal() {
    if (paymentSuccessModal) paymentSuccessModal.classList.remove('active');
  }

  if (payModalCloseBtn) payModalCloseBtn.addEventListener('click', closePaymentModal);
  if (payModalOkBtn) payModalOkBtn.addEventListener('click', closePaymentModal);

  function showPaymentSuccessModal(packageName, amount, paymentId, orderId, clientName, clientPhone, userId) {
    if (!paymentSuccessModal) return;
    const uidEl = document.getElementById('payModalUserId');
    const nameEl = document.getElementById('payModalClientName');
    const planEl = document.getElementById('payModalPlan');
    const amtEl = document.getElementById('payModalAmount');
    const idEl = document.getElementById('payModalId');
    const dateEl = document.getElementById('payModalDate');
    const waBtn = document.getElementById('payModalWhatsAppBtn');

    const uid = userId || ('FC-PAY-' + Math.floor(10000 + Math.random() * 90000));
    if (uidEl) uidEl.textContent = uid;
    if (nameEl) nameEl.textContent = clientName || 'Creator';
    if (planEl) planEl.textContent = packageName || 'Retainer Package';
    if (amtEl) amtEl.textContent = `₹${amount}`;
    if (idEl) idEl.textContent = paymentId || orderId || 'Verified';
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    if (waBtn) {
      const waNum = (content && content.contact && content.contact.whatsappNum) ? content.contact.whatsappNum.replace(/[^0-9]/g, '') : '917010270151';
      const msg = encodeURIComponent(`Hi FlipCut Studio! I just booked the ${packageName} plan (User ID: ${uid}, Payment ID: ${paymentId || ''}). Ready to onboard!`);
      waBtn.href = `https://wa.me/${waNum}?text=${msg}`;
    }

    paymentSuccessModal.classList.add('active');
  }

  window.startPlanCheckout = async function(packageName, rawAmount) {
    try {
      const cleanPkg = packageName || 'Retainer Plan';
      const cleanAmtStr = (rawAmount || '').toString().replace(/[^0-9]/g, '');
      const numAmount = parseInt(cleanAmtStr, 10) || 14999;

      // If Studio Enterprise or custom plan, smooth scroll to contact form with pre-filled message
      if (cleanPkg.toLowerCase().includes('enterprise') || cleanPkg.toLowerCase().includes('custom')) {
        const contactSec = document.getElementById('contact');
        if (contactSec) {
          contactSec.scrollIntoView({ behavior: 'smooth' });
          const servEl = document.getElementById('projectService');
          if (servEl) servEl.value = 'retainer';
          const notesEl = document.getElementById('projectNotes');
          if (notesEl) notesEl.value = `Hi FlipCut Studio! I want to book the ${cleanPkg} (₹${rawAmount}/month). Please get in touch for custom onboarding.`;
          const budgetEl = document.getElementById('projectBudget');
          if (budgetEl) budgetEl.value = '50k-100k';
          const nameEl = document.getElementById('clientName');
          if (nameEl) nameEl.focus();
        }
        showToast(`Selected ${cleanPkg}! Please enter your contact details below to finalize booking.`, 'var(--brand-indigo)');
        return;
      }

      // Check for user profile or form input
      let clientName = '';
      let clientPhone = '';
      let clientEmail = '';

      if (window.userProfile) {
        clientName = window.userProfile.name || '';
        clientPhone = window.userProfile.phone || '';
        clientEmail = window.userProfile.email || '';
      }
      if (!clientName) {
        const nInput = document.getElementById('clientName');
        if (nInput && nInput.value.trim()) clientName = nInput.value.trim();
      }
      if (!clientPhone) {
        const pInput = document.getElementById('clientPhone');
        if (pInput && pInput.value.trim()) clientPhone = pInput.value.trim();
      }
      if (!clientEmail) {
        const eInput = document.getElementById('clientEmail');
        if (eInput && eInput.value.trim()) clientEmail = eInput.value.trim();
      }

      // Get Razorpay Key from CMS content or default live key
      const razorpayKey = (content && content.paymentGateway && content.paymentGateway.razorpayKeyId) ? content.paymentGateway.razorpayKeyId : 'rzp_live_TTd5UPSpFLKLor';

      // Check if Razorpay SDK is loaded
      if (typeof window.Razorpay !== 'function') {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = resolve;
          document.head.appendChild(script);
        });
      }

      if (typeof window.Razorpay !== 'function') {
        // Fallback: smooth scroll to contact with prefill
        const contactSec = document.getElementById('contact');
        if (contactSec) {
          contactSec.scrollIntoView({ behavior: 'smooth' });
          const notesEl = document.getElementById('projectNotes');
          if (notesEl) notesEl.value = `Hi FlipCut Studio! I want to book the ${cleanPkg} (₹${rawAmount}/month). Please get in touch.`;
        }
        showToast(`Selected ${cleanPkg}! Please submit your details below.`, 'var(--brand-indigo)');
        return;
      }

      showToast('Opening secure Razorpay checkout...', 'var(--brand-indigo)');

      const options = {
        key: razorpayKey,
        amount: numAmount * 100, // in paise
        currency: "INR",
        name: "FlipCut Creation",
        description: `Booking: ${cleanPkg} (₹${rawAmount})`,
        image: "assets/logo.png",
        prefill: {
          name: clientName || '',
          contact: clientPhone || '',
          email: clientEmail || ''
        },
        notes: {
          packageName: cleanPkg,
          amount: `₹${rawAmount}`
        },
        theme: {
          color: "#6366F1"
        },
        modal: {
          ondismiss: function() {
            showToast('Payment window closed.', 'var(--text-muted)');
          }
        },
        handler: function(response) {
          if (response && response.razorpay_payment_id) {
            const paymentId = response.razorpay_payment_id;
            const generatedUserId = 'FC-PAY-' + Math.floor(10000 + Math.random() * 90000);

            // Save user profile in header engine
            if (typeof window.saveUserProfile === 'function') {
              window.saveUserProfile({
                userId: generatedUserId,
                name: clientName || 'FlipCut Creator',
                phone: clientPhone || '',
                email: clientEmail || '',
                packageName: cleanPkg,
                paymentId: paymentId,
                amount: `₹${rawAmount}`
              });
            }

            // Sync lead to Dual Cloud (Firestore + Supabase) non-blockingly
            if (typeof window.pushLeadToDualCloud === 'function') {
              window.pushLeadToDualCloud({
                id: generatedUserId,
                userId: generatedUserId,
                name: clientName || 'FlipCut Creator',
                phone: clientPhone || '',
                email: clientEmail || '',
                service: cleanPkg,
                budget: `₹${rawAmount}/mo`,
                message: `Retainer Plan Booking: ${cleanPkg}`,
                status: 'Paid & Verified (Razorpay)',
                paymentId: paymentId
              }).catch(() => {});
            }

            showPaymentSuccessModal(cleanPkg, rawAmount, paymentId, response.razorpay_order_id, clientName, clientPhone, generatedUserId);
            showToast('✅ Payment Verified! Welcome to FlipCut Studio!', '#10B981');
          } else {
            showToast('Payment verification pending. Please contact support.', '#EF4444');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function(response) {
        const errDesc = response?.error?.description || 'Payment was not completed';
        showToast(`❌ Payment Issue: ${errDesc}`, '#EF4444');
      });
      rzp.open();

    } catch (err) {
      console.error('Plan checkout error:', err);
      const contactSec = document.getElementById('contact');
      if (contactSec) {
        contactSec.scrollIntoView({ behavior: 'smooth' });
        const notesEl = document.getElementById('projectNotes');
        if (notesEl) notesEl.value = `Hi FlipCut Studio! I want to book the ${packageName || 'Plan'} (₹${rawAmount || ''}).`;
      }
      showToast(`Selected ${packageName || 'Plan'}! Please submit your details below.`, 'var(--brand-indigo)');
    }
  };

  // Initialize active mobile pricing plan (Pro Growth Tier)
  if (typeof window.switchPricingPlan === 'function') {
    window.switchPricingPlan(1);
  }

});
