document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".course-topic-card .topic-list").forEach((list) => {
    const items = Array.from(list.children);
    const card = list.closest(".course-topic-card");

    if (items.length < 2 || list.dataset.sliderReady === "true") {
      return;
    }

    list.dataset.sliderReady = "true";
    list.classList.add("topic-slider");
    list.setAttribute("aria-label", "Auto sliding course topics");
    list.setAttribute("aria-live", "polite");
    let activeIndex = 0;
    const controls = document.createElement("div");
    controls.className = "topic-slider-controls";
    controls.innerHTML = `
      <button type="button" data-topic-prev aria-label="Previous topic">Prev</button>
      <div class="topic-slider-dots" aria-hidden="true"></div>
      <button type="button" data-topic-next aria-label="Next topic">Next</button>
    `;

    const dots = controls.querySelector(".topic-slider-dots");
    items.forEach((_, index) => {
      const dot = document.createElement("span");
      dot.className = "topic-slider-dot";
      dot.dataset.topicDot = String(index);
      dots.appendChild(dot);
    });

    card.appendChild(controls);

    const showItem = (index) => {
      items.forEach((item, itemIndex) => {
        const isActive = itemIndex === index;
        item.classList.toggle("is-active", isActive);
        item.hidden = !isActive;
        item.setAttribute("aria-label", `Topic ${itemIndex + 1} of ${items.length}`);
      });

      controls.querySelectorAll(".topic-slider-dot").forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    showItem(activeIndex);

    const move = (step) => {
      activeIndex = (activeIndex + step + items.length) % items.length;
      showItem(activeIndex);
    };

    window.setInterval(() => {
      if (list.dataset.paused === "true") {
        return;
      }

      move(1);
    }, Math.max(2600, Math.min(4200, items.length * 450)));

    list.addEventListener("mouseenter", () => {
      list.dataset.paused = "true";
    });

    list.addEventListener("mouseleave", () => {
      list.dataset.paused = "false";
    });

    controls.querySelector("[data-topic-prev]").addEventListener("click", () => {
      list.dataset.paused = "true";
      move(-1);
    });

    controls.querySelector("[data-topic-next]").addEventListener("click", () => {
      list.dataset.paused = "true";
      move(1);
    });

    dots.addEventListener("click", (event) => {
      const dot = event.target.closest("[data-topic-dot]");
      if (!dot) return;

      list.dataset.paused = "true";
      activeIndex = Number(dot.dataset.topicDot);
      showItem(activeIndex);
    });
  });
});
