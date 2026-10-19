/**
 * Dr. Vibhisha Vaghasia — Academic Portfolio
 * Interactive Script: Canvas Network, Live Filters, BibTeX, Dark Mode
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeroCanvas();
  initScrollProgress();
  initPublicationsFilter();
  initAbstractAccordions();
  initBibtexModals();
  initCertificateModal();
  initContactForm();
  initMobileNav();
  initActiveNavSpy();
});

/* ==========================================================================
   1. Theme Management (Editorial Light & Deep Obsidian Dark)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('vv_portfolio_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const currentTheme = storedTheme ? storedTheme : (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('vv_portfolio_theme', newTheme);
      updateThemeIcon(newTheme);
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
    });
  }
}

function updateThemeIcon(theme) {
  const iconContainer = document.getElementById('theme-toggle-icon');
  if (!iconContainer) return;
  if (theme === 'dark') {
    // Sun icon for switching back to light
    iconContainer.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`;
  } else {
    // Moon icon for switching to dark
    iconContainer.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`;
  }
}

/* ==========================================================================
   2. Interactive Hero Canvas: Molecular & Quantum Network
   ========================================================================== */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let width, height;
  let particles = [];
  
  const mouse = { x: -1000, y: -1000, radius: 140 };

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.parentElement.offsetWidth;
    height = canvas.parentElement.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    createParticles();
  }

  function getColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      node: isDark ? 'rgba(240, 242, 245, 0.45)' : 'rgba(18, 20, 23, 0.35)',
      nodeActive: isDark ? 'rgba(56, 189, 248, 0.85)' : 'rgba(13, 110, 110, 0.85)',
      line: isDark ? 'rgba(240, 242, 245, 0.08)' : 'rgba(18, 20, 23, 0.07)',
      lineActive: isDark ? 'rgba(56, 189, 248, 0.22)' : 'rgba(13, 110, 110, 0.22)'
    };
  }

  function createParticles() {
    particles = [];
    const count = Math.floor((width * height) / 14000); // responsive density
    const particleCount = Math.min(Math.max(count, 35), 85);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 1.2,
        baseRadius: Math.random() * 1.8 + 1.2
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const colors = getColors();

    // Update & draw nodes
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Mouse interaction
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      ctx.beginPath();
      ctx.arc(p.x, p.y, dist < mouse.radius ? p.baseRadius * 1.6 : p.baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = dist < mouse.radius ? colors.nodeActive : colors.node;
      ctx.fill();

      // Connect near neighbors
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const distNodes = Math.hypot(p.x - p2.x, p.y - p2.y);
        const maxDist = 115;

        if (distNodes < maxDist) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          const isNearMouse = (dist < mouse.radius || Math.hypot(mouse.x - p2.x, mouse.y - p2.y) < mouse.radius);
          ctx.strokeStyle = isNearMouse ? colors.lineActive : colors.line;
          ctx.lineWidth = 1 - (distNodes / maxDist);
          ctx.stroke();
        }
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  // Optimize canvas: only run animation when #hero is in viewport
  let isCanvasRunning = false;
  function startCanvas() {
    if (!isCanvasRunning) {
      isCanvasRunning = true;
      animationFrameId = requestAnimationFrame(animate);
    }
  }
  function stopCanvas() {
    if (isCanvasRunning) {
      isCanvasRunning = false;
      cancelAnimationFrame(animationFrameId);
    }
  }

  if ('IntersectionObserver' in window) {
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) startCanvas();
          else stopCanvas();
        });
      }, { threshold: 0.05 });
      observer.observe(heroSection);
    } else {
      startCanvas();
    }
  } else {
    startCanvas();
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener('themeChanged', () => {
    // Redraw with new theme colors immediately
  });

  resize();
}

/* ==========================================================================
   3. Scroll Progress Indicator & Active Navigation Spy (Throttled via rAF)
   ========================================================================== */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function initActiveNavSpy() {
  const sections = document.querySelectorAll('section[id]');
  // Scope selector to primary site header so footer links don't get active state
  const navLinks = document.querySelectorAll('.site-header .nav-link');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        let current = '';
        const scrollPosition = window.pageYOffset + 140;

        sections.forEach((section) => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.clientHeight;
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
          }
        });

        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
          }
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ==========================================================================
   4. Publications Filtering & Live Search
   ========================================================================== */
function initPublicationsFilter() {
  const filterButtons = document.querySelectorAll('.pub-tab-btn');
  const pubCards = document.querySelectorAll('.publication-card');
  const searchInput = document.getElementById('pub-search');
  const visibleCountBadge = document.getElementById('visible-pub-count');

  let activeFilter = 'all';
  let searchQuery = '';

  function applyFilterAndSearch() {
    let count = 0;
    const query = searchQuery.toLowerCase().trim();

    pubCards.forEach(card => {
      const categories = card.dataset.category ? card.dataset.category.split(' ') : [];
      const title = card.querySelector('.pub-title')?.innerText.toLowerCase() || '';
      const authors = card.querySelector('.pub-authors')?.innerText.toLowerCase() || '';
      const journal = card.querySelector('.pub-journal')?.innerText.toLowerCase() || '';
      const year = card.dataset.year || '';

      const matchesFilter = (activeFilter === 'all') || categories.includes(activeFilter);
      const matchesSearch = query === '' || 
        title.includes(query) || 
        authors.includes(query) || 
        journal.includes(query) || 
        year.includes(query);

      if (matchesFilter && matchesSearch) {
        card.style.display = 'block';
        count++;
      } else {
        card.style.display = 'none';
      }
    });

    if (visibleCountBadge) {
      visibleCountBadge.innerText = count;
    }
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilterAndSearch();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      applyFilterAndSearch();
    });
  }

  applyFilterAndSearch();
}

/* ==========================================================================
   5. Abstract Accordions
   ========================================================================== */
function initAbstractAccordions() {
  const toggleButtons = document.querySelectorAll('.pub-accordion-toggle');

  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const parentCard = button.closest('.publication-card');
      const abstractContent = parentCard.querySelector('.pub-abstract-content');
      const isOpen = abstractContent.classList.contains('open');

      if (isOpen) {
        abstractContent.classList.remove('open');
        button.innerHTML = `
          <span>Abstract</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        `;
      } else {
        abstractContent.classList.add('open');
        button.innerHTML = `
          <span>Hide</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
        `;
      }
    });
  });
}

/* ==========================================================================
   6. BibTeX Citation Modal & Copy to Clipboard
   ========================================================================== */
const BIBTEX_DATABASE = {
  "thummar2026malaria": `@article{thummar2026developing,
  title={Developing a Novel Multi-Epitope-Based Vaccine Against Human Malaria: An Immunoinformatics Approach},
  author={Thummar, P. and Patel, S. and Vaghasia, Vibhisha},
  journal={Frontiers in Drug Discovery},
  volume={6},
  year={2026},
  publisher={Frontiers}
}`,
  "senjaliya2026rainfall": `@article{senjaliya2026comprehensive,
  title={A Comprehensive Review of Machine Learning and Deep Learning Approaches for Rainfall Forecasting: Current Progress, Challenges, and Future Directions},
  author={Senjaliya, J. and Vaghasia, Vibhisha and Shah, S. M.},
  journal={Theoretical and Applied Climatology},
  volume={157},
  number={3},
  year={2026},
  publisher={Springer}
}`,
  "vaghasia2024mdr": `@incollection{vaghasia2024silico,
  title={In Silico Identification of Natural Product Inhibitor for Multidrug Resistance Proteins from Selected Gram-Positive Bacteria},
  author={Vaghasia, Vibhisha and Sharma, K. and Mishra, S. and Georrge, J.},
  booktitle={Nanotechnology and In Silico Tools},
  pages={309--317},
  year={2024},
  publisher={Springer}
}`,
  "vaghasia2023epitope": `@article{vaghasia2023epitope,
  title={Epitope Mapping for Identification of Potential Cross-Reactive Peptide for Vaccine Design Against Leptospirosis},
  author={Vaghasia, Vibhisha and Lata, K. S. and Patel, S. and Das, J.},
  journal={Journal of Biomolecular Structure and Dynamics},
  year={2023},
  publisher={Taylor & Francis}
}`,
  "vaghasia2023acetylation": `@article{vaghasia2023deciphering,
  title={Deciphering the Lysine Acetylation Pattern of Leptospiral Strains by In Silico Approach},
  author={Vaghasia, Vibhisha and Lata, K. S. and Patel, S. and Das, J.},
  journal={Network Modeling Analysis in Health Informatics and Bioinformatics},
  year={2023},
  publisher={Springer}
}`,
  "lata2020genome": `@article{lata2020whole,
  title={Whole Genome Sequencing and De Novo Assembly of Three Virulent Indian Isolates of Leptospira},
  author={Lata, K. S. and Vaghasia, Vibhisha and Bhairappanavar, S. B. and Kumar, S. and Ayachit, G. and Patel, S. and Das, J.},
  journal={Infection, Genetics and Evolution},
  pages={104579},
  year={2020},
  publisher={Elsevier}
}`,
  "lata2020vaccine": `@incollection{lata2020vaccine,
  title={Vaccine Design Against Leptospirosis Using an Immunoinformatic Approach},
  author={Lata, K. S. and Vaghasia, Vibhisha and Bhairappanavar, S. and Patel, S. and Das, J.},
  booktitle={Immunoinformatics},
  pages={173--184},
  year={2020},
  publisher={Humana, New York, NY}
}`,
  "lata2018proteomes": `@article{lata2018exploring,
  title={Exploring Leptospiral Proteomes to Identify Potential Candidates for Vaccine Design Against Leptospirosis Using an Immunoinformatics Approach},
  author={Lata, K. S. and Kumar, S. and Vaghasia, Vibhisha and Sharma, P. and Bhairappanavar, S. B. and Soni, S. and Das, J.},
  journal={Scientific Reports},
  volume={8},
  pages={6935},
  year={2018},
  publisher={Nature Publishing Group}
}`,
  "beriwal2018leptodb": `@article{beriwal2018leptodb,
  title={LeptoDB: An Integrated Database of Genomics and Proteomics Resources of Leptospira},
  author={Beriwal, S. and Padhiyar, N. and Bhatt, D. and Pandit, P. D. and Ansari, A. and Lata, K. S. and Saiyed, Z. and Vaghasia, Vibhisha and Soni, S.},
  journal={Database},
  volume={2018},
  year={2018},
  publisher={Oxford University Press}
}`,
  "detroja2026diabetes": `@article{detroja2026early,
  title={AI-Driven Biomarkers for Early Prediction of Type 2 Diabetes: From Multi-Omics Discovery to Clinical Translation},
  author={Detroja, R. and Thummar, P. and Vaghasia, R. and Avinash, G. and Vaghasia, Vibhisha},
  journal={Preprint / Under Review},
  year={2026}
}`,
  "vaghasia2026precision": `@article{vaghasia2026artificial,
  title={Artificial Intelligence and Multi-Omics Integration: Transforming the Future of Precision Oncology},
  author={Vaghasia, Vibhisha and Avinash, G.},
  journal={Preprint / Under Review},
  year={2026}
}`,
  "vaghasia2026plasmodium": `@article{vaghasia2026pan,
  title={Pan-Genome Analysis of Five Human Plasmodium Species},
  author={Vaghasia, Vibhisha and Maheriya, S. and Patel, S.},
  journal={Manuscript Under Review},
  year={2026}
}`
};

function initBibtexModals() {
  const modal = document.getElementById('bibtex-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const codeBlock = document.getElementById('bibtex-code');
  const copyBtn = document.getElementById('modal-copy-bibtex');
  const citeButtons = document.querySelectorAll('.cite-btn');

  let currentBibtex = '';

  citeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const paperKey = btn.dataset.key;
      currentBibtex = BIBTEX_DATABASE[paperKey] || `@misc{vaghasia2026bio,\n  title={${btn.dataset.title || 'Scholarly Work'}},\n  author={Vaghasia, Vibhisha},\n  year={2026}\n}`;
      if (codeBlock) codeBlock.innerText = currentBibtex;
      if (modal) modal.classList.add('open');
    });
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!currentBibtex) return;
      navigator.clipboard.writeText(currentBibtex).then(() => {
        showToast('BibTeX citation copied to clipboard');
      }).catch(() => {
        showToast('Failed to copy. Please manually select and copy.');
      });
    });
  }
}

/* ==========================================================================
   7. Toast Notification Utility (With Debounced Timer)
   ========================================================================== */
let toastDismissTimer = null;

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
    <span>${message}</span>
  `;
  toast.style.display = 'flex';

  if (toastDismissTimer) {
    clearTimeout(toastDismissTimer);
  }
  toastDismissTimer = setTimeout(() => {
    toast.style.display = 'none';
  }, 3200);
}

/* ==========================================================================
   8. Contact Form Handling
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('academic-contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name')?.value || 'Colleague';
    const email = document.getElementById('form-email')?.value || '';
    const subject = document.getElementById('form-subject')?.value || 'Research Collaboration Inquiry';
    const message = document.getElementById('form-message')?.value || '';

    const mailtoLink = `mailto:vaghasiavibhisha@gmail.com?subject=${encodeURIComponent(subject + ' - ' + name)}&body=${encodeURIComponent(
      `From: ${name} (${email})\n\nMessage:\n${message}\n\n[Sent via Dr. Vibhisha Vaghasia Academic Portfolio]`
    )}`;

    window.location.href = mailtoLink;
    showToast('Preparing your email client...');
    form.reset();
  });
}

/* ==========================================================================
   9. Mobile Menu Navigation
   ========================================================================== */
function initMobileNav() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuBtn && mainNav) {
    menuBtn.addEventListener('click', () => {
      mainNav.classList.toggle('mobile-active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('mobile-active');
      });
    });
  }
}

/* ==========================================================================
   10. Certificate Lightbox Modal
   ========================================================================== */
function initCertificateModal() {
  const overlay = document.getElementById('cert-modal');
  const modalTitle = document.getElementById('cert-modal-title');
  const modalBody = document.getElementById('cert-modal-body');
  const closeBtn = document.getElementById('cert-modal-close');
  const downloadBtn = document.getElementById('cert-modal-download');
  const openTabBtn = document.getElementById('cert-modal-open-tab');

  if (!overlay) return;

  function openCertModal(src, title, type) {
    const fileName = src.split('/').pop() || 'certificate';
    modalTitle.textContent = title;

    if (downloadBtn) {
      downloadBtn.href = src;
      downloadBtn.setAttribute('download', fileName);
    }

    if (openTabBtn) {
      openTabBtn.href = src;
    }

    modalBody.innerHTML = '';

    if (type === 'pdf') {
      // Use <object> with embedded fallback for maximum cross-browser reliability (especially Firefox)
      const obj = document.createElement('object');
      obj.data = src + '#toolbar=1&view=FitH';
      obj.type = 'application/pdf';
      obj.title = title;

      // Fallback content shown if Firefox or browser blocks inline PDF embedding
      obj.innerHTML = `
        <div class="cert-pdf-fallback">
          <div class="cert-pdf-fallback-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
          <h4>PDF Preview</h4>
          <p>If Firefox doesn't display the PDF inline below, click <strong>Open in Tab</strong> to view it in Firefox's built-in PDF viewer.</p>
          <div class="cert-pdf-fallback-actions">
            <a href="${src}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="font-size:0.85rem; padding:0.5rem 1.1rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              Open in New Tab
            </a>
            <a href="${src}" download="${fileName}" class="btn btn-outline" style="font-size:0.85rem; padding:0.5rem 1.1rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download
            </a>
          </div>
        </div>
      `;

      modalBody.appendChild(obj);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = title;
      img.loading = 'lazy';
      modalBody.appendChild(img);
    }

    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeCertModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    modalBody.innerHTML = '';
  }

  // Bind all cert-view buttons
  document.querySelectorAll('.cert-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const src   = btn.getAttribute('data-cert-src');
      const title = btn.getAttribute('data-cert-title');
      const type  = btn.getAttribute('data-cert-type'); // 'pdf' | 'img'
      if (src) openCertModal(src, title || 'Certificate', type || 'img');
    });
  });

  // Bind gallery cards for image lightbox
  document.querySelectorAll('.gallery-card').forEach(card => {
    card.addEventListener('click', () => {
      const src = card.getAttribute('data-gallery-src');
      const title = card.getAttribute('data-gallery-title');
      if (src) openCertModal(src, title || 'Academic Photo', 'img');
    });
  });

  // Close handlers
  closeBtn.addEventListener('click', closeCertModal);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeCertModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeCertModal();
  });
}
