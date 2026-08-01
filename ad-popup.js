const siteAdConfig = window.UNCUT_SITE_CONFIG || {};
const autoAdDelay = Number(siteAdConfig.adDelayMs || 60000);
const autoAdClosedAtKey = "uncut_lesson_ad_closed_at";
const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

window.addEventListener("DOMContentLoaded", () => {
  if (siteAdConfig.adEnabled === false) return;

  let autoAdTimer;
  const adPrimaryUrl = siteAdConfig.adPrimaryUrl || "payment.html?course=Uncut%20Lesson%20Featured%20Offer&price=Selected%20on%20confirmation";
  const adSecondaryUrl = siteAdConfig.adSecondaryUrl || "courses.html";

  const popup = document.createElement("div");
  popup.className = "auto-ad-popup";
  popup.innerHTML = `
    <div class="auto-ad-card" role="dialog" aria-modal="true" aria-label="Featured advertisement">
      <button class="auto-ad-close" type="button" aria-label="Close advertisement">&times;</button>
      <div class="auto-ad-copy">
        <p class="eyebrow">${escapeHtml(siteAdConfig.adEyebrow || "Featured Offer")}</p>
        <h2>${escapeHtml(siteAdConfig.adTitle || "New Season Offer For Smart Learners")}</h2>
        <p>${escapeHtml(siteAdConfig.adText || "Join our best-selling classes with guided lessons, practical training, and direct support in one place.")}</p>
        <div class="auto-ad-actions">
          <a class="primary-cta" href="${escapeHtml(adPrimaryUrl)}">${escapeHtml(siteAdConfig.adPrimaryText || "Start Learning")}</a>
          <a class="secondary-cta" href="${escapeHtml(adSecondaryUrl)}">${escapeHtml(siteAdConfig.adSecondaryText || "View Courses")}</a>
        </div>
      </div>
      <a class="auto-ad-visual" href="${escapeHtml(adPrimaryUrl)}">
        <img src="${escapeHtml(siteAdConfig.adImage || "assets/Offer.jpg")}" alt="Promotional education banner">
      </a>
    </div>
  `;

  document.body.appendChild(popup);

  const closeButton = popup.querySelector(".auto-ad-close");
  const getLastClosedAt = () => Number(localStorage.getItem(autoAdClosedAtKey) || 0);

  const schedulePopup = () => {
    clearTimeout(autoAdTimer);
    const remainingDelay = Math.max(0, autoAdDelay - (Date.now() - getLastClosedAt()));

    autoAdTimer = window.setTimeout(() => {
      popup.classList.add("is-visible");
    }, remainingDelay);
  };

  const closePopup = () => {
    popup.classList.remove("is-visible");
    localStorage.setItem(autoAdClosedAtKey, String(Date.now()));
    schedulePopup();
  };

  closeButton.addEventListener("click", closePopup);

  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      closePopup();
    }
  });

  if (Date.now() - getLastClosedAt() >= autoAdDelay) {
    popup.classList.add("is-visible");
  } else {
    schedulePopup();
  }
});
