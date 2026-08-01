const courseOptions = {
  "ms-basic": "MS-Basic",
  "advanced-excel": "Advanced Excel",
  "tally-prime-gst": "Tally Prime + GST",
  "tally-erp": "Tally ERP",
  "power-bi": "Power BI",
  peachtree: "Microsoft Peach Tree",
  "sap-s4-hana": "SAP 4 HANA",
  "sap-fico": "SAP FICO",
};

const freeCourses = {
  basic: {
    label: "Basic Course",
    prefix: "free-video-basic",
    listFile: "free-video-basic.html",
    courseFile: "course-basic.html",
  },
  "advanced-excel": {
    label: "Advanced Excel + MS-Access",
    prefix: "free-video-advanced-excel",
    listFile: "free-video-advanced-excel.html",
    courseFile: "course-advanced-excel.html",
  },
  "tally-prime-gst": {
    label: "Tally Prime + GST",
    prefix: "free-video-tally-prime-gst",
    listFile: "free-video-tally-prime-gst.html",
    courseFile: "course-tally-prime-gst.html",
  },
  "tally-erp": {
    label: "Tally ERP",
    prefix: "free-video-tally-erp",
    listFile: "free-video-tally-erp.html",
    courseFile: "course-tally-erp.html",
  },
  "power-bi": {
    label: "Power BI A to Z",
    prefix: "free-video-power-bi",
    listFile: "free-video-power-bi.html",
    courseFile: "course-power-bi.html",
  },
  "sap-fico": {
    label: "SAP FICO",
    prefix: "free-video-sap-fico",
    listFile: "free-video-sap-fico.html",
    courseFile: "course-sap-fico.html",
  },
  "sap-s4-hana": {
    label: "SAP S4 HANA",
    prefix: "free-video-sap-s4-hana",
    listFile: "free-video-sap-s4-hana.html",
    courseFile: "course-sap-s4-hana.html",
  },
  "microsoft-peachtree": {
    label: "Microsoft Peachtree",
    prefix: "free-video-microsoft-peachtree",
    listFile: "free-video-microsoft-peachtree.html",
    courseFile: "course-microsoft-peachtree.html",
  },
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const escapeJs = (value) => String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const escapeHtml = (value) => String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const slugify = (value) => String(value || "")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "") || "new-topic";

const fillSelect = (select, options) => {
  select.innerHTML = Object.entries(options)
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");
};

const requirePicker = () => {
  if (!window.showOpenFilePicker) {
    throw new Error("Open this builder in Chrome or Edge. File saving needs browser permission.");
  }
};

const chooseFile = async (description, extensions) => {
  requirePicker();
  const accept = {};
  if (extensions.includes(".js")) {
    accept["application/javascript"] = [".js"];
    accept["text/javascript"] = [".js"];
  }
  if (extensions.includes(".html")) {
    accept["text/html"] = [".html"];
  }

  const [handle] = await window.showOpenFilePicker({
    types: [{
      description,
      accept,
    }],
    multiple: false,
  });
  const file = await handle.getFile();
  return { handle, file, text: await file.text() };
};

const writeFile = async (handle, text) => {
  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
};

const saveNewFile = async (suggestedName, text) => {
  if (!window.showSaveFilePicker) {
    throw new Error("Open this builder in Chrome or Edge. File saving needs browser permission.");
  }
  const handle = await window.showSaveFilePicker({
    suggestedName,
    types: [{ description: "HTML file", accept: { "text/html": [".html"] } }],
  });
  await writeFile(handle, text);
};

const findMatching = (text, openIndex, openChar, closeChar) => {
  let depth = 0;
  let quote = "";
  let escaped = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const char = text[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === openChar) depth += 1;
    if (char === closeChar) depth -= 1;
    if (depth === 0) return i;
  }
  return -1;
};

const createRows = (container, count, nameLabel, linkLabel) => {
  container.innerHTML = Array.from({ length: count }, (_, index) => `
    <article class="builder-row">
      <div class="builder-number">${String(index + 1).padStart(2, "0")}</div>
      <label><span>${nameLabel}</span><input type="text" data-row-name required></label>
      <label><span>${linkLabel}</span><input type="url" data-row-link required></label>
    </article>
  `).join("");
};

const createResourceRows = (count) => {
  $("[data-resource-list]").innerHTML = Array.from({ length: count }, (_, index) => `
    <article class="builder-row">
      <div class="builder-number">${String(index + 1).padStart(2, "0")}</div>
      <label><span>Resource Title</span><input type="text" data-resource-title required></label>
      <label><span>PDF Or Drive Folder Link</span><input type="url" data-resource-url required></label>
      <label><span>Type</span><input type="text" data-resource-type value="PDF / Drive Folder"></label>
      <label><span>Description</span><input type="text" data-resource-description placeholder="Short download description"></label>
    </article>
  `).join("");
};

const readRows = (container) => {
  return $$(".builder-row", container).map((row, index) => {
    const name = row.querySelector("[data-row-name]").value.trim();
    const link = row.querySelector("[data-row-link]").value.trim();
    if (!name || !link) throw new Error(`Fill name and link in row ${index + 1}.`);
    return { name, link };
  });
};

const readScopedRows = (container) => {
  return [...container.querySelectorAll(".builder-row")].map((row, index) => {
    const name = row.querySelector("[data-row-name]").value.trim();
    const link = row.querySelector("[data-row-link]").value.trim();
    if (!name || !link) throw new Error(`Fill name and link in row ${index + 1}.`);
    return { name, link };
  });
};

const readResourceRows = () => {
  return [...document.querySelectorAll("[data-resource-list] .builder-row")].map((row, index) => {
    const title = row.querySelector("[data-resource-title]").value.trim();
    const url = row.querySelector("[data-resource-url]").value.trim();
    const type = row.querySelector("[data-resource-type]").value.trim();
    const description = row.querySelector("[data-resource-description]").value.trim();

    if (!title || !url) throw new Error(`Fill resource title and link in row ${index + 1}.`);
    return { title, type, description, url };
  });
};

const buildResourcesFile = () => {
  const resources = readResourceRows();
  return `window.UNCUT_FREE_RESOURCES = ${JSON.stringify(resources, null, 2)};\n\nconst renderFreeResources = () => {\n  const resources = Array.isArray(window.UNCUT_FREE_RESOURCES) ? window.UNCUT_FREE_RESOURCES : [];\n\n  document.querySelectorAll("[data-free-resource-list]").forEach((list) => {\n    if (!resources.length) {\n      list.innerHTML = '<p class="free-resource-empty">No free resources added yet.</p>';\n      return;\n    }\n\n    list.innerHTML = resources.map((resource) => \`\n      <article class="free-resource-card">\n        <div>\n          <p>\${resource.type || "Free Resource"}</p>\n          <h3>\${resource.title || "Download Resource"}</h3>\n          <span>\${resource.description || "Open and download this free resource."}</span>\n        </div>\n        <a href="\${resource.url || "#"}" target="_blank" rel="noopener noreferrer">Download</a>\n      </article>\n    \`).join("");\n  });\n};\n\nwindow.addEventListener("DOMContentLoaded", renderFreeResources);\n`;
};

const buildTopicsCode = () => {
  const rows = readScopedRows($("[data-learning-list]"));
  return `topics: [\n${rows.map(({ name, link }) => `      ["${escapeJs(name)}", "Drive Video", "${escapeJs(link)}"],`).join("\n")}\n    ],`;
};

const replaceLearningTopics = (source, courseId, topicsCode) => {
  const courseStart = source.indexOf(`"${courseId}":`);
  if (courseStart === -1) throw new Error(`Course ${courseId} not found in learning.js.`);
  const topicsIndex = source.indexOf("topics:", courseStart);
  const openIndex = source.indexOf("[", topicsIndex);
  const closeIndex = findMatching(source, openIndex, "[", "]");
  if (topicsIndex === -1 || openIndex === -1 || closeIndex === -1) {
    throw new Error("Could not find topics array.");
  }
  return `${source.slice(0, topicsIndex)}${topicsCode.replace(/,$/, "")}${source.slice(closeIndex + 1)}`;
};

const getLearningId = () => $("[data-learning-course]").value;

const previewLearning = () => {
  try {
    $("[data-learning-output]").value = buildTopicsCode();
    $("[data-learning-status]").textContent = "Preview ready. Save into learning/learning.js.";
  } catch (error) {
    $("[data-learning-status]").textContent = error.message;
  }
};

const saveLearning = async () => {
  try {
    const topicsCode = buildTopicsCode();
    const picked = await chooseFile("Select learning.js", [".js"]);
    const updated = replaceLearningTopics(picked.text, getLearningId(), topicsCode);
    await writeFile(picked.handle, updated);
    $("[data-learning-output]").value = topicsCode;
    $("[data-learning-status]").textContent = `Saved ${getLearningId()} topics into ${picked.file.name}.`;
  } catch (error) {
    $("[data-learning-status]").textContent = error.message || "Save cancelled.";
  }
};

const buildCourseCard = () => {
  const id = slugify($("[data-card-course-id]").value);
  const name = $("[data-card-name]").value.trim();
  const subtitle = $("[data-card-subtitle]").value.trim();
  const price = $("[data-card-price]").value.trim();
  const image = $("[data-card-image]").value.trim();
  if (!id || !name || !price || !image) throw new Error("Fill Course ID, Course Name, Price, and Image Path.");
  return `        <article class="course-card" data-course-category="new">
          <div class="course-head">
            <div class="course-brand">
              <img src="${escapeHtml(image)}" alt="${escapeHtml(name)} course logo">
              <div>
                <p class="course-label">New Course</p>
                <h3>${escapeHtml(name)}</h3>
                ${subtitle ? `<p class="course-subtitle">${escapeHtml(subtitle)}</p>` : ""}
              </div>
            </div>
            <div class="course-actions">
              <a class="course-price" data-track-label="Course Price Button" href="payment.html?course=${encodeURIComponent(name)}&price=${encodeURIComponent(price)}">${escapeHtml(price)}</a>
              <a class="details-link" data-track-label="Course Details Button" href="learning/index.html?course=${encodeURIComponent(id)}">Details</a>
            </div>
          </div>
        </article>`;
};

const replaceCourseCard = (source, courseId, cardHtml) => {
  const marker = `learning/index.html?course=${courseId}`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) throw new Error(`Existing course card ${courseId} not found in courses.html.`);
  const start = source.lastIndexOf("        <article class=\"course-card\"", markerIndex);
  const end = source.indexOf("        </article>", markerIndex);
  if (start === -1 || end === -1) throw new Error("Could not locate full course card.");
  return `${source.slice(0, start)}${cardHtml}${source.slice(end + "        </article>".length)}`;
};

const appendCourseCard = (source, cardHtml) => {
  const courseList = source.indexOf('<section class="course-list">');
  const end = source.indexOf("      </section>", courseList);
  if (courseList === -1 || end === -1) throw new Error("Could not find course-list section.");
  return `${source.slice(0, end)}${cardHtml}\n\n${source.slice(end)}`;
};

const previewCard = () => {
  try {
    $("[data-card-output]").value = buildCourseCard();
    $("[data-card-status]").textContent = "Preview ready. Save into courses.html.";
  } catch (error) {
    $("[data-card-status]").textContent = error.message;
  }
};

const saveCard = async () => {
  try {
    const cardHtml = buildCourseCard();
    const picked = await chooseFile("Select courses.html", [".html"]);
    const action = $("[data-course-action]").value;
    const id = slugify($("[data-card-course-id]").value);
    const updated = action === "add" ? appendCourseCard(picked.text, cardHtml) : replaceCourseCard(picked.text, id, cardHtml);
    await writeFile(picked.handle, updated);
    $("[data-card-output]").value = cardHtml;
    $("[data-card-status]").textContent = `Saved course card into ${picked.file.name}.`;
  } catch (error) {
    $("[data-card-status]").textContent = error.message || "Save cancelled.";
  }
};

const getFreeConfig = () => freeCourses[$("[data-free-course]").value];
const getFreeFileName = () => `${getFreeConfig().prefix}-${slugify($("[data-free-topic]").value)}.html`;

const buildFreeLinks = () => {
  const rows = readScopedRows($("[data-free-list]"));
  return rows.map(({ name, link }) => `          <a class="video-open-link" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a>`).join("\n");
};

const buildFreePage = () => {
  const config = getFreeConfig();
  const topic = $("[data-free-topic]").value.trim();
  if (!topic) throw new Error("Enter topic name.");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(topic)} Free Video | Uncut_Lesson</title>
  <link rel="stylesheet" href="styles.css">
  <script src="site-config.js" defer></script>
  <script src="site-config-apply.js" defer></script>
  <script src="mobile-menu.js" defer></script>
  <script src="page-animations.js" defer></script>
</head>
<body>
  <div class="page-shell">
    <main class="free-video-page">
      <section class="course-topics-hero">
        <div>
          <p class="eyebrow">${escapeHtml(config.label)}</p>
          <h1>${escapeHtml(topic)}</h1>
          <p class="hero-text">Watch free sample videos for this topic before purchasing the full course.</p>
        </div>
        <div class="course-hero-actions">
          <a class="back-link" href="${config.listFile}">Back To Free Videos</a>
          <a class="back-link" href="${config.courseFile}">Back To Course</a>
        </div>
      </section>
      <section class="free-video-card">
        <h2>${escapeHtml(topic)} Free Videos</h2>
        <div class="topic-video-list">
${buildFreeLinks()}
        </div>
      </section>
    </main>
  </div>
</body>
</html>`;
};

const appendFreeLinks = (source, linksHtml) => {
  const listIndex = source.indexOf('class="topic-video-list"');
  if (listIndex === -1) throw new Error("Could not find topic-video-list in selected topic page.");
  const closeIndex = source.indexOf("</div>", listIndex);
  if (closeIndex === -1) throw new Error("Could not find topic video list closing tag.");
  return `${source.slice(0, closeIndex)}${linksHtml}\n${source.slice(closeIndex)}`;
};

const previewFree = () => {
  try {
    $("[data-free-output]").value = $("[data-free-mode]").value === "create" ? buildFreePage() : buildFreeLinks();
    $("[data-free-status]").textContent = "Free video preview ready.";
  } catch (error) {
    $("[data-free-status]").textContent = error.message;
  }
};

const saveFreePage = async () => {
  try {
    const mode = $("[data-free-mode]").value;
    if (mode === "create") {
      const page = buildFreePage();
      await saveNewFile(getFreeFileName(), page);
      $("[data-free-output]").value = page;
      $("[data-free-status]").textContent = `Saved new topic page ${getFreeFileName()}.`;
      return;
    }
    const links = buildFreeLinks();
    const picked = await chooseFile("Select existing free topic page", [".html"]);
    const updated = appendFreeLinks(picked.text, links);
    await writeFile(picked.handle, updated);
    $("[data-free-output]").value = links;
    $("[data-free-status]").textContent = `Added free video links into ${picked.file.name}.`;
  } catch (error) {
    $("[data-free-status]").textContent = error.message || "Save cancelled.";
  }
};

const addFreeTopicButton = async () => {
  try {
    const topic = $("[data-free-topic]").value.trim();
    if (!topic) throw new Error("Enter topic name.");
    const link = `          <a class="free-topic-link" href="${getFreeFileName()}">${escapeHtml(topic)}</a>\n`;
    const picked = await chooseFile(`Select ${getFreeConfig().listFile}`, [".html"]);
    const listIndex = picked.text.indexOf('class="free-topic-list"');
    const closeIndex = picked.text.indexOf("</div>", listIndex);
    if (listIndex === -1 || closeIndex === -1) throw new Error("Could not find free-topic-list.");
    await writeFile(picked.handle, `${picked.text.slice(0, closeIndex)}${link}${picked.text.slice(closeIndex)}`);
    $("[data-free-status]").textContent = `Added topic button into ${picked.file.name}.`;
  } catch (error) {
    $("[data-free-status]").textContent = error.message || "Save cancelled.";
  }
};

const previewResources = () => {
  try {
    $("[data-resource-output]").value = buildResourcesFile();
    $("[data-resource-status]").textContent = "Preview ready. Save into free-resources.js.";
  } catch (error) {
    $("[data-resource-status]").textContent = error.message;
  }
};

const saveResources = async () => {
  try {
    const fileText = buildResourcesFile();
    const picked = await chooseFile("Select free-resources.js", [".js"]);
    await writeFile(picked.handle, fileText);
    $("[data-resource-output]").value = fileText;
    $("[data-resource-status]").textContent = `Saved resources into ${picked.file.name}.`;
  } catch (error) {
    $("[data-resource-status]").textContent = error.message || "Save cancelled.";
  }
};

fillSelect($("[data-learning-course]"), courseOptions);
fillSelect($("[data-free-course]"), Object.fromEntries(Object.entries(freeCourses).map(([key, value]) => [key, value.label])));

$$("[data-tool-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$("[data-tool-tab]").forEach((item) => item.classList.toggle("is-active", item === tab));
    $$("[data-tool-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.toolPanel !== tab.dataset.toolTab;
    });
  });
});

$("[data-learning-fields]").addEventListener("click", () => createRows($("[data-learning-list]"), Number($("[data-learning-count]").value || 1), "Topic Name", "Google Drive Link"));
$("[data-learning-preview]").addEventListener("click", previewLearning);
$("[data-learning-save]").addEventListener("click", saveLearning);
$("[data-card-preview]").addEventListener("click", previewCard);
$("[data-card-save]").addEventListener("click", saveCard);
$("[data-free-fields]").addEventListener("click", () => createRows($("[data-free-list]"), Number($("[data-free-count]").value || 1), "Button Text", "Google Drive Link"));
$("[data-free-preview]").addEventListener("click", previewFree);
$("[data-free-save-page]").addEventListener("click", saveFreePage);
$("[data-free-save-list]").addEventListener("click", addFreeTopicButton);
$("[data-resource-fields]").addEventListener("click", () => createResourceRows(Number($("[data-resource-count]").value || 1)));
$("[data-resource-preview]").addEventListener("click", previewResources);
$("[data-resource-save]").addEventListener("click", saveResources);

createRows($("[data-learning-list]"), 5, "Topic Name", "Google Drive Link");
createRows($("[data-free-list]"), 1, "Button Text", "Google Drive Link");
createResourceRows(1);
