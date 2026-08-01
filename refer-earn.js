const REFERRAL_ENDPOINT = "https://script.google.com/macros/s/AKfycbwtIBMIzUCad-KGrhOF63c6qfMiYB5z-YpQc9gFaMrrQ7_aHlWxZszeF_1anwXd0K96Eg/exec";

const cleanReferralPart = (value) => {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 4);
};

const createReferralCode = (name, phone) => {
  const namePart = cleanReferralPart(name) || "UL";
  const phonePart = String(phone || "").replace(/\D/g, "").slice(-4) || String(Date.now()).slice(-4);
  const randomPart = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(2, 4);
  return `UL${namePart}${phonePart}${randomPart}`;
};

window.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-referral-form]");
  if (!form) return;

  const status = document.querySelector("[data-referral-status]");
  const submitButton = document.querySelector("[data-referral-submit]");
  const resultCard = document.querySelector("[data-referral-result]");
  const generatedCode = document.querySelector("[data-generated-code]");
  const generatedLink = document.querySelector("[data-generated-link]");
  const generatedMessage = document.querySelector("[data-generated-message]");
  const copyButton = document.querySelector("[data-copy-referral]");
  const whatsappLink = document.querySelector("[data-share-whatsapp]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const referrerName = document.querySelector("[data-referrer-name]").value.trim();
    const referrerEmail = document.querySelector("[data-referrer-email]").value.trim();
    const referrerPhone = document.querySelector("[data-referrer-phone]").value.trim();
    const referralCode = createReferralCode(referrerName, referrerPhone);
    const referralLink = `${window.location.origin}${window.location.pathname.replace(/refer-earn\.html$/i, "payment.html")}?ref=${encodeURIComponent(referralCode)}`;
    const shareText = `Join Uncut_Lesson course and use my referral code ${referralCode} at payment time: ${referralLink}`;

    generatedCode.textContent = referralCode;
    generatedLink.value = referralLink;
    generatedMessage.value = shareText;
    whatsappLink.href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    resultCard.hidden = false;

    submitButton.disabled = true;
    status.textContent = "Code created. Saving to Google Sheet...";

    try {
      await fetch(REFERRAL_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          action: "createReferralCode",
          referralCode,
          referralLink,
          referrerName,
          referrerEmail,
          referrerPhone,
        }),
      });

      status.textContent = "Saved. Copy your code or share it on WhatsApp.";
      form.reset();
    } catch (error) {
      status.textContent = "Code created, but Google Sheet save failed. Please send the code on WhatsApp.";
    } finally {
      submitButton.disabled = false;
    }
  });

  copyButton.addEventListener("click", async () => {
    const text = generatedMessage.value;

    try {
      await navigator.clipboard.writeText(text);
      copyButton.textContent = "Copied";
    } catch (error) {
      generatedMessage.select();
      copyButton.textContent = "Selected";
    }

    window.setTimeout(() => {
      copyButton.textContent = "Copy Text";
    }, 1800);
  });
});
