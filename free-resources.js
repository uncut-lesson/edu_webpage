window.UNCUT_FREE_RESOURCES = [
  {
    title: "500+ Free Templates",
    type: "Drive Folder",
    description: "Excel, MS Word, and PowerPoint work templates.",
    url: "https://drive.google.com/drive/folders/1z8Ek5r2NjayCiSSyRMV8xDT80uA0ODPu?usp=drive_link",
  },
];

const renderFreeResources = () => {
  const resources = Array.isArray(window.UNCUT_FREE_RESOURCES) ? window.UNCUT_FREE_RESOURCES : [];

  document.querySelectorAll("[data-free-resource-list]").forEach((list) => {
    if (!resources.length) {
      list.innerHTML = '<p class="free-resource-empty">No free resources added yet.</p>';
      return;
    }

    list.innerHTML = resources.map((resource) => `
      <article class="free-resource-card">
        <div>
          <p>${resource.type || "Free Resource"}</p>
          <h3>${resource.title || "Download Resource"}</h3>
          <span>${resource.description || "Open and download this free resource."}</span>
        </div>
        <a href="${resource.url || "#"}" target="_blank" rel="noopener noreferrer">Download</a>
      </article>
    `).join("");
  });
};

window.addEventListener("DOMContentLoaded", renderFreeResources);
