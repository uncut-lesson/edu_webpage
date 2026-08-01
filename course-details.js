const coursePageData = {
  "course-basic.html": {
    image: "assets/Basic.jpg",
    price: "₹99",
    freeVideo: "free-video-basic.html",
    paidVideos: "learning/index.html?course=ms-basic",
    benefits: ["Write and format professional documents", "Create basic office files with confidence", "Build a strong computer foundation"],
    why: "A practical starting point for students who want to use MS Word and Paint for studies, forms and everyday office tasks.",
    uses: ["School and college projects", "Letters, resumes and reports", "Simple image editing"],
    review: "The lessons made my MS Word work much faster and easier.",
    reviewer: "Riya · Hindi learner",
    similar: ["course-advanced-excel.html", "course-tally-prime-gst.html"],
  },
  "course-advanced-excel.html": {
    image: "assets/Advance Excel.jpg",
    price: "₹299",
    freeVideo: "free-video-advanced-excel.html",
    paidVideos: "learning/index.html?course=advanced-excel",
    benefits: ["Use formulas and lookup functions accurately", "Turn data into clean reports and dashboards", "Work confidently with pivots and data tools"],
    why: "Excel is one of the most useful office skills. Learn the shortcuts, formulas and reporting methods used in day-to-day work.",
    uses: ["MIS and reporting work", "Data cleaning and analysis", "Dashboards and interview tasks"],
    review: "I can now handle reports and pivot tables at work with confidence.",
    reviewer: "Alok Mistri · Kolkata",
    similar: ["course-power-bi.html", "course-basic.html"],
  },
  "course-tally-prime-gst.html": {
    image: "assets/Tally Prime.jpg",
    price: "₹999",
    freeVideo: "free-video-tally-prime-gst.html",
    paidVideos: "learning/index.html?course=tally-prime-gst",
    benefits: ["Understand Tally Prime workflows", "Manage GST and invoice entries", "Practice TDS and inventory management"],
    why: "Build the practical accounting confidence needed for billing, GST and inventory work in small businesses and offices.",
    uses: ["GST invoicing", "TDS entries", "Stock and inventory control"],
    review: "The GST examples are easy to follow and useful for real accounting work.",
    reviewer: "Karthik · Tamil learner",
    similar: ["course-tally-erp.html", "course-microsoft-peachtree.html"],
  },
  "course-tally-erp.html": {
    image: "assets/Tally ERP.jpg",
    price: "₹999",
    freeVideo: "free-video-tally-erp.html",
    paidVideos: "learning/index.html?course=tally-erp",
    benefits: ["Practice voucher entries step by step", "Understand inventory workflows", "Read accounting reports with ease"],
    why: "A clear route into core accounting entries and reporting for learners who want practical experience with Tally ERP.",
    uses: ["Voucher creation", "Inventory entries", "Accounting reports"],
    review: "It improved my understanding of voucher entries and reports.",
    reviewer: "Soham · Bengali learner",
    similar: ["course-tally-prime-gst.html", "course-microsoft-peachtree.html"],
  },
  "course-power-bi.html": {
    image: "assets/Power BI.jpg",
    price: "₹1999",
    freeVideo: "free-video-power-bi.html",
    paidVideos: "learning/index.html?course=power-bi",
    benefits: ["Prepare and transform data with Power Query", "Build practical DAX calculations", "Create clear business dashboards"],
    why: "Power BI helps you present data as useful insights—an important skill for reporting, analytics and business decisions.",
    uses: ["Interactive dashboards", "Sales and finance reporting", "Data-driven presentations"],
    review: "The dashboard lessons helped me understand real reporting work.",
    reviewer: "Pranali · Marathi learner",
    similar: ["course-advanced-excel.html", "course-sap-s4-hana.html"],
  },
  "course-sap-fico.html": {
    image: "assets/SAP-FICO.jpg",
    price: "₹999",
    freeVideo: "free-video-sap-fico.html",
    paidVideos: "learning/index.html?course=sap-fico",
    benefits: ["Understand core financial accounting concepts", "Learn GL, payable accounts and cost centres", "Build familiarity with SAP finance terms"],
    why: "Start with essential SAP finance topics in a simple, practical order before moving into more advanced enterprise workflows.",
    uses: ["General ledger support", "Accounts payable processes", "Cost centre basics"],
    review: "The finance topics are explained simply and are helpful for job preparation.",
    reviewer: "Nandini · English learner",
    similar: ["course-sap-s4-hana.html", "course-tally-prime-gst.html"],
  },
  "course-sap-s4-hana.html": {
    image: "assets/SAP S4 HANA.jpg",
    price: "₹999",
    freeVideo: "free-video-sap-s4-hana.html",
    paidVideos: "learning/index.html?course=sap-s4-hana",
    benefits: ["Navigate key SAP Fiori concepts", "Understand core finance modules", "Learn master data and reporting basics"],
    why: "Get an accessible introduction to SAP 4 HANA concepts, modern navigation and the reporting workflow used by enterprise teams.",
    uses: ["Fiori navigation", "Master data concepts", "Real-time reporting"],
    review: "The short topic-wise format made SAP concepts much less confusing.",
    reviewer: "Ayesha · Hindi learner",
    similar: ["course-sap-fico.html", "course-power-bi.html"],
  },
  "course-microsoft-peachtree.html": {
    image: "assets/Peachtree.jpg",
    price: "₹999",
    freeVideo: "free-video-microsoft-peachtree.html",
    paidVideos: "learning/index.html?course=peachtree",
    benefits: ["Set up a company file correctly", "Manage sales, purchases and inventory", "Use reports for everyday accounting"],
    why: "Learn a practical accounting workflow from company setup through sales, purchases and clear financial reporting.",
    uses: ["Company setup", "Sales and purchase workflow", "Inventory and reports"],
    review: "The workflow examples made the software feel practical from the first lesson.",
    reviewer: "Arjun · English learner",
    similar: ["course-tally-prime-gst.html", "course-tally-erp.html"],
  },
};

const detailFilename = window.location.pathname.split("/").pop() || "";
const detailCourse = coursePageData[detailFilename];
const assignmentCourseKeys = {
  "course-basic.html": "basic",
  "course-advanced-excel.html": "advanced-excel",
  "course-tally-prime-gst.html": "tally-prime-gst",
  "course-tally-erp.html": "tally-erp",
  "course-power-bi.html": "power-bi",
  "course-sap-fico.html": "sap-fico",
  "course-sap-s4-hana.html": "sap-s4-hana",
  "course-microsoft-peachtree.html": "peachtree",
};

const getCourseTitle = () => document.querySelector(".course-topics-hero h1")?.textContent.trim() || "This course";
const getSimilarTitle = (filename) => document.querySelector(`#course-detail-similar [data-page="${filename}"]`)?.textContent || "Explore course";

const makeDetailMarkup = (course, title) => {
  const similar = course.similar.map((page) => `<a href="${page}" data-page="${page}">${page.replace("course-", "").replace(".html", "").replaceAll("-", " ")}</a>`).join("");
  const assignmentUrl = `assignments.html?course=${encodeURIComponent(assignmentCourseKeys[detailFilename] || "")}`;
  return `
    <section class="course-overview" aria-label="${title} overview">
      <img src="${course.image}" alt="${title} course">
      <div>
        <p class="eyebrow">Course overview</p>
        <div class="course-overview-title"><h2>${title}</h2><span>${course.price}</span></div>
        <p>${course.why}</p>
        <div class="course-benefits"><h3>What you’ll gain</h3><ul>${course.benefits.map((item) => `<li>${item}</li>`).join("")}</ul></div>
      </div>
    </section>
    <section class="course-practice-grid" aria-label="Course learning and access">
      <article><p class="eyebrow">Practical uses</p><h2>Use these skills in real tasks</h2><ul>${course.uses.map((item) => `<li>${item}</li>`).join("")}</ul></article>
      <article class="course-access-card"><p class="eyebrow">Start your way</p><h2>Free first. Full course when ready.</h2><p>Free previews and paid lessons are kept separate, so you always know where you are.</p><div class="course-access-actions"><div><span>Free videos</span><a class="preview-action" href="${course.freeVideo}">Watch preview</a></div><div><span>Paid videos</span><a class="course-price" href="${course.paidVideos}">Open full course</a></div><div><span>Practice file</span><a class="preview-action" href="${assignmentUrl}">Download assignment</a></div></div></article>
    </section>
    <section class="course-review-area" aria-labelledby="course-review-title">
      <div><p class="eyebrow">Student review</p><h2 id="course-review-title">“${course.review}”</h2><p>${course.reviewer}</p></div>
      <form class="course-review-form" data-course-review-form data-course-title="${title}" data-course-key="${assignmentCourseKeys[detailFilename] || title}">
        <label>Your name<input name="name" type="text" required placeholder="Your name"></label>
        <label>Your review<textarea name="review" required rows="2" placeholder="Share your learning experience"></textarea></label>
        <button type="submit">Submit review</button>
      </form>
      <div class="course-public-reviews" data-public-course-reviews hidden aria-live="polite"></div>
    </section>
    <section class="similar-courses" id="course-detail-similar" aria-label="Similar courses"><p class="eyebrow">Similar courses</p><h2>Continue your learning path</h2><div>${similar}</div></section>
  `;
};

const collapseCurriculum = () => {
  const curriculum = document.querySelector(".course-topic-card");
  if (!curriculum || curriculum.querySelector("details")) return;

  const heading = curriculum.querySelector("h2");
  const details = document.createElement("details");
  details.className = "curriculum-details";
  const summary = document.createElement("summary");
  summary.textContent = "View the full course curriculum";
  details.append(summary);

  [...curriculum.children].forEach((child) => {
    if (child !== heading) details.append(child);
  });
  if (heading) curriculum.append(heading);
  curriculum.append(details);
  curriculum.classList.add("course-curriculum-card");
};

document.addEventListener("DOMContentLoaded", () => {
  if (!detailCourse) return;
  const page = document.querySelector(".course-topics-page");
  const hero = document.querySelector(".course-topics-hero");
  if (!page || !hero) return;

  const overview = document.createElement("div");
  overview.className = "course-detail-enhancement";
  overview.innerHTML = makeDetailMarkup(detailCourse, getCourseTitle());
  hero.insertAdjacentElement("afterend", overview);
  collapseCurriculum();

  overview.querySelectorAll("[data-course-review-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "Student").trim();
      const review = String(data.get("review") || "").trim();
      const message = `Course review for ${form.dataset.courseTitle}:\n\n${name}: ${review}`;
      window.open(`https://wa.me/917439034248?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");

      const endpoint = window.UNCUT_SITE_CONFIG?.appsScriptEndpoint;
      if (endpoint) {
        fetch(endpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "reviewSubmission",
            studentName: name,
            review,
            courseKey: form.dataset.courseKey,
          }),
        }).catch(() => {});
      }
    });
  });

  const publicReviews = overview.querySelector("[data-public-course-reviews]");
  const courseKey = assignmentCourseKeys[detailFilename];
  const endpoint = window.UNCUT_SITE_CONFIG?.appsScriptEndpoint;
  if (!publicReviews || !courseKey || !endpoint) return;

  const callbackName = `uncutReviewsCallback${Date.now()}`;
  const script = document.createElement("script");
  const cleanup = () => {
    window.clearTimeout(timeoutId);
    delete window[callbackName];
    script.remove();
  };
  const timeoutId = window.setTimeout(cleanup, 10000);
  window[callbackName] = (payload) => {
    const reviews = payload?.ok && Array.isArray(payload.reviews) ? payload.reviews.slice(0, 2) : [];
    if (reviews.length) {
      const heading = document.createElement("h3");
      heading.textContent = "More student reviews";
      const list = document.createElement("div");
      list.className = "course-public-review-list";
      reviews.forEach((item) => {
        const quote = document.createElement("blockquote");
        const text = document.createElement("p");
        const author = document.createElement("footer");
        text.textContent = `“${String(item.review || "").slice(0, 1200)}”`;
        author.textContent = [item.studentName, item.language].filter(Boolean).join(" · ");
        quote.append(text, author);
        list.append(quote);
      });
      publicReviews.replaceChildren(heading, list);
      publicReviews.hidden = false;
    }
    cleanup();
  };
  script.async = true;
  script.src = `${endpoint}?action=publicReviews&courseKey=${encodeURIComponent(courseKey)}&callback=${encodeURIComponent(callbackName)}`;
  script.onerror = cleanup;
  document.head.append(script);
});
