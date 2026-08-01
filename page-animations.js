document.addEventListener("DOMContentLoaded", () => {
  const siteConfig = window.UNCUT_SITE_CONFIG || {};
  const whatsappNumber = String(siteConfig.supportWhatsapp || siteConfig.whatsappNumber || "917439034248").replace(/\D/g, "");

  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.prepend(progress);

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progressValue = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, progressValue))}%`;
  };

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  const helpBubble = document.createElement("button");
  helpBubble.className = "floating-help-bubble";
  helpBubble.type = "button";
  helpBubble.setAttribute("aria-label", "Open website help questions");
  helpBubble.setAttribute("aria-expanded", "false");
  helpBubble.setAttribute("aria-controls", "website-help-panel");
  helpBubble.innerHTML = '<img src="assets/Whatsapp.jpg" alt=""><span>Need Help?</span><strong>WhatsApp</strong>';
  document.body.appendChild(helpBubble);

  window.setTimeout(() => {
    helpBubble.classList.add("is-visible");
  }, 10000);

  const helpPanel = document.createElement("section");
  helpPanel.className = "website-help-panel";
  helpPanel.id = "website-help-panel";
  helpPanel.setAttribute("aria-label", "Website help questions");
  helpPanel.hidden = true;
  helpPanel.innerHTML = `
    <div class="website-help-card" role="dialog" aria-modal="false" aria-labelledby="website-help-title">
      <div class="website-help-head">
        <div>
          <p class="eyebrow">Quick Help</p>
          <h2 id="website-help-title">Select Your Question</h2>
        </div>
        <button class="website-help-close" type="button" aria-label="Close help panel">x</button>
      </div>
      <p class="website-help-intro">Tap one question. The answer will open here like a help chat.</p>
      <div class="website-help-list" role="list">
        <button type="button" class="website-help-question is-active" data-help-answer="courses">Which courses are available?</button>
        <button type="button" class="website-help-question" data-help-answer="price">What is the course price?</button>
        <button type="button" class="website-help-question" data-help-answer="buy">How can I buy a course?</button>
        <button type="button" class="website-help-question" data-help-answer="contact">How can I contact you?</button>
        <button type="button" class="website-help-question" data-help-answer="free">Can I watch free videos first?</button>
        <button type="button" class="website-help-question" data-help-answer="benefits">What benefit will I get after course?</button>
        <button type="button" class="website-help-question" data-help-answer="certificate">Will I get a certificate?</button>
        <button type="button" class="website-help-question" data-help-answer="quiz">How does quiz discount work?</button>
      </div>
      <div class="website-help-answer" data-help-answer-box>
        <strong>Which courses are available?</strong>
        <p>Available courses include MS-Basic, Advanced Excel + MS-Access, Tally Prime + GST, Tally ERP, Power BI, SAP FICO, SAP S4 HANA, and Microsoft Peachtree.</p>
      </div>
      <div class="website-help-actions">
        <a class="website-help-whatsapp" href="https://wa.me/${whatsappNumber}" target="_blank" rel="noopener noreferrer">
          <img src="assets/Whatsapp.jpg" alt="">
          <span>Ask On WhatsApp</span>
        </a>
        <a class="website-help-link" href="courses.html">View Courses</a>
      </div>
    </div>
  `;
  document.body.appendChild(helpPanel);

  const helpAnswers = {
    courses: {
      title: "Which courses are available?",
      text: "Available courses include MS-Basic, Advanced Excel + MS-Access, Tally Prime + GST, Tally ERP, Power BI, SAP FICO, SAP S4 HANA, and Microsoft Peachtree.",
    },
    price: {
      title: "What is the course price?",
      text: "Open the Courses page or any Course Details page to see the exact amount. The payment page also shows your selected course and selected price before payment.",
    },
    buy: {
      title: "How can I buy a course?",
      text: "Open a course, click Amount/Details or Purchase, scan the QR code or copy UPI ID, then send the successful payment screenshot on WhatsApp for confirmation.",
    },
    contact: {
      title: "How can I contact you?",
      text: "You can contact us from the Support page or use the WhatsApp button. WhatsApp is best for course selection, payment help, and access confirmation.",
    },
    free: {
      title: "Can I watch free videos first?",
      text: "Yes. Every course has a See Free Video button. You can watch free topic videos before purchasing the full course.",
    },
    benefits: {
      title: "What benefit will I get after course?",
      text: "You will learn practical software skills, job-focused tasks, reports, entries, dashboards, accounting workflows, and real work practice based on your selected course.",
    },
    certificate: {
      title: "Will I get a certificate?",
      text: "No. Certificate is not provided. The courses focus on practical learning, work confidence, and skill improvement.",
    },
    quiz: {
      title: "How does quiz discount work?",
      text: "Choose a course quiz and answer 20 questions. If your score is 16 or more, you get 10% discount on that selected course.",
    },
  };

  const helpAnswerBox = helpPanel.querySelector("[data-help-answer-box]");
  const helpQuestionButtons = helpPanel.querySelectorAll("[data-help-answer]");

  helpQuestionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const answer = helpAnswers[button.dataset.helpAnswer];
      if (!answer) return;

      helpQuestionButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      helpAnswerBox.innerHTML = `<strong>${answer.title}</strong><p>${answer.text}</p>`;
    });
  });

  const closeHelpPanel = () => {
    helpPanel.hidden = true;
    helpBubble.setAttribute("aria-expanded", "false");
  };

  const openHelpPanel = () => {
    helpPanel.hidden = false;
    helpBubble.setAttribute("aria-expanded", "true");
  };

  helpBubble.addEventListener("click", () => {
    if (helpPanel.hidden) {
      openHelpPanel();
    } else {
      closeHelpPanel();
    }
  });

  helpPanel.querySelector(".website-help-close").addEventListener("click", closeHelpPanel);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeHelpPanel();
  });

  const quizPrompt = document.createElement("a");
  quizPrompt.className = "floating-quiz-prompt";
  quizPrompt.href = "course-quiz.html";
  quizPrompt.setAttribute("aria-label", "Play quiz for discount on course");
  quizPrompt.innerHTML = `
    <span class="floating-quiz-clock" aria-hidden="true">
      <span class="floating-quiz-hand"></span>
    </span>
    <span class="floating-quiz-text">Play Quiz For Discount On Course</span>
  `;
  document.body.appendChild(quizPrompt);

  window.setTimeout(() => {
    quizPrompt.classList.add("is-visible");
  }, 12000);

  document.querySelectorAll(".quiz-contest-link").forEach((banner) => {
    const quizUrl = banner.dataset.quizUrl || "course-quiz.html";

    banner.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        return;
      }

      window.location.href = quizUrl;
    });

    banner.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      window.location.href = quizUrl;
    });
  });

  const heroSliderImages = Array.isArray(window.UNCUT_SITE_CONFIG?.heroImages) && window.UNCUT_SITE_CONFIG.heroImages.length
    ? window.UNCUT_SITE_CONFIG.heroImages
    : [
    "assets/Offer.jpg",
    "assets/Student-Index.jpg",
    "assets/Student-Courses.jpg",
    "assets/Power BI.jpg",
    "assets/Tally Prime.jpg",
    "assets/Advance Excel.jpg",
  ];

  const motionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sliderStyle = siteConfig.sliderStyle || "fade";
  const sliderSpeedMs = Number(siteConfig.sliderSpeedMs || 3500);

  if (motionAllowed && sliderStyle !== "none") document.querySelectorAll("[data-hero-slider]").forEach((image) => {
    let activeIndex = 0;

    window.setInterval(() => {
      activeIndex = (activeIndex + 1) % heroSliderImages.length;
      image.classList.add(sliderStyle === "slide" ? "is-sliding" : "is-changing");

      window.setTimeout(() => {
        image.src = heroSliderImages[activeIndex];
        image.classList.remove("is-changing", "is-sliding");
      }, 320);
    }, sliderSpeedMs);
  });

  const revealItems = document.querySelectorAll(
    ".quiz-contest-banner, .hero-card, .ad-section, .courses-hero, .about-hero, .support-hero, .payment-hero, .course-topics-hero, .course-quiz-promo, .info-card, .course-card, .about-card, .value-card, .support-card, .payment-card, .course-topic-card, .quiz-card, .quiz-result, .review-card, .values-section, .site-footer"
  );

  revealItems.forEach((item, index) => {
    item.classList.add("reveal-item");
    item.style.setProperty("--reveal-delay", `${Math.min(index * 45, 360)}ms`);
  });

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));

  document.querySelectorAll(".stat-pill strong").forEach((stat) => {
    const text = stat.textContent.trim();
    const match = text.match(/^([\d,]+)(.*)$/);

    if (!match) {
      return;
    }

    const target = Number(match[1].replace(/,/g, ""));
    const suffix = match[2];
    let started = false;

    const runCounter = () => {
      const start = performance.now();
      const duration = 1200;

      const tick = (now) => {
        const progressValue = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progressValue, 3);
        stat.textContent = `${Math.round(target * eased).toLocaleString("en-US")}${suffix}`;

        if (progressValue < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    };

    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            runCounter();
            statObserver.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    statObserver.observe(stat);
  });
});
