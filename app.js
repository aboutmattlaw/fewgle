const sources = [
  { name: "Greenhouse", domain: "boards.greenhouse.io", core: true },
  { name: "Lever", domain: "jobs.lever.co", core: true },
  { name: "Workday", domain: "myworkdayjobs.com", core: true },
  { name: "Ashby", domain: "jobs.ashbyhq.com", core: true },
  { name: "SmartRecruiters", domain: "jobs.smartrecruiters.com", core: true },
  { name: "iCIMS", domain: "icims.com/jobs", core: true },
  { name: "BambooHR", domain: "bamboohr.com/careers", core: false },
  { name: "Jobvite", domain: "jobs.jobvite.com", core: false },
  { name: "Comeet", domain: "comeet.com/jobs", core: false },
  { name: "Recruitee", domain: "recruitee.com", core: false },
  { name: "Pinpoint", domain: "pinpointhq.com", core: false },
  { name: "Teamtailor", domain: "teamtailor.com/jobs", core: false },
  { name: "Workable", domain: "apply.workable.com", core: false },
  { name: "JazzHR", domain: "applytojob.com", core: false },
  { name: "Rippling", domain: "ats.rippling.com", core: false },
  { name: "Personio", domain: "jobs.personio.com", core: false },
];

const form = document.querySelector("#search-form");
const sourceList = document.querySelector("#source-list");
const queryInput = document.querySelector("#search-query");
const locationInput = document.querySelector("#location-query");
const exactInput = document.querySelector("#exact-query");
const preview = document.querySelector("#query-preview");
const previewLink = document.querySelector("#preview-link");
const copyButton = document.querySelector("#copy-query");
const selectAll = document.querySelector("#select-all");
const selectCore = document.querySelector("#select-core");
const selectNone = document.querySelector("#select-none");

function renderSources() {
  sourceList.innerHTML = "";

  sources.forEach((source, index) => {
    const id = `source-${index}`;
    const label = document.createElement("label");
    label.className = "source-item";
    label.htmlFor = id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.value = source.domain;
    checkbox.checked = true;
    checkbox.dataset.core = String(source.core);

    const text = document.createElement("span");
    text.innerHTML = `<span class="source-name">${source.name}</span><span class="source-domain">${source.domain}</span>`;

    label.append(checkbox, text);
    sourceList.append(label);
  });
}

function quotePhrase(value) {
  const trimmed = value.trim();
  return trimmed ? `"${trimmed.replaceAll('"', '\\"')}"` : "";
}

function getSelectedDomains() {
  return [...sourceList.querySelectorAll("input:checked")].map((input) => input.value);
}

function buildQuery() {
  const terms = queryInput.value.trim();
  const exact = quotePhrase(exactInput.value);
  const location = locationInput.value.trim();
  const selectedDomains = getSelectedDomains();
  const domainQuery = selectedDomains.map((domain) => `site:${domain}`).join(" OR ");
  const pieces = [terms, exact, location, domainQuery ? `(${domainQuery})` : ""];

  return pieces.filter(Boolean).join(" ");
}

function updatePreview() {
  const query = buildQuery();
  preview.textContent = query || "Your Google query will appear here.";
  previewLink.href = query ? `https://www.google.com/search?q=${encodeURIComponent(query)}` : "#";
  previewLink.setAttribute("aria-disabled", String(!query));
}

function setSourceSelection(mode) {
  sourceList.querySelectorAll("input").forEach((input) => {
    if (mode === "all") input.checked = true;
    if (mode === "none") input.checked = false;
    if (mode === "core") input.checked = input.dataset.core === "true";
  });
  updatePreview();
}

renderSources();
updatePreview();

form.addEventListener("input", updatePreview);
sourceList.addEventListener("change", updatePreview);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = buildQuery();
  if (!query) return;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank", "noreferrer");
});

copyButton.addEventListener("click", async () => {
  const query = buildQuery();
  if (!query) return;

  try {
    if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(query);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = query;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  copyButton.textContent = "Copied";
  setTimeout(() => {
    copyButton.textContent = "Copy Query";
  }, 1200);
});

selectAll.addEventListener("click", () => setSourceSelection("all"));
selectCore.addEventListener("click", () => setSourceSelection("core"));
selectNone.addEventListener("click", () => setSourceSelection("none"));
