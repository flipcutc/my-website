/**
 * FlipCut Creation - Main Interactive Application Script (INR & CMS Enabled)
 * Powers dynamic DOM hydration from Content Store, Indian Rupee (₹) pricing, and all interactions.
 */

document.addEventListener('DOMContentLoaded', () => {

  // Load Content from Store
  let content = (typeof getSiteContent === 'function') ? getSiteContent() : DEFAULT_SITE_CONTENT;

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

  /* ==========================================================================
     0. DYNAMIC CMS HYDRATION FROM CONTENT STORE
     ========================================================================== */
  function hydratePageFromCMS() {
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

      // 2. All 13 Major Page Sections
      setVis('hero', sv.hero);
      setVis('runningBannerSection', sv.runningBanner);
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

    // 0.1 RUNNING MARQUEE TICKER BANNER
    if (content.runningBanner && content.runningBanner.items && content.runningBanner.items.length > 0) {
      const bannerTrack = document.getElementById('runningBannerTrack');
      if (bannerTrack) {
        const createGroupHtml = () => {
          return content.runningBanner.items.map(item => `
            <div class="marquee-item"><i class="${item.icon || 'fa-solid fa-bolt'} text-gradient"></i> ${item.text}</div>
            <span class="marquee-divider">✦</span>
          `).join('');
        };

        const group1 = `<div class="marquee-group">${createGroupHtml()}</div>`;
        const group2 = `<div class="marquee-group" aria-hidden="true">${createGroupHtml()}</div>`;
        bannerTrack.innerHTML = group1 + group2;
      }
    }

    // 1. Header & Brand
    const headerBadgeText = document.getElementById('headerBadgeText');
    if (headerBadgeText && content.brand) headerBadgeText.textContent = content.brand.headerBadge || '';

    const brandLogos = document.querySelectorAll('.brand-logo-img');
    brandLogos.forEach(img => {
      if (content.brand && content.brand.logoUrl) img.src = content.brand.logoUrl;
      if (content.brand && content.brand.logoHeight) {
        img.style.height = `${content.brand.logoHeight}px`;
      }
    });

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

    const heroPlayBtn = document.getElementById('heroPlayBtn');
    if (heroPlayBtn && content.hero) {
      const vid = content.hero.videoEmbedUrl || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';
      heroPlayBtn.dataset.video = formatMediaUrl(vid, 'video');
    }

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

        renderFrontendDailyPrompts();
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

    // 4.1 Workflow Subtitle
    try {
      if (content.workflow) {
        const wfSub = document.getElementById('workflowSubtitle');
        if (wfSub && content.workflow.subtitle) wfSub.textContent = content.workflow.subtitle;
      }
    } catch (_) {}

    // 5. Portfolio Showcase
    try {
      if (content.portfolio) {
        const pfSub = document.getElementById('portfolioSubtitle');
        if (pfSub && content.portfolio.subtitle) pfSub.textContent = content.portfolio.subtitle;

        renderFrontendPortfolio();
      }
    } catch (pfErr) {
      console.warn('Portfolio hydration note:', pfErr);
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
          c2.className = 'pricing-card featured-plan';
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

      const footerCopy = document.getElementById('footerCopyrightText');
      if (footerCopy && content.contact.copyrightText) footerCopy.textContent = content.contact.copyrightText;

      const footerEmail = document.getElementById('footerEmailLink');
      if (footerEmail && content.contact.email) {
        footerEmail.textContent = content.contact.email;
        footerEmail.href = `mailto:${content.contact.email}`;
      }

      const footerInsta = document.getElementById('footerInstagramLink');
      if (footerInsta && content.contact.instagramHandle) footerInsta.textContent = content.contact.instagramHandle;

      const footerYt = document.getElementById('footerYoutubeLink');
      if (footerYt && content.contact.youtubeChannel) footerYt.textContent = content.contact.youtubeChannel;
    }
  }

  hydratePageFromCMS();
  document.body.classList.add('hydrated');

  // Asynchronously fetch latest server-persisted content and rehydrate if updated
  if (typeof fetchAndSyncSiteContent === 'function') {
    fetchAndSyncSiteContent().then(latestContent => {
      if (latestContent) {
        content = latestContent;
        hydratePageFromCMS();
      }
    }).catch(() => {});
  }

  /* ==========================================================================
     MOBILE NAVIGATION DRAWER
     ========================================================================== */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  const mobileNavCloseBtn = document.getElementById('mobileNavCloseBtn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, #mobileNavCta, #mobileNavWhatsapp');

  function openMobileNav() {
    if (mobileNavDrawer) mobileNavDrawer.classList.add('active');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.add('active');
    if (mobileMenuBtn) {
      mobileMenuBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      mobileMenuBtn.setAttribute('aria-label', 'Close Menu');
      mobileMenuBtn.classList.add('is-open');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (mobileNavDrawer) mobileNavDrawer.classList.remove('active');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.remove('active');
    if (mobileMenuBtn) {
      mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars-staggered"></i>';
      mobileMenuBtn.setAttribute('aria-label', 'Open Menu');
      mobileMenuBtn.classList.remove('is-open');
    }
    document.body.style.overflow = '';
  }

  function toggleMobileNav() {
    if (mobileNavDrawer && mobileNavDrawer.classList.contains('active')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileNav();
    });
  }

  if (mobileNavCloseBtn) mobileNavCloseBtn.addEventListener('click', closeMobileNav);
  if (mobileNavBackdrop) mobileNavBackdrop.addEventListener('click', closeMobileNav);

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
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const htmlElement = document.documentElement;

  const savedTheme = localStorage.getItem('flipcut_theme') || 'light';
  if (savedTheme === 'dark') {
    htmlElement.setAttribute('data-theme', 'dark');
    if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    htmlElement.removeAttribute('data-theme');
    if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = htmlElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        htmlElement.removeAttribute('data-theme');
        localStorage.setItem('flipcut_theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        showToast('Switched to Luxury White Mode ☀️');
      } else {
        htmlElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('flipcut_theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        showToast('Switched to Cinematic Dark Mode 🌙');
      }
    });
  }

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

  function renderFrontendDailyPrompts() {
    const container = document.getElementById('dailyPromptContainer');
    if (!container) return;
    if (!content || !content.dailyPrompts || !content.dailyPrompts.items || content.dailyPrompts.items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
          <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 2rem; margin-bottom: 12px; display: block; color: var(--brand-indigo);"></i>
          <p>No daily creative prompts published yet. Add new prompts directly from the Admin Panel!</p>
        </div>
      `;
      return;
    }

    const items = content.dailyPrompts.items;
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

  function renderFrontendPortfolio() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;
    if (!content || !content.portfolio || !content.portfolio.items) return;

    portfolioGrid.innerHTML = '';
    content.portfolio.items.forEach(item => {
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
            <div class="reel-live-tag"><span class="reel-live-dot"></span> 9:16 REEL</div>
          `;
        } else if (videoSrc) {
          mediaContent = `
            <video class="vertical-reel-video" src="${videoSrc}" poster="${imgUrl}" autoplay loop muted playsinline preload="metadata"></video>
            <div class="reel-live-tag"><span class="reel-live-dot"></span> 9:16 REEL</div>
            <button class="reel-sound-btn" onclick="event.stopPropagation(); window.toggleReelCardSound(this)" title="Toggle Sound"><i class="fa-solid fa-volume-xmark"></i></button>
          `;
        } else {
          mediaContent = `
            <img src="${imgUrl}" alt="${item.title || 'Viral Reel'}" loading="lazy">
            <div class="reel-live-tag"><span class="reel-live-dot"></span> 9:16 REEL</div>
          `;
        }
        overlayIcon = '<div class="play-badge-icon" style="width:auto; padding:8px 16px; border-radius:var(--radius-pill); font-size:0.82rem; font-weight:700; gap:6px;"><i class="fa-solid fa-expand"></i> <span>Watch 4K</span></div>';
      } else if (hasVideo && (item.type === 'video' || category === 'video' || !item.linkUrl)) {
        // Horizontal 16:9 Video
        if (videoSrc && (videoSrc.endsWith('.mp4') || videoSrc.endsWith('.webm') || videoSrc.includes('assets/'))) {
          mediaContent = `
            <video src="${videoSrc}" poster="${imgUrl}" muted playsinline preload="metadata" loop onmouseenter="this.play().catch(()=>{})" onmouseleave="this.pause()" style="width:100%; height:100%; object-fit:cover;"></video>
            <div class="reel-live-tag" style="background: rgba(99, 102, 241, 0.85);"><i class="fa-solid fa-video"></i> 16:9 4K</div>
          `;
        } else {
          mediaContent = `
            <img src="${imgUrl}" alt="${item.title || 'Creative Project'}" loading="lazy">
            <div class="reel-live-tag" style="background: rgba(99, 102, 241, 0.85);"><i class="fa-solid fa-video"></i> 16:9 4K</div>
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

      // Category Icon
      let catIcon = 'fa-solid fa-film';
      if (category === 'graphic') catIcon = 'fa-solid fa-palette';
      if (category === 'uiux') catIcon = 'fa-solid fa-laptop-code';
      if (category === 'clients') catIcon = 'fa-solid fa-crown';

      card.innerHTML = `
        <div class="portfolio-media-thumb">
          ${mediaContent}
          <div class="portfolio-overlay">
            ${overlayIcon}
          </div>
          <span style="position: absolute; top: 14px; left: 14px; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(10px); color: #FFF; font-size: 0.72rem; font-weight: 700; padding: 4px 10px; border-radius: var(--radius-pill); text-transform: uppercase; letter-spacing: 0.06em; border: 1px solid rgba(255,255,255,0.15); z-index: 5;">
            <i class="${catIcon}" style="color: var(--brand-indigo); margin-right: 4px;"></i> ${item.tag || (item.isVertical ? '9:16 REEL' : category.toUpperCase())}
          </span>
        </div>
        <div class="portfolio-info">
          <span class="portfolio-tag">${item.tag || (item.isVertical ? 'Viral Reel & Short' : '16:9 Video Master')}</span>
          <h3>${item.title || 'Creative Showcase Project'}</h3>
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
          openImageModal(imgUrl, item.title, item.tag, item.linkUrl);
        } else if (item.videoUrl) {
          openVideoModal(formatMediaUrl(item.videoUrl, 'video'));
        } else if (item.linkUrl) {
          window.open(item.linkUrl, '_blank', 'noopener,noreferrer');
        } else if (item.image) {
          openImageModal(imgUrl, item.title, item.tag, item.linkUrl);
        }
      });

      portfolioGrid.appendChild(card);
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
    if (!activeBtn) return;
    const filter = activeBtn.dataset.filter || 'reels';

    const items = grid.querySelectorAll('.portfolio-item');
    let visibleCount = 0;
    let onlyVertical = true;

    items.forEach(item => {
      const itemCat = item.dataset.category;
      const isVert = item.classList.contains('is-vertical');
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
        item.style.display = 'flex';
        visibleCount++;
        if (!isVert) onlyVertical = false;
      } else {
        item.style.display = 'none';
      }
    });

    if (filter === 'reels' || (visibleCount > 0 && onlyVertical)) {
      grid.classList.add('vertical-mode');
    } else {
      grid.classList.remove('vertical-mode');
    }
  }

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

  if (heroPlayBtn) {
    heroPlayBtn.addEventListener('click', () => {
      const vidUrl = heroPlayBtn.dataset.video || (content.hero ? content.hero.videoEmbedUrl : 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
      openVideoModal(formatMediaUrl(vidUrl, 'video'));
    });
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
     7. INTERACTIVE FAQ ACCORDION
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    const answer = item.querySelector('.faq-answer');

    if (btn && answer) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            if (otherAnswer) otherAnswer.style.maxHeight = null;
          }
        });

        if (isActive) {
          item.classList.remove('active');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('active');
          answer.style.maxHeight = `${answer.scrollHeight + 20}px`;
        }
      });
    }
  });

  /* ==========================================================================
     8. CONTACT FORM SUBMISSION & SQL DATABASE SYNC
     ========================================================================== */
  const inquiryForm = document.getElementById('projectInquiryForm');

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName').value.trim();
      const email = document.getElementById('clientEmail').value.trim();
      const phone = document.getElementById('clientPhone') ? document.getElementById('clientPhone').value.trim() : '';
      const serviceType = document.getElementById('projectTypeSelect').value;
      const budget = document.getElementById('projectBudget').value;
      const footage = document.getElementById('projectFootageUrl').value.trim();
      const notes = document.getElementById('projectNotes').value.trim();

      if (!name || !email) {
        showToast('Please provide your name and email address.', '#EF4444');
        return;
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

      // 1. Submit to Node Express Backend & Local Storage API
      let assignedUserId = 'FC-REG-' + Math.floor(10000 + Math.random() * 90000);
      try {
        const apiBase = (typeof getContentApiBase === 'function') ? getContentApiBase() : '';
        const response = await fetch(`${apiBase}/api/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...leadPayload, userId: assignedUserId })
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.userId) assignedUserId = resData.userId;
        }
      } catch (networkErr) {
        console.warn('Backend API offline, saving to local cache:', networkErr);
      }

      leadPayload.userId = assignedUserId;

      // 2. Also keep in LocalStorage for offline instant access
      const existingLeads = JSON.parse(localStorage.getItem('flipcut_leads') || '[]');
      existingLeads.unshift({ ...leadPayload, id: Date.now(), date: new Date().toISOString().slice(0, 10), status: 'New' });
      localStorage.setItem('flipcut_leads', JSON.stringify(existingLeads));

      // 3. Trigger Luxury Success Popup Modal
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
      const waNum = (content && content.contact && content.contact.whatsappNum) ? content.contact.whatsappNum.replace(/[^0-9]/g, '') : '919999999999';
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
      const waNum = (content && content.contact && content.contact.whatsappNum) ? content.contact.whatsappNum.replace(/[^0-9]/g, '') : '919999999999';
      const msg = encodeURIComponent(`Hi FlipCut Studio! I just booked the ${packageName} plan (User ID: ${uid}, Payment ID: ${paymentId || ''}). Ready to onboard!`);
      waBtn.href = `https://wa.me/${waNum}?text=${msg}`;
    }

    paymentSuccessModal.classList.add('active');
  }

  window.startPlanCheckout = async function(packageName, amount) {
    try {
      const apiBase = (typeof getContentApiBase === 'function') ? getContentApiBase() : '';
      // 1. Check if Razorpay is configured on server
      let cfg = { enabled: true, keyId: 'rzp_live_TTd5UPSpFLKLor' };
      try {
        const cfgRes = await fetch(`${apiBase}/api/payment/config`);
        if (cfgRes.ok) cfg = await cfgRes.json();
      } catch (_) {}

      if (!cfg.enabled || !cfg.keyId) {
        // If not configured yet, smooth scroll to contact form with pre-filled message
        const contactSec = document.getElementById('contact');
        if (contactSec) {
          contactSec.scrollIntoView({ behavior: 'smooth' });
          const notesEl = document.getElementById('projectNotes');
          if (notesEl) notesEl.value = `Hi FlipCut Studio! I want to book the ${packageName} plan (₹${amount}/month). Please get in touch.`;
          const budgetEl = document.getElementById('projectBudget');
          if (budgetEl) budgetEl.value = '50k-100k';
        }
        showToast(`Selected ${packageName}! Please submit your contact details below to finalize booking.`, 'var(--brand-indigo)');
        return;
      }

      // Prompt client name & phone for seamless receipting (optional quick prompt)
      let clientName = prompt(`Enter your name or brand for ${packageName} booking:`, '');
      if (clientName === null) return; // User cancelled
      clientName = clientName.trim() || 'FlipCut Creator';

      let clientPhone = prompt('Enter your WhatsApp number for invoice & project onboarding:', '');
      if (clientPhone === null) return;
      clientPhone = clientPhone.trim();

      showToast('Initiating secure Razorpay checkout...', 'var(--brand-indigo)');

      // 2. Create Order on backend
      const orderRes = await fetch(`${apiBase}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          packageName: packageName,
          clientName: clientName,
          clientPhone: clientPhone
        })
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        showToast(`Checkout Error: ${orderData.message}`, '#EF4444');
        return;
      }

      // 3. Open Razorpay Checkout Popup
      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "FlipCut Creation",
        description: `Booking: ${packageName} (₹${amount})`,
        image: "assets/logo.png",
        order_id: orderData.order.id,
        prefill: {
          name: clientName,
          contact: clientPhone,
          method: "upi"
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI (Google Pay, PhonePe, Paytm, QR)",
                instruments: [
                  { method: "upi" }
                ]
              },
              other: {
                name: "Cards & Netbanking",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" }
                ]
              }
            },
            sequence: ["block.upi", "block.other"],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        theme: {
          color: "#4F46E5"
        },
        handler: async function(response) {
          // 4. Verify Signature on Backend
          let generatedUserId = 'FC-PAY-' + Math.floor(10000 + Math.random() * 90000);
          try {
            const verifyRes = await fetch(`${apiBase}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                leadData: {
                  name: clientName,
                  phone: clientPhone,
                  service: packageName,
                  amount: amount,
                  packageName: packageName
                }
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              if (verifyData.userId) generatedUserId = verifyData.userId;
              showPaymentSuccessModal(packageName, amount, response.razorpay_payment_id, response.razorpay_order_id, clientName, clientPhone, generatedUserId);
            } else {
              showToast('Payment verification failed. Please contact support.', '#EF4444');
            }
          } catch (e) {
            showPaymentSuccessModal(packageName, amount, response.razorpay_payment_id, response.razorpay_order_id, clientName, clientPhone, generatedUserId);
          }
        },
        modal: {
          ondismiss: function() {
            showToast('Payment window closed.', 'var(--text-muted)');
          }
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        showToast('Razorpay SDK loading... Please retry in a second.', '#EF4444');
      }

    } catch (err) {
      console.error('Razorpay error:', err);
      showToast(`Payment error: ${err.message}`, '#EF4444');
    }
  };

});
