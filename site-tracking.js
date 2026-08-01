(function () {
  const config = window.UNCUT_TRACKING_CONFIG || {};
  const measurementId = (config.googleAnalyticsId || "").trim();
  const pageOpenedAt = Date.now();
  let lastNavigationTarget = "";

  const getPageName = () => window.location.pathname.split("/").pop() || "index.html";

  const getClickLabel = (target) => {
    const customLabel = target.getAttribute("data-track-label");
    if (customLabel) return customLabel.trim();

    const text = target.textContent.replace(/\s+/g, " ").trim();
    const href = target.getAttribute("href");
    return text || href || target.getAttribute("aria-label") || "Unknown Click";
  };

  const sendEvent = (eventName, details) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, {
        page_name: getPageName(),
        ...details,
      });
    }
  };

  const getInternalPage = (href) => {
    if (!href) return "";
    try {
      const url = new URL(href, window.location.href);
      return url.origin === window.location.origin ? (url.pathname.split("/").pop() || "index.html") : "";
    } catch (_) {
      return "";
    }
  };

  const getCourseContext = (target) => {
    const courseContainer = target.closest("[data-course-key], .premium-course-card, .course-topics-page, .assignment-card");
    if (!courseContainer) return "";

    const keyedCourse = courseContainer.getAttribute("data-course-key");
    const heading = courseContainer.querySelector("h1, h2, h3, .course-title, .course-name");
    return keyedCourse || heading?.textContent.replace(/\s+/g, " ").trim().slice(0, 80) || "";
  };

  const getCourseAction = (target, label) => {
    const href = String(target.getAttribute("href") || "").toLowerCase();
    const value = `${label} ${href}`.toLowerCase();
    if (/free|preview/.test(value)) return "free_video";
    if (/detail|course-.*\.html/.test(value)) return "course_details";
    if (/payment|purchase|₹|rs\s*\d/.test(value)) return "payment";
    if (/assignment|download/.test(value)) return "assignment";
    if (/quiz/.test(value)) return "quiz";
    return "";
  };

  if (measurementId) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      page_title: document.title,
      page_path: window.location.pathname,
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    sendEvent("page_ready", {
      page_title: document.title,
      entry_page: getInternalPage(document.referrer) || "external_or_direct",
    });

    document.addEventListener("click", (event) => {
      const target = event.target.closest("a, button");
      if (!target) return;

      const label = getClickLabel(target);
      const destination = getInternalPage(target.href);
      const course = getCourseContext(target);
      const courseAction = getCourseAction(target, label);

      if (destination) lastNavigationTarget = destination;

      sendEvent("site_click", {
        click_label: label,
        click_url: target.href || "",
        click_class: target.className || "",
      });

      if (courseAction) {
        sendEvent("course_action", {
          course_name: course || "not_set",
          action_type: courseAction,
          destination_page: destination || "external_or_action",
        });
      }

      if (/back|return/i.test(label) || target.hasAttribute("data-back-to-top")) {
        sendEvent("navigation_back", {
          click_label: label,
          destination_page: destination || "top_of_page",
        });
      }
    });

    document.addEventListener("submit", (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      const eventName = form.matches("[data-quiz-lead-form]")
        ? "quiz_lead_submit"
        : form.matches("[data-course-review-form]")
          ? "course_review_submit"
          : "form_submit";
      sendEvent(eventName, {
        form_name: form.id || form.getAttribute("name") || form.className || "unnamed_form",
        course_name: getCourseContext(form) || "not_set",
      });
    });
  });

  window.addEventListener("pagehide", () => {
    sendEvent("page_exit", {
      time_on_page_seconds: Math.max(1, Math.round((Date.now() - pageOpenedAt) / 1000)),
      next_page: lastNavigationTarget || "browser_back_or_close",
    });
  });

  window.addEventListener("popstate", () => {
    sendEvent("browser_history_navigation", { direction: "back_or_forward" });
  });
})();
