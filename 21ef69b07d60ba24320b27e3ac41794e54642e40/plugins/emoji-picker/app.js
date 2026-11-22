// Emoji Picker: the emojis of Unicode, shown only where the system's own emoji font draws them.
// Click an emoji to copy it.

const FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
const GROUPS = ["smileys", "people", "nature", "food", "travel", "activities", "objects", "symbols"];
const GROUP_ICONS = {
  smileys: "😀", people: "👋", nature: "🐱", food: "🍔",
  travel: "🚗", activities: "⚽", objects: "💡", symbols: "🔣"
};
const RECENT_MAX = 60;
const FE0F = "️";

// Names and keywords in the user's language: the Unicode CLDR annotations, one file per language,
// downloaded once and kept in the plugin's data files.
const NAMES_VERSION = "49.0.0";
const NAMES_URL = "https://cdn.jsdelivr.net/npm/cldr-annotations-full@" + NAMES_VERSION + "/annotations/";
const NAMES_LOCALE = { "zh-CN": "zh", "zh-TW": "zh-Hant", "pt-BR": "pt" };

const el = (id) => document.getElementById(id);
const $q = el("q"), $clearSearch = el("clearSearch"), $size = el("size"), $cats = el("cats");
const $subbar = el("subbar"), $subRecent = el("subRecent"), $subFav = el("subFav"), $clearList = el("clearList");
const $grid = el("grid"), $preview = el("preview"), $name = el("name"), $fav = el("fav");

// ---------- words ----------

function word(key) {
  const table = window.I18N[pf.lang] || window.I18N.en;
  return table[key] || window.I18N.en[key] || key;
}

function normalize(text) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// ---------- the emoji list ----------

// One item per line of emoji-data.js: emoji|t|English name
const items = [];
for (const group of GROUPS) {
  for (const line of window.EMOJI_DATA[group] || []) {
    const part = line.split("|");
    items.push({
      base: part[0], tone: part[1] === "t", group: group, en: part[2] || "",
      hayEn: normalize(part[2] || ""), local: "", hayLocal: "",
      hex: Array.from(part[0]).map((c) => c.codePointAt(0).toString(16)),
      shown: part[0], ok: false
    });
  }
}
const byBase = new Map(items.map((item) => [item.base, item]));

// The emoji with skin tone 1 to 5 placed right after its first person.
function withTone(base, tone) {
  const cps = Array.from(base);
  const first = cps.shift();
  if (cps[0] === FE0F) cps.shift();
  return first + String.fromCodePoint(0x1F3FA + tone) + cps.join("");
}

function toneSetting() {
  const tone = Number(pf.settings.tone);
  return tone >= 1 && tone <= 5 ? tone : 0;
}

// ---------- does the system draw it? ----------

// A font draws a code point it does not have as a "missing glyph" box, narrower than an emoji, and
// a sequence it has no single picture for as several pictures side by side, wider than one.
// Measuring the text tells the three apart.
const probe = document.createElement("canvas").getContext("2d");
probe.font = "28px " + FONT;
const oneWidth = probe.measureText("😀").width;
const boxWidth = probe.measureText("\u{10FFFE}").width;
const fontDraws = Math.abs(oneWidth - boxWidth) > 0.5;

function isDrawn(text) {
  if (!fontDraws) return false;
  const width = probe.measureText(text).width;
  return Math.abs(width - boxWidth) > 0.5 && width < oneWidth * 1.4;
}

function later() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

let testRun = 0;

// Decides, for each emoji, whether it is shown (with the skin tone chosen in the settings). The
// first time takes about a second, so the emojis the system does not draw are kept in a data file;
// afterwards only those are looked at again, in case a Windows update brought them.
async function testAll() {
  const run = ++testRun;
  const tone = toneSetting();
  const file = "support-" + window.EMOJI_VERSION + "-" + tone + ".json";
  for (const item of items) {
    item.shown = tone && item.tone ? withTone(item.base, tone) : item.base;
  }
  const saved = await readJson(file, null);
  if (run !== testRun) return false;
  if (saved && saved.count === items.length && Array.isArray(saved.missing)) {
    const missing = new Set(saved.missing);
    let brought = false;
    for (const item of items) {
      item.ok = !missing.has(item.base);
      if (!item.ok && isDrawn(item.shown)) {
        item.ok = true;
        brought = true;
      }
    }
    if (brought) keepSupport(file);
    return true;
  }
  for (let i = 0; i < items.length; i++) {
    items[i].ok = isDrawn(items[i].shown);
    if (i % 100 === 99) {
      await later();
      if (run !== testRun) return false;
    }
  }
  if (items.some((item) => item.ok)) keepSupport(file);
  return true;
}

function keepSupport(file) {
  const missing = items.filter((item) => !item.ok).map((item) => item.base);
  pf.data.write(file, JSON.stringify({ count: items.length, missing: missing })).catch(() => {});
}

// ---------- what is kept ----------

let state = { recent: [], favorites: [] };
let ui = { size: 30, cat: "smileys", sub: "recent" };
const uiFile = pf.fence.id + "-ui.json";

async function readJson(name, fallback) {
  try {
    const text = await pf.data.read(name);
    return text ? JSON.parse(text) : fallback;
  } catch (err) {
    return fallback;
  }
}

function keepState() {
  pf.data.write("state.json", JSON.stringify(state)).catch(() => {});
}

function keepUi() {
  pf.data.write(uiFile, JSON.stringify(ui)).catch(() => {});
}

function cleanList(list) {
  return Array.isArray(list) ? list.filter((base) => byBase.has(base)) : [];
}

async function loadState() {
  const saved = await readJson("state.json", {});
  state = { recent: cleanList(saved.recent), favorites: cleanList(saved.favorites) };
}

// ---------- names in the user's language ----------

let namesRun = 0;

// { v, n: { emoji: [name, keywords] } } from the CLDR file of a language, only for the emojis here.
async function downloadNames(lang) {
  try {
    const response = await fetch(NAMES_URL + (NAMES_LOCALE[lang] || lang) + "/annotations.json");
    if (!response.ok) return null;
    const notes = (await response.json()).annotations.annotations;
    const names = {};
    for (const item of items) {
      const note = notes[item.base] || notes[item.base.replace(/️/g, "")];
      if (!note || !note.tts) continue;
      const name = note.tts[0];
      const keywords = (note.default || []).filter((keyword) => keyword !== name).join(", ");
      names[item.base] = [name, keywords];
    }
    return { v: NAMES_VERSION, n: names };
  } catch (err) {
    return null;
  }
}

async function loadNames() {
  const run = ++namesRun;
  const lang = pf.lang;
  const file = "names-" + lang + ".json";
  let table = await readJson(file, null);
  if (!table || table.v !== NAMES_VERSION) {
    table = await downloadNames(lang);
    if (table) pf.data.write(file, JSON.stringify(table)).catch(() => {});
  }
  if (run !== namesRun) return;
  for (const item of items) {
    const row = table && table.n[item.base];
    item.local = row ? row[0] : "";
    item.hayLocal = row ? normalize(row[0] + " " + row[1]) : "";
  }
  if (ready) {
    renderGrid();
    renderFoot();
  }
}

// ---------- the view ----------

let query = "";
let selected = null;   // an item
let hovered = null;
let confirmTimer = 0;
let toastTimer = 0;
let ready = false;
let searchTimer = 0;

function itemName(item) {
  return item.local || item.en;
}

function visibleItems() {
  const text = normalize(query.trim());
  if (text) {
    const terms = text.split(/\s+/);
    const hexTerm = /^(u\+)?([0-9a-f]{4,6})$/.exec(text);
    const hex = hexTerm ? hexTerm[2].replace(/^0+/, "") : "";
    return items.filter((item) => {
      if (!item.ok) return false;
      if (hexTerm && item.hex.includes(hex)) return true;
      const hay = item.hayEn + " " + item.hayLocal;
      return terms.every((term) => hay.includes(term));
    });
  }
  if (ui.cat === "recent") {
    const list = ui.sub === "favorites" ? state.favorites : state.recent;
    return list.map((base) => byBase.get(base)).filter((item) => item && item.ok);
  }
  return items.filter((item) => item.ok && item.group === ui.cat);
}

function emptyText() {
  if (!ready) return word("loading");
  if (!items.some((item) => item.ok)) return word("noFont");
  if (query.trim()) return word("noResult");
  if (ui.cat === "recent") return ui.sub === "favorites" ? word("noFav") : word("noRecent");
  return word("noResult");
}

// The grid draws only the rows in view: a list can hold over a thousand emojis, and drawing each
// one the first time costs a moment. A cell is square; the rows above and below are blank space.
const inner = document.createElement("div");
inner.className = "inner";
let list = [];
let drawn = "";

function renderGrid() {
  list = visibleItems();
  drawn = "";
  drawRows();
}

function drawRows() {
  const cell = Math.round(ui.size * 1.4);
  const width = $grid.clientWidth;
  if (list.length === 0 || width === 0) {
    if (list.length === 0) $grid.replaceChildren(emptyNote(emptyText()));
    drawn = "";
    return;
  }
  const columns = Math.max(1, Math.floor(width / cell));
  const rows = Math.ceil(list.length / columns);
  // After a resize the old blank space may still hold the scroll position past the new end.
  const top = Math.min($grid.scrollTop, Math.max(0, rows * cell - $grid.clientHeight));
  const first = Math.max(0, Math.floor(top / cell) - 2);
  const last = Math.min(rows - 1, Math.ceil((top + $grid.clientHeight) / cell) + 2);
  const key = [columns, cell, first, last, list.length].join(" ");
  if (key === drawn) return;
  drawn = key;
  const fragment = document.createDocumentFragment();
  for (const item of list.slice(first * columns, (last + 1) * columns)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "e" + (item === selected ? " sel" : "");
    button.textContent = item.shown;
    button.dataset.base = item.base;
    button.title = itemName(item);
    fragment.appendChild(button);
  }
  inner.style.setProperty("--columns", String(columns));
  inner.style.paddingTop = first * cell + "px";
  inner.style.paddingBottom = Math.max(0, rows - 1 - last) * cell + "px";
  inner.replaceChildren(fragment);
  if ($grid.firstChild !== inner || $grid.childNodes.length !== 1) $grid.replaceChildren(inner);
}

function emptyNote(text) {
  const note = document.createElement("div");
  note.className = "empty";
  note.textContent = text;
  return note;
}

function renderCats() {
  const fragment = document.createDocumentFragment();
  const tabs = [["recent", "🕘"]];
  for (const group of GROUPS) {
    if (!ready || items.some((item) => item.ok && item.group === group)) {
      tabs.push([group, GROUP_ICONS[group]]);
    }
  }
  for (const [id, icon] of tabs) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cat" + (id === ui.cat && !query.trim() ? " on" : "");
    button.textContent = icon;
    button.dataset.cat = id;
    button.title = id === "recent" ? word("recentTab") : word(id);
    fragment.appendChild(button);
  }
  $cats.replaceChildren(fragment);
}

function renderSubbar() {
  const show = ui.cat === "recent" && !query.trim();
  $subbar.hidden = !show;
  $subRecent.textContent = word("recent");
  $subFav.textContent = word("favorites");
  $subRecent.classList.toggle("on", ui.sub === "recent");
  $subFav.classList.toggle("on", ui.sub === "favorites");
  $clearList.textContent = confirmTimer ? word("confirm") : word("clear");
}

function renderFoot() {
  const item = hovered || selected;
  $preview.textContent = item ? item.shown : "";
  $name.textContent = item ? itemName(item) : "";
  const isFav = !!selected && state.favorites.includes(selected.base);
  $fav.textContent = (isFav ? "★ " : "☆ ") + word(isFav ? "removeFav" : "addFav");
  $fav.classList.toggle("on", isFav);
  $fav.disabled = !selected;
}

function renderTexts() {
  $q.placeholder = word("search");
  $q.title = word("search");
  $clearSearch.title = word("clearSearch");
  $size.title = word("size");
  $size.setAttribute("aria-label", word("size"));
}

function renderAll() {
  renderTexts();
  renderCats();
  renderSubbar();
  renderGrid();
  renderFoot();
}

function applySize() {
  const size = Math.min(72, Math.max(16, Number(ui.size) || 30));
  ui.size = size;
  document.body.style.setProperty("--em", size + "px");
  document.body.style.setProperty("--cell", Math.round(size * 1.4) + "px");
  $size.value = String(size);
}

function applyTheme(theme) {
  document.body.className = theme === "dark" ? "dark" : "light";
}

// ---------- actions ----------

function toast(text) {
  $name.textContent = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(renderFoot, 1200);
}

function remember(item) {
  state.recent = [item.base].concat(state.recent.filter((base) => base !== item.base)).slice(0, RECENT_MAX);
  keepState();
}

function pick(item) {
  selected = item;
  hovered = null;
  for (const button of $grid.querySelectorAll(".e")) {
    button.classList.toggle("sel", button.dataset.base === item.base);
  }
  remember(item);
  renderFoot();
  pf.clipboard.setText(item.shown).then(
    () => toast(word("copied") + " " + item.shown),
    () => {}
  );
}

function toggleFavorite() {
  if (!selected) return;
  const base = selected.base;
  if (state.favorites.includes(base)) {
    state.favorites = state.favorites.filter((one) => one !== base);
  } else {
    state.favorites = [base].concat(state.favorites);
  }
  keepState();
  if (ui.cat === "recent" && ui.sub === "favorites" && !query.trim()) renderGrid();
  renderFoot();
}

function chooseCat(cat) {
  ui.cat = cat;
  query = "";
  $q.value = "";
  $clearSearch.hidden = true;
  keepUi();
  $grid.scrollTop = 0;
  renderCats();
  renderSubbar();
  renderGrid();
}

function chooseSub(sub) {
  ui.sub = sub;
  keepUi();
  $grid.scrollTop = 0;
  renderSubbar();
  renderGrid();
}

function clearList() {
  if (!confirmTimer) {
    confirmTimer = setTimeout(() => {
      confirmTimer = 0;
      renderSubbar();
    }, 3000);
    renderSubbar();
    return;
  }
  clearTimeout(confirmTimer);
  confirmTimer = 0;
  if (ui.sub === "favorites") state.favorites = [];
  else state.recent = [];
  keepState();
  renderSubbar();
  renderGrid();
  renderFoot();
}

function search(text) {
  query = text;
  $clearSearch.hidden = !text;
  $grid.scrollTop = 0;
  renderCats();
  renderSubbar();
  renderGrid();
}

// ---------- events ----------

$grid.addEventListener("click", (event) => {
  const button = event.target.closest(".e");
  if (button) pick(byBase.get(button.dataset.base));
});

$grid.addEventListener("mouseover", (event) => {
  const button = event.target.closest(".e");
  if (!button) return;
  hovered = byBase.get(button.dataset.base);
  renderFoot();
});

$grid.addEventListener("mouseleave", () => {
  hovered = null;
  renderFoot();
});

let frame = 0;
function drawSoon() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    drawRows();
  });
}

$grid.addEventListener("scroll", drawSoon, { passive: true });
new ResizeObserver(drawSoon).observe($grid);

$cats.addEventListener("click", (event) => {
  const button = event.target.closest(".cat");
  if (button) chooseCat(button.dataset.cat);
});

$subRecent.addEventListener("click", () => chooseSub("recent"));
$subFav.addEventListener("click", () => chooseSub("favorites"));
$clearList.addEventListener("click", clearList);
$fav.addEventListener("click", toggleFavorite);
$clearSearch.addEventListener("click", () => {
  clearTimeout(searchTimer);
  search("");
  $q.value = "";
  $q.focus();
});

$q.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => search($q.value), 90);
});
$q.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearTimeout(searchTimer);
    search("");
    $q.value = "";
  } else if (event.key === "Enter" && $q.value.trim()) {
    clearTimeout(searchTimer);
    search($q.value);
    if (list.length) pick(list[0]);
  }
});

$size.addEventListener("input", () => {
  ui.size = Number($size.value);
  applySize();
  drawSoon();
});
$size.addEventListener("change", keepUi);

pf.on("theme", applyTheme);
pf.on("lang", () => {
  renderAll();
  loadNames();
});

pf.on("settings", async () => {
  ready = false;
  renderAll();
  ready = await testAll();
  renderAll();
});

// The lists are shared by every fence of the plugin: read them again when this fence shows.
pf.on("show", async () => {
  await loadState();
  if (ready) {
    renderGrid();
    renderFoot();
  }
});

// ---------- start ----------

async function start() {
  applyTheme(pf.theme);
  renderAll();
  const saved = await readJson(uiFile, {});
  ui.size = Number(saved.size) || ui.size;
  ui.cat = saved.cat === "recent" || GROUPS.includes(saved.cat) ? saved.cat : ui.cat;
  ui.sub = saved.sub === "favorites" ? "favorites" : "recent";
  applySize();
  await loadState();
  renderAll();
  ready = await testAll();
  if (ready && ui.cat !== "recent" && !items.some((item) => item.ok && item.group === ui.cat)) {
    ui.cat = "smileys";
  }
  renderAll();
  if (items.some((item) => item.ok)) loadNames();
}

start();
