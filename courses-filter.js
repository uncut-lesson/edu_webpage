document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll("[data-course-filter]");
  const cards = document.querySelectorAll("[data-course-category]");
  const searchInput = document.querySelector("[data-course-search-input]");
  const emptyState = document.querySelector("[data-course-empty]");
  const params = new URLSearchParams(window.location.search);
  let activeFilter = "all";

  if (!cards.length) return;

  const normalize = (value) => String(value || "").toLowerCase().trim();

  const applyFilter = () => {
    const searchTerm = normalize(searchInput?.value);
    let visibleCards = 0;

    cards.forEach((card) => {
      const categories = (card.dataset.courseCategory || "").split(" ");
      const searchableText = normalize(`${card.dataset.courseSearch || ""} ${card.textContent}`);
      const matchesFilter = activeFilter === "all" || categories.includes(activeFilter);
      const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
      const shouldShow = matchesFilter && matchesSearch;

      card.hidden = !shouldShow;
      card.classList.toggle("is-filter-hidden", !shouldShow);
      if (shouldShow) visibleCards += 1;
    });

    if (emptyState) emptyState.hidden = visibleCards !== 0;
  };

  if (searchInput && params.get("q")) searchInput.value = params.get("q");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeFilter = tab.dataset.courseFilter || "all";
      tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
      applyFilter();
    });
  });

  searchInput?.addEventListener("input", applyFilter);
  applyFilter();
});
