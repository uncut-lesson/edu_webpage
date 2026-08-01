(() => {
  const fallbackAssignments = [
    { course: "basic", label: "MS-Basics", title: "Create a formatted school notice", task: "Create a one-page MS Word notice with a title, date, table and a saved PDF copy. Then make a simple Paint poster for the same event.", checklist: ["Use headings and bold text", "Insert a 3-column table", "Save both DOCX and PDF files"] },
    { course: "advanced-excel", label: "Advanced Excel A-Z", title: "Monthly sales report and PivotTable", task: "Build a monthly sales sheet, clean the data, calculate totals with formulas and create a PivotTable summary.", checklist: ["Use SUM, IF and XLOOKUP or VLOOKUP", "Format data as a table", "Create one PivotTable and chart"] },
    { course: "tally-prime-gst", label: "Tally Prime + GST", title: "GST invoice and inventory entry", task: "Create a sample company, add stock items, enter one purchase and one GST sales invoice, then check the stock summary.", checklist: ["Create ledgers with GST details", "Use correct purchase and sales vouchers", "Export the stock summary"] },
    { course: "tally-erp", label: "Tally ERP", title: "Voucher entry practice", task: "Enter cash, bank, purchase and sales vouchers for one week of a small business, then view the profit and loss report.", checklist: ["Create required ledgers", "Enter at least six vouchers", "Review the final reports"] },
    { course: "power-bi", label: "Power BI Basic to Advanced", title: "Sales dashboard", task: "Import a small sales CSV file, clean it in Power Query and create a dashboard with KPI cards, a monthly trend and a region chart.", checklist: ["Remove blanks and set data types", "Create one DAX measure", "Add at least three visuals"] },
    { course: "sap-fico", label: "SAP FICO", title: "Finance process map", task: "Map a basic purchase-to-payment process and label the GL, vendor, cost centre and posting steps used in the workflow.", checklist: ["Include a process diagram", "Explain each finance object", "Write five SAP terms with meanings"] },
    { course: "sap-s4-hana", label: "SAP 4 HANA", title: "Fiori finance workflow", task: "Create a short checklist for a Fiori-based finance workflow: master data, transaction, report and approval steps.", checklist: ["Identify the app purpose", "List master data used", "Describe the report output"] },
    { course: "peachtree", label: "Microsoft Peachtree", title: "Small business company setup", task: "Set up a practice company, add customers and vendors, enter sample sales and purchase transactions, then generate a report.", checklist: ["Create company information", "Add two customers and vendors", "Generate one financial report"] },
  ];

  const filter = document.querySelector("#assignment-course-filter");
  const list = document.querySelector("#assignment-list");
  if (!filter || !list) return;

  let assignments = [...fallbackAssignments];
  const requestedCourse = new URLSearchParams(window.location.search).get("course") || "all";
  const escapeHtml = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  const populateFilter = (selectedCourse = filter.value || requestedCourse) => {
    const courses = [...new Map(assignments.map((item) => [item.course, item.label])).entries()];
    filter.innerHTML = `<option value="all">All courses</option>${courses.map(([key, label]) => `<option value="${escapeHtml(key)}">${escapeHtml(label)}</option>`).join("")}`;
    filter.value = courses.some(([key]) => key === selectedCourse) ? selectedCourse : "all";
  };
  populateFilter(requestedCourse);

  const makeText = (item) => [
    `Uncut Lesson — ${item.label}`,
    `Practical assignment: ${item.title}`,
    "",
    "Task",
    item.task,
    "",
    "Checklist",
    ...item.checklist.map((line, index) => `${index + 1}. ${line}`),
    "",
    "Submit your completed files to your instructor or keep them in your practice portfolio.",
  ].join("\n");

  const download = (item) => {
    const blob = new Blob([makeText(item)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${item.course}-practice-assignment.txt`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const render = () => {
    const selected = filter.value;
    const visible = assignments.filter((item) => selected === "all" || item.course === selected);
    list.innerHTML = visible.map((item) => `
      <article class="assignment-card" data-course-key="${item.course}">
        <p class="eyebrow">${escapeHtml(item.label)}</p><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.task)}</p>
        <ul>${item.checklist.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
        <div>${item.downloadUrl ? `<a href="${escapeHtml(item.downloadUrl)}" target="_blank" rel="noopener noreferrer" class="primary-cta">Download assignment</a>` : `<button type="button" class="primary-cta" data-download-assignment="${escapeHtml(item.course)}">Download assignment</button>`}<a href="course-quiz.html?course=${encodeURIComponent(item.course)}" class="secondary-cta">Take quiz</a></div>
      </article>`).join("") || `<p class="assignment-empty">No assignment is available for this course yet.</p>`;
  };

  filter.addEventListener("change", () => {
    const url = new URL(window.location.href);
    if (filter.value === "all") url.searchParams.delete("course"); else url.searchParams.set("course", filter.value);
    history.replaceState({}, "", url);
    render();
  });
  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-download-assignment]");
    if (!button) return;
    const assignment = assignments.find((item) => item.course === button.dataset.downloadAssignment && !item.downloadUrl);
    if (assignment) download(assignment);
  });
  render();

  const config = window.UNCUT_SITE_CONFIG || {};
  if (!config.catalogSyncEnabled || !config.appsScriptEndpoint) return;

  const callbackName = `uncutAssignmentCallback${Date.now()}`;
  const script = document.createElement("script");
  const cleanup = () => {
    window.clearTimeout(timeoutId);
    delete window[callbackName];
    script.remove();
  };
  const timeoutId = window.setTimeout(cleanup, 10000);
  window[callbackName] = (payload) => {
    if (payload?.ok && Array.isArray(payload.assignments)) {
      const labels = new Map(fallbackAssignments.map((item) => [item.course, item.label]));
      const managed = payload.assignments
        .filter((item) => item && item.courseKey && item.title && item.url)
        .map((item) => ({
          course: String(item.courseKey),
          label: labels.get(String(item.courseKey)) || String(item.courseKey).replace(/[-_]/g, " "),
          title: String(item.title),
          task: String(item.instructions || "Download the file and complete the practical exercise."),
          checklist: ["Complete the practical task", "Save your finished work", "Use the course quiz to revise"],
          downloadUrl: String(item.url),
        }));
      if (managed.length) {
        assignments = fallbackAssignments.concat(managed);
        populateFilter();
        render();
      }
    }
    cleanup();
  };
  script.async = true;
  script.src = `${config.appsScriptEndpoint}?action=publicAssignments&callback=${encodeURIComponent(callbackName)}`;
  script.onerror = cleanup;
  document.head.append(script);
})();
