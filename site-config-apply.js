const getSiteConfig = () => window.UNCUT_SITE_CONFIG || {};

const setTextByKey = (key, value) => {
  if (!value) return;
  document.querySelectorAll(`[data-admin-text="${key}"]`).forEach((item) => {
    item.textContent = value;
  });
};

const setHrefByKey = (key, value) => {
  if (!value) return;
  document.querySelectorAll(`[data-admin-href="${key}"]`).forEach((item) => {
    item.setAttribute("href", value);
  });
};

const setImageByKey = (key, value) => {
  if (!value) return;
  document.querySelectorAll(`[data-admin-image="${key}"]`).forEach((item) => {
    item.setAttribute("src", value);
  });
};

const normalizeWhatsAppNumber = (value) => {
  return String(value || "").replace(/\D/g, "");
};

const setWhatsAppLinks = (number) => {
  const cleanNumber = normalizeWhatsAppNumber(number);
  if (!cleanNumber) return;

  document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
    const currentUrl = new URL(link.href);
    const text = currentUrl.searchParams.get("text");
    const nextUrl = new URL(`https://wa.me/${cleanNumber}`);

    if (text) nextUrl.searchParams.set("text", text);
    link.href = nextUrl.toString();
  });
};

const setSupportEmail = (email) => {
  if (!email) return;

  document.querySelectorAll(".contact-link").forEach((link) => {
    if (!link.href.includes("mail.google.com")) return;
    link.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
    const label = link.querySelector("span");
    if (label) label.textContent = email;
  });
};

const applyTheme = (config) => {
  if (config.primaryColor) document.documentElement.style.setProperty("--primary", config.primaryColor);
  if (config.accentColor) document.documentElement.style.setProperty("--accent", config.accentColor);
  if (config.textColor) document.documentElement.style.setProperty("--text", config.textColor);
  if (config.fontStyle) document.body.style.fontFamily = `"${config.fontStyle}", sans-serif`;
  if (config.sliderStyle) document.documentElement.dataset.sliderStyle = config.sliderStyle;
};

const escapeHtml = (value) => String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const addSharedNavigation = () => {
  document.querySelectorAll(".nav-actions").forEach((nav) => {
    nav.innerHTML = `
      <a href="courses.html" class="nav-button">Courses</a>
      <a href="support.html" class="nav-button">Support</a>
      <a href="index.html#why-choose-us" class="nav-button">Why Choose Us</a>
      <a href="refer-earn.html" class="nav-button">Refer &amp; Earn</a>
      <a href="free-video.html" class="nav-button">Free Videos</a>
    `;

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    nav.querySelectorAll("a").forEach((link) => {
      const targetPage = link.getAttribute("href").split("#")[0];
      if (targetPage === currentPage) link.classList.add("nav-button-active");
    });
  });
};

const addSharedAdvertisement = (config) => {
  document.querySelectorAll(".page-shell main").forEach((main) => {
    if (!main.querySelector(".reviews-section") && !main.classList.contains("course-topics-page")) {
      const review = document.createElement("section");
      review.className = "site-review-strip";
      review.setAttribute("aria-label", "Student review");
      review.innerHTML = `
        <p class="eyebrow">Student voice</p>
        <p>“The videos are easy to follow and improved my practical knowledge.”</p>
        <strong>Uncut Lesson learner</strong>
      `;
      main.append(review);
    }

    if (main.querySelector(".site-ad-panel")) return;

    const ad = document.createElement("section");
    ad.className = "site-ad-panel";
    ad.setAttribute("aria-label", "Featured course offer");
    ad.innerHTML = `
      <img src="${escapeHtml(config.adImage || "assets/Offer.jpg")}" alt="Uncut Lesson featured course offer">
      <div>
        <p class="eyebrow">${escapeHtml(config.adEyebrow || "Featured offer")}</p>
        <h2>${escapeHtml(config.adTitle || "Learn practical skills with confidence.")}</h2>
        <p>${escapeHtml(config.adText || "Watch a free preview, then choose the full course when you are ready.")}</p>
        <a class="primary-cta" href="${escapeHtml(config.adSecondaryUrl || "courses.html")}">${escapeHtml(config.adSecondaryText || "View courses")}</a>
      </div>
    `;
    main.append(ad);
  });
};

const addSharedFooter = () => {
  document.querySelectorAll(".site-footer").forEach((footer) => {
    footer.innerHTML = `
      <div class="footer-intro">
        <a class="footer-brand" href="index.html">Uncut Lesson</a>
        <p>Practical learning for computer, accounting and business software skills. For educational purposes.</p>
      </div>
      <div class="footer-socials" aria-label="Social media">
        <a href="https://www.facebook.com/uncutlesson" target="_blank" rel="noopener noreferrer"><svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3.1 0-5 1.9-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9c0-.7.3-1 1-1Z"/></svg>Facebook</a>
        <a href="https://www.instagram.com/uncut_lesson?igsh=anFiYTNqZTltdnk5" target="_blank" rel="noopener noreferrer"><svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="social-icon-fill"/></svg>Instagram</a>
        <a href="https://whatsapp.com/channel/0029VbD3p40IiRotqjBonz2m" target="_blank" rel="noopener noreferrer"><svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.8a8 8 0 0 1-11.8 7L4 20l1.3-4.1A8 8 0 1 1 20 11.8Z"/><path d="M9.1 8.3c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.6.7c.7 1.2 1.5 2 2.7 2.7l.7-.6c.2-.2.4-.2.7-.1l1.8.8c.3.1.4.3.4.5v.5c0 .3-.1.5-.5.7-.6.3-1.3.4-1.9.2-2.5-.8-4.7-3-5.5-5.5-.2-.6-.1-1.3.2-1.9Z"/></svg>WhatsApp Community</a>
        <a href="https://www.reddit.com/user/uncut_lesson/" target="_blank" rel="noopener noreferrer"><svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="12" r="1" class="social-icon-fill"/><circle cx="15" cy="12" r="1" class="social-icon-fill"/><path d="M8.5 15c1.8 1.4 5.2 1.4 7 0M15 7l1-2 2 .6"/></svg>Reddit</a>
        <a href="https://x.com/uncut_lesson" target="_blank" rel="noopener noreferrer"><svg class="social-icon social-x-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h4.6l4 5.4L17.3 3H20l-6.1 7L20.5 21H16l-4.4-6-5.2 6H3.7l6.5-7.5L4 3Zm3 2 9.9 14h1.7L8.7 5H7Z"/></svg>X (Twitter)</a>
      </div>
    `;
  });
};

const addBackToTop = () => {
  if (document.querySelector("[data-back-to-top]")) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "back-to-top";
  button.dataset.backToTop = "";
  button.setAttribute("aria-label", "Back to top");
  button.textContent = "↑";
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.append(button);
};

window.addEventListener("DOMContentLoaded", () => {
  const config = getSiteConfig();

  setTextByKey("brandName", config.brandName);
  setTextByKey("homeHeroEyebrow", config.homeHeroEyebrow);
  setTextByKey("homeHeroTitle", config.homeHeroTitle);
  setTextByKey("homeHeroText", config.homeHeroText);
  setTextByKey("homeHeroPrimaryText", config.homeHeroPrimaryText);
  setTextByKey("homeHeroSecondaryText", config.homeHeroSecondaryText);
  setHrefByKey("homeHeroPrimaryUrl", config.homeHeroPrimaryUrl);
  setHrefByKey("homeHeroSecondaryUrl", config.homeHeroSecondaryUrl);
  setHrefByKey("paymentQrImage", config.paymentQrImage);

  if (Array.isArray(config.heroImages) && config.heroImages[0]) {
    setImageByKey("heroImage", config.heroImages[0]);
  }

  setImageByKey("paymentQrImage", config.paymentQrImage);
  setTextByKey("upiId", config.upiId);
  setTextByKey("supportHeroTitle", config.supportHeroTitle);
  setTextByKey("supportHeroText", config.supportHeroText);
  setTextByKey("paymentHelpText", config.paymentHelpText);
  setWhatsAppLinks(config.supportWhatsapp || config.whatsappNumber);
  setSupportEmail(config.supportEmail);
  applyTheme(config);
  addSharedNavigation();
  addSharedAdvertisement(config);
  addSharedFooter();
  addBackToTop();
});
