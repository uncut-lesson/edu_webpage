(() => {
  const getConfig = () => window.UNCUT_SITE_CONFIG || {};
  const createPaymentUrl = (course) => `payment.html?course=${encodeURIComponent(course.name || "Selected Course")}&price=${encodeURIComponent(course.price || "To be confirmed")}`;
  const getCardTitle = (card) => card.querySelector(".course-card-content h2, .course-card-content h3");
  const formatCoursePrice = (value) => {
    const price = String(value || "").trim();
    if (!price) return "Price";
    if (/^rs\s*/i.test(price)) return price.replace(/^rs\s*/i, "₹");
    if (/^₹/.test(price)) return price;
    return /^\d+(?:\.\d+)?$/.test(price) ? `₹${price}` : price;
  };

  const updateCard = (card, course) => {
    const image = card.querySelector("img");
    const label = card.querySelector(".course-label");
    const title = getCardTitle(card);
    const description = card.querySelector(".course-card-content p:not(.course-label)");
    const badge = card.querySelector(".course-badge");
    const preview = card.querySelector(".preview-action");
    const details = card.querySelector(".details-link");
    const price = card.querySelector(".course-price");

    if (image && course.imageUrl) image.src = course.imageUrl;
    if (image && course.name) image.alt = `${course.name} course`;
    if (label && course.category) label.textContent = course.category.replace(/\b\w/g, (letter) => letter.toUpperCase());
    if (title && course.name) title.textContent = course.name;
    if (description && course.description) description.textContent = course.description;
    if (badge) {
      badge.textContent = course.badge || "Free preview";
      badge.hidden = !course.badge;
    }
    if (preview && course.freeVideoUrl) preview.href = course.freeVideoUrl;
    if (details && course.detailsUrl) details.href = course.detailsUrl;
    if (price) {
      price.href = createPaymentUrl(course);
      price.textContent = formatCoursePrice(course.price);
    }
    card.hidden = false;
  };

  const createCatalogCard = (course) => {
    const card = document.createElement("article");
    card.className = "course-card premium-course-card";
    card.dataset.courseKey = course.key;
    card.dataset.courseCategory = course.category || "professional";
    card.dataset.courseSearch = `${course.name || ""} ${course.description || ""} ${course.category || ""}`;
    card.innerHTML = `
      <div class="course-card-visual"><img alt="" loading="lazy" decoding="async"><span class="course-badge"></span></div>
      <div class="course-card-content"><p class="course-label"></p><h2></h2><p></p></div>
      <div class="course-actions" aria-label="Course actions"><a class="preview-action">Free video</a><a class="details-link">Details</a><a class="course-price">Price</a></div>
    `;
    updateCard(card, course);
    return card;
  };

  const applyCatalog = (payload) => {
    if (!payload || !payload.ok || !Array.isArray(payload.courses)) return;
    const courses = payload.courses.filter((course) => course && course.key);
    const coursesByKey = new Map(courses.map((course) => [course.key, course]));

    document.querySelectorAll("[data-course-key]").forEach((card) => {
      const course = coursesByKey.get(card.dataset.courseKey);
      if (course) updateCard(card, course);
      else card.hidden = true;
    });

    const catalogList = document.querySelector(".catalog-course-list");
    if (!catalogList) return;
    const visibleKeys = new Set([...catalogList.querySelectorAll("[data-course-key]")].map((card) => card.dataset.courseKey));
    courses.filter((course) => !visibleKeys.has(course.key)).forEach((course) => catalogList.append(createCatalogCard(course)));
  };

  document.addEventListener("DOMContentLoaded", () => {
    const config = getConfig();
    if (!config.catalogSyncEnabled || !config.appsScriptEndpoint) return;

    const callbackName = `uncutCatalogCallback${Date.now()}`;
    const script = document.createElement("script");
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      delete window[callbackName];
      script.remove();
    };
    const timeoutId = window.setTimeout(cleanup, 10000);

    window[callbackName] = (payload) => {
      applyCatalog(payload);
      cleanup();
    };

    script.async = true;
    script.src = `${config.appsScriptEndpoint}?action=publicCatalog&callback=${encodeURIComponent(callbackName)}`;
    script.onerror = cleanup;
    document.head.append(script);
  });
})();
