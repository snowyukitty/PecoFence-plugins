// Translator: a box for the text, a box for the translation, the languages, and a line that says
// which engine works and how much of its free quota is used ("Engine: DeepL | 2,427/500,000 |
// Switch engine"). It asks, in this order, the engines the user set up with a free key (DeepL,
// Microsoft Translator, Google Cloud Translation, Gemini) and, last, MyMemory, which needs no sign-up.
// An engine whose free quota is used up (or that is not enough for this text) is skipped until
// its quota is renewed; when none is left the fence says so and where to get a free key.
// Every request is made only when the user translates; the plugin never goes past the free
// quota it knows, and it respects the answers of the services (429, 456, Retry-After).
"use strict";

const MAX_CHARS = 5000; // the most one translation takes
const MM_BYTES = 450; // MyMemory takes at most 500 bytes in a request and one paragraph at a time
const MM_REQUESTS = 40; // the most requests one translation makes to MyMemory
const BATCH = 40; // lines per request for the engines that take a list

const T = {
  en: { auto: "Auto-detect", srcPh: "Type or paste the text here (Ctrl+Enter translates)", dstPh: "The translation shows here",
        translate: "Translate", copy: "Copy", clear: "Clear", engine: "Engine: {0}", sw: "Switch engine",
        translating: "Translating with {0}…", pickSrc: "Language of the text", pickDst: "Translate into", back: "Back",
        swap: "Swap the languages", swapAuto: "Pick the language of the text first", copied: "Copied", failed: "Translation failed: {0}",
        fellBack: "{0} cannot translate this now, {1} did it", onlyOne: "Only one engine is set up. Add free keys in the plugin settings (fence menu).",
        othersUsed: "The other engines are used up for now.",
        allUsed: "The free quota of every engine is used up for now. Get a free key and paste it in the plugin settings, or wait: MyMemory renews every day, the others every month.",
        linkDeepl: "DeepL API Free: 500,000 characters a month", linkAzure: "Microsoft Translator, plan F0: 2,000,000 characters a month",
        linkGemini: "Google AI Studio: a free Gemini key", linkGoogle: "Google Cloud Translation: 500,000 characters a month",
        tipUsed: "Characters translated, counted by this plugin ({0})", day: "today, UTC", month: "this month", noLimit: "chars", perDay: "per day", perMonth: "per month",
        keyRefused: "{0} refused the key", unsupported: "{0} does not do this pair of languages", tooLong: "too long for {0}",
        rate: "{0} asks to wait" },
  fr: { auto: "Détection auto", srcPh: "Saisissez ou collez le texte ici (Ctrl+Entrée traduit)", dstPh: "La traduction s'affiche ici",
        translate: "Traduire", copy: "Copier", clear: "Effacer", engine: "Moteur : {0}", sw: "Changer de moteur",
        translating: "Traduction avec {0}…", pickSrc: "Langue du texte", pickDst: "Traduire en", back: "Retour",
        swap: "Inverser les langues", swapAuto: "Choisissez d'abord la langue du texte", copied: "Copié", failed: "Échec de la traduction : {0}",
        fellBack: "{0} ne peut pas traduire pour l'instant, {1} s'en est chargé", onlyOne: "Un seul moteur est configuré. Ajoutez des clés gratuites dans les réglages du plugin (menu du groupe).",
        othersUsed: "Les autres moteurs sont épuisés pour l'instant.",
        allUsed: "Le quota gratuit de tous les moteurs est épuisé pour l'instant. Obtenez une clé gratuite et collez-la dans les réglages du plugin, ou patientez : MyMemory se renouvelle chaque jour, les autres chaque mois.",
        linkDeepl: "DeepL API Free : 500 000 caractères par mois", linkAzure: "Microsoft Translator, offre F0 : 2 000 000 de caractères par mois",
        linkGemini: "Google AI Studio : une clé Gemini gratuite", linkGoogle: "Google Cloud Translation : 500 000 caractères par mois",
        tipUsed: "Caractères traduits, comptés par ce plugin ({0})", day: "aujourd'hui, UTC", month: "ce mois-ci", noLimit: "car.", perDay: "par jour", perMonth: "par mois",
        keyRefused: "{0} a refusé la clé", unsupported: "{0} ne gère pas cette paire de langues", tooLong: "trop long pour {0}",
        rate: "{0} demande d'attendre" },
  de: { auto: "Automatisch erkennen", srcPh: "Text hier eingeben oder einfügen (Strg+Eingabe übersetzt)", dstPh: "Die Übersetzung erscheint hier",
        translate: "Übersetzen", copy: "Kopieren", clear: "Leeren", engine: "Dienst: {0}", sw: "Dienst wechseln",
        translating: "Übersetzung mit {0}…", pickSrc: "Sprache des Textes", pickDst: "Übersetzen nach", back: "Zurück",
        swap: "Sprachen tauschen", swapAuto: "Zuerst die Sprache des Textes wählen", copied: "Kopiert", failed: "Übersetzung fehlgeschlagen: {0}",
        fellBack: "{0} kann gerade nicht übersetzen, {1} hat es übernommen", onlyOne: "Nur ein Dienst ist eingerichtet. Kostenlose Schlüssel in den Plugin-Einstellungen eintragen (Bereichsmenü).",
        othersUsed: "Die anderen Dienste sind vorerst aufgebraucht.",
        allUsed: "Das Gratis-Kontingent aller Dienste ist vorerst aufgebraucht. Holen Sie einen kostenlosen Schlüssel und tragen Sie ihn in den Plugin-Einstellungen ein, oder warten Sie: MyMemory erneuert sich täglich, die anderen monatlich.",
        linkDeepl: "DeepL API Free: 500.000 Zeichen im Monat", linkAzure: "Microsoft Translator, Tarif F0: 2.000.000 Zeichen im Monat",
        linkGemini: "Google AI Studio: ein kostenloser Gemini-Schlüssel", linkGoogle: "Google Cloud Translation: 500.000 Zeichen im Monat",
        tipUsed: "Übersetzte Zeichen, von diesem Plugin gezählt ({0})", day: "heute, UTC", month: "diesen Monat", noLimit: "Zeichen", perDay: "pro Tag", perMonth: "pro Monat",
        keyRefused: "{0} hat den Schlüssel abgelehnt", unsupported: "{0} kann dieses Sprachpaar nicht", tooLong: "zu lang für {0}",
        rate: "{0} bittet zu warten" },
  es: { auto: "Detectar idioma", srcPh: "Escribe o pega el texto aquí (Ctrl+Intro traduce)", dstPh: "La traducción aparece aquí",
        translate: "Traducir", copy: "Copiar", clear: "Borrar", engine: "Motor: {0}", sw: "Cambiar de motor",
        translating: "Traduciendo con {0}…", pickSrc: "Idioma del texto", pickDst: "Traducir a", back: "Volver",
        swap: "Intercambiar idiomas", swapAuto: "Elige primero el idioma del texto", copied: "Copiado", failed: "La traducción falló: {0}",
        fellBack: "{0} no puede traducir ahora, lo hizo {1}", onlyOne: "Solo hay un motor configurado. Añade claves gratuitas en los ajustes del plugin (menú del grupo).",
        othersUsed: "Los demás motores están agotados por ahora.",
        allUsed: "La cuota gratuita de todos los motores está agotada por ahora. Consigue una clave gratuita y pégala en los ajustes del plugin, o espera: MyMemory se renueva cada día, los demás cada mes.",
        linkDeepl: "DeepL API Free: 500 000 caracteres al mes", linkAzure: "Microsoft Translator, plan F0: 2 000 000 de caracteres al mes",
        linkGemini: "Google AI Studio: una clave de Gemini gratuita", linkGoogle: "Google Cloud Translation: 500 000 caracteres al mes",
        tipUsed: "Caracteres traducidos, contados por este plugin ({0})", day: "hoy, UTC", month: "este mes", noLimit: "car.", perDay: "por día", perMonth: "por mes",
        keyRefused: "{0} rechazó la clave", unsupported: "{0} no admite este par de idiomas", tooLong: "demasiado largo para {0}",
        rate: "{0} pide esperar" },
};
const texts = () => T[pf.lang] || T[pf.lang.split("-")[0]] || T.en;
let t = texts();
const fmt = (text, ...v) => text.replace(/\{(\d)\}/g, (m, i) => v[Number(i)] ?? "");

// code, name in the language itself, name in English (for Gemini), DeepL does it
const LANGS = [
  ["en", "English", "English", 1], ["fr", "Français", "French", 1], ["es", "Español", "Spanish", 1],
  ["de", "Deutsch", "German", 1], ["it", "Italiano", "Italian", 1], ["pt", "Português", "Portuguese", 1],
  ["nl", "Nederlands", "Dutch", 1], ["pl", "Polski", "Polish", 1], ["ru", "Русский", "Russian", 1],
  ["uk", "Українська", "Ukrainian", 1], ["cs", "Čeština", "Czech", 1], ["sk", "Slovenčina", "Slovak", 1],
  ["sl", "Slovenščina", "Slovenian", 1], ["hu", "Magyar", "Hungarian", 1], ["ro", "Română", "Romanian", 1],
  ["bg", "Български", "Bulgarian", 1], ["el", "Ελληνικά", "Greek", 1], ["tr", "Türkçe", "Turkish", 1],
  ["sv", "Svenska", "Swedish", 1], ["da", "Dansk", "Danish", 1], ["fi", "Suomi", "Finnish", 1],
  ["nb", "Norsk bokmål", "Norwegian", 1], ["et", "Eesti", "Estonian", 1], ["lv", "Latviešu", "Latvian", 1],
  ["lt", "Lietuvių", "Lithuanian", 1], ["id", "Bahasa Indonesia", "Indonesian", 1], ["ja", "日本語", "Japanese", 1],
  ["ko", "한국어", "Korean", 1], ["zh", "中文", "Chinese (Simplified)", 1], ["ar", "العربية", "Arabic", 1],
  ["he", "עברית", "Hebrew", 0], ["hi", "हिन्दी", "Hindi", 0], ["th", "ไทย", "Thai", 0], ["vi", "Tiếng Việt", "Vietnamese", 0],
];
const lang = (code) => LANGS.find((l) => l[0] === code);
const UI_TO_CODE = { "zh-CN": "zh", "zh-TW": "zh", "pt-BR": "pt" };
function defaultTarget() {
  const c = UI_TO_CODE[pf.lang] || pf.lang.split("-")[0];
  return lang(c) && c !== "en" ? c : "es";
}

// How each engine writes a language code.
const ZH = { azure: "zh-Hans", google: "zh-CN", mymemory: "zh-CN" };
const NB = { google: "no", mymemory: "no" };
function code(engine, c) {
  if (c === "zh" && ZH[engine]) return ZH[engine];
  if (c === "nb" && NB[engine]) return NB[engine];
  if (c === "he" && engine === "google") return "iw";
  return c;
}
const dlTarget = (c) => (c === "en" ? "EN-US" : c === "pt" ? "PT-BR" : c.toUpperCase());

// ---- text helpers ----
function decode(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (m, g) => {
    const k = g.toLowerCase();
    if (k === "amp") return "&";
    if (k === "lt") return "<";
    if (k === "gt") return ">";
    if (k === "quot") return "\"";
    if (k === "apos") return "'";
    if (k === "nbsp") return " ";
    try { return String.fromCodePoint(k[1] === "x" ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10)); } catch (e) { return m; }
  });
}
const sepOf = () => ({ fr: " ", ru: " ", de: ".", es: ".", it: ".", "pt-BR": "." })[pf.lang] ?? ",";
const num = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sepOf());
const size = (s) => [...s].length;
const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
const splitLines = (text) => text.replace(/\r\n?/g, "\n").split("\n");
function safeJson(s) { try { return JSON.parse(s); } catch (e) { return null; } }

function utf8(ch) { const c = ch.codePointAt(0); return c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4; }
// Pieces of a line of at most `max` bytes, cut after a sentence when it can be.
function chunkLine(line, max) {
  const out = [];
  let cur = "", bytes = 0;
  const flush = () => { if (cur.trim()) out.push(cur.trim()); cur = ""; bytes = 0; };
  const sentences = line.match(/[^.!?。！？]+[.!?。！？]*\s*|[.!?。！？]+\s*/g) || [line];
  for (const sentence of sentences) {
    let n = 0;
    for (const ch of sentence) n += utf8(ch);
    if (bytes + n <= max) { cur += sentence; bytes += n; continue; }
    flush();
    if (n <= max) { cur = sentence; bytes = n; continue; }
    for (const ch of sentence) {
      const b = utf8(ch);
      if (bytes + b > max) flush();
      cur += ch;
      bytes += b;
    }
  }
  flush();
  return out;
}

// Translates the non-empty lines with fn(list of lines) -> list of translations, `BATCH` at a time.
async function mapLines(text, fn) {
  const lines = splitLines(text);
  const at = [];
  lines.forEach((l, i) => { if (l.trim()) at.push(i); });
  const out = lines.slice();
  for (let i = 0; i < at.length; i += BATCH) {
    const part = at.slice(i, i + BATCH);
    const done = await fn(part.map((k) => lines[k]));
    part.forEach((k, j) => { out[k] = done[j] ?? lines[k]; });
  }
  return out.join("\n");
}

// ---- engines ----
class EngineError extends Error {
  // kind: quota (used up), rate (wait), auth (key refused), skip (cannot do this text), other
  constructor(kind, message, wait) { super(message); this.kind = kind; this.wait = wait || 0; }
}
const retryAfter = (r) => Math.min(3600, Math.max(30, Number(r.headers && r.headers["retry-after"]) || 120));
async function postJson(url, headers, body) {
  return pf.http.post(url, { headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
function detail(r) {
  const j = safeJson(r.body);
  const m = j && (j.message || (j.error && (j.error.message || j.error)));
  return "HTTP " + r.status + (typeof m === "string" ? ": " + m.slice(0, 120) : "");
}

async function runDeepl(c) {
  const key = c.s.deeplKey.trim();
  const base = key.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
  const auth = { Authorization: "DeepL-Auth-Key " + key };
  let detected = "";
  const text = await mapLines(c.text, async (batch) => {
    const body = { text: batch, target_lang: dlTarget(c.dst) };
    if (c.src !== "auto") body.source_lang = c.src.toUpperCase();
    const r = await postJson(base + "/v2/translate", auth, body);
    if (r.status === 456) throw new EngineError("quota", "quota");
    if (r.status === 401 || r.status === 403) throw new EngineError("auth", detail(r));
    if (r.status === 429 || r.status === 503) throw new EngineError("rate", detail(r), retryAfter(r));
    const j = safeJson(r.body);
    if (r.status !== 200 || !j || !Array.isArray(j.translations)) throw new EngineError("other", detail(r));
    detected = detected || String(j.translations[0].detected_source_language || "").toLowerCase();
    return j.translations.map((x) => x.text);
  });
  try { // DeepL tells the real count, which also covers other uses of the same key
    const r = await pf.http.get(base + "/v2/usage", { headers: auth });
    const j = r.status === 200 && safeJson(r.body);
    if (j && typeof j.character_count === "number") c.usage.sync(j.character_count, j.character_limit);
  } catch (e) { /* the local count stands */ }
  return { text, detected };
}

async function runAzure(c) {
  const key = c.s.azureKey.trim();
  const region = String(c.s.azureRegion || "").trim();
  const headers = { "Ocp-Apim-Subscription-Key": key };
  if (region) headers["Ocp-Apim-Subscription-Region"] = region;
  let url = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=" + encodeURIComponent(code("azure", c.dst));
  if (c.src !== "auto") url += "&from=" + encodeURIComponent(code("azure", c.src));
  let detected = "";
  const text = await mapLines(c.text, async (batch) => {
    const r = await postJson(url, headers, batch.map((Text) => ({ Text })));
    const j = safeJson(r.body);
    const errCode = j && j.error ? Number(j.error.code) : 0;
    if (r.status === 401) throw new EngineError("auth", detail(r));
    if (r.status === 403) throw new EngineError(errCode === 403001 || /quota/i.test(r.body) ? "quota" : "auth", detail(r));
    if (r.status === 429) throw new EngineError("rate", detail(r), retryAfter(r));
    if (r.status !== 200 || !Array.isArray(j)) throw new EngineError("other", detail(r));
    if (!detected && j[0] && j[0].detectedLanguage) detected = String(j[0].detectedLanguage.language || "").toLowerCase();
    return j.map((x) => (x.translations && x.translations[0] ? x.translations[0].text : ""));
  });
  return { text, detected };
}

async function runGoogle(c) {
  const headers = { "X-goog-api-key": c.s.googleKey.trim() };
  let detected = "";
  const text = await mapLines(c.text, async (batch) => {
    const body = { q: batch, target: code("google", c.dst), format: "text" };
    if (c.src !== "auto") body.source = code("google", c.src);
    const r = await postJson("https://translation.googleapis.com/language/translate/v2", headers, body);
    const j = safeJson(r.body);
    if (r.status !== 200) {
      const e = (j && j.error) || {};
      const reason = String((e.errors && e.errors[0] && e.errors[0].reason) || e.status || "");
      if (/dailyLimitExceeded|quotaExceeded/.test(reason)) throw new EngineError("quota", detail(r));
      if (r.status === 429 || /rateLimit|RESOURCE_EXHAUSTED/.test(reason)) throw new EngineError("rate", detail(r), retryAfter(r));
      if (r.status === 401 || r.status === 403 || /keyInvalid|PERMISSION_DENIED|API key/i.test(reason + (e.message || ""))) throw new EngineError("auth", detail(r));
      throw new EngineError("other", detail(r));
    }
    const list = j && j.data && j.data.translations;
    if (!Array.isArray(list)) throw new EngineError("other", detail(r));
    detected = detected || String(list[0].detectedSourceLanguage || "").toLowerCase();
    return list.map((x) => decode(x.translatedText));
  });
  return { text, detected };
}

async function runGemini(c) {
  const model = String(c.s.geminiModel || "gemini-flash-latest").trim();
  if (!/^[a-z0-9][a-z0-9.\-]{0,60}$/i.test(model)) throw new EngineError("other", "invalid model name");
  const from = c.src === "auto" ? "the language it is written in" : lang(c.src)[2];
  const body = {
    systemInstruction: { parts: [{ text: "You are a translation engine. Translate the user's text from " + from + " to " + lang(c.dst)[2] + ". Answer with the translation only: no comment, no quotes, same line breaks and layout." }] },
    contents: [{ role: "user", parts: [{ text: c.text }] }],
    generationConfig: { temperature: 0 },
  };
  const r = await postJson("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", { "x-goog-api-key": c.s.geminiKey.trim() }, body);
  const j = safeJson(r.body);
  if (r.status === 429) throw new EngineError("rate", detail(r), Math.max(300, retryAfter(r)));
  if (r.status === 401 || r.status === 403 || (r.status === 400 && /API key/i.test(r.body))) throw new EngineError("auth", detail(r));
  const parts = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
  if (r.status !== 200 || !Array.isArray(parts)) throw new EngineError("other", detail(r));
  return { text: parts.map((p) => p.text || "").join("").trim(), detected: "" };
}

async function runMyMemory(c) {
  const de = validEmail(c.s.mymemoryEmail) ? "&de=" + encodeURIComponent(c.s.mymemoryEmail.trim()) : "";
  const pair = (c.src === "auto" ? "Autodetect" : code("mymemory", c.src)) + "|" + code("mymemory", c.dst);
  const jobs = splitLines(c.text).map((l) => (l.trim() ? chunkLine(l, MM_BYTES) : []));
  if (jobs.reduce((n, p) => n + p.length, 0) > MM_REQUESTS) throw new EngineError("skip", "too long");
  let detected = "";
  const lines = [];
  for (const parts of jobs) { // one after the other, one paragraph piece per request
    const done = [];
    for (const piece of parts) {
      const r = await pf.http.get("https://api.mymemory.translated.net/get?q=" + encodeURIComponent(piece) + "&langpair=" + encodeURIComponent(pair) + de);
      const j = safeJson(r.body);
      const status = j ? Number(j.responseStatus) : r.status;
      const out = j && j.responseData ? String(j.responseData.translatedText || "") : "";
      if (r.status === 429 || status === 429 || (j && j.quotaFinished) || /MYMEMORY WARNING/i.test(out)) throw new EngineError("quota", "quota");
      if (status !== 200 || !out) throw new EngineError("other", "HTTP " + r.status + (j && j.responseDetails ? ": " + String(j.responseDetails).slice(0, 120) : ""));
      detected = detected || String((j.responseData && j.responseData.detectedLanguage) || "").toLowerCase();
      done.push(decode(out).trim());
    }
    lines.push(done.join(" "));
  }
  return { text: lines.join("\n"), detected };
}

// period: when the free quota is renewed (UTC); limit: characters of the free quota, null when unknown.
const ENGINES = {
  deepl: { name: "DeepL", period: "month", limit: () => 500000, key: (s) => s.deeplKey, run: runDeepl, can: (s, d) => (s === "auto" || lang(s)[3] === 1) && lang(d)[3] === 1 },
  azure: { name: "Microsoft Translator", period: "month", limit: () => 2000000, key: (s) => s.azureKey, run: runAzure },
  google: { name: "Google Translation", period: "month", limit: () => 500000, key: (s) => s.googleKey, run: runGoogle },
  gemini: { name: "Gemini", period: "day", limit: () => null, key: (s) => s.geminiKey, run: runGemini },
  mymemory: { name: "MyMemory", period: "day", limit: (s) => (validEmail(s.mymemoryEmail) ? 50000 : 5000), key: () => "-", run: runMyMemory },
};
const ORDER = ["deepl", "azure", "google", "gemini", "mymemory"];
const LINKS = {
  deepl: "https://www.deepl.com/pro-api", azure: "https://azure.microsoft.com/products/ai-services/ai-translator",
  gemini: "https://aistudio.google.com/apikey", google: "https://cloud.google.com/translate/docs/setup",
};

// ---- state ----
let state = { src: "auto", dst: defaultTarget(), engine: "", source: "", result: "", detected: "" };
let usage = {}; // engine -> { period, chars, limit?, exhausted }, shared by the fences of the plugin
const cool = {}; // engine -> time (ms) before which it is not asked again
let mode = "main", running = false, busy = "", note = "", problem = "", help = false;

const settings = () => pf.settings || {};
const configured = (id) => !!String(ENGINES[id].key(settings()) || "").trim();
const usable = () => ORDER.filter(configured);
const current = () => (usable().includes(state.engine) ? state.engine : usable()[0]);
function periodOf(kind) {
  const d = new Date(pf.time.now());
  const day = d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0");
  return kind === "day" ? day + "-" + String(d.getUTCDate()).padStart(2, "0") : day;
}
function slot(id) {
  const p = periodOf(ENGINES[id].period);
  if (!usage[id] || usage[id].period !== p) usage[id] = { period: p, chars: 0, exhausted: false };
  return usage[id];
}
const limitOf = (id) => { const u = slot(id); return typeof u.limit === "number" ? u.limit : ENGINES[id].limit(settings()); };
async function loadUsage() {
  try { usage = safeJson(await pf.data.read("usage.json")) || usage; } catch (e) { /* the count in memory stands */ }
}
const saveUsage = () => pf.data.write("usage.json", JSON.stringify(usage)).catch(() => {});
const stateFile = () => pf.fence.id + "-state.json";
const saveState = () => pf.data.write(stateFile(), JSON.stringify(state)).catch(() => {});

// ---- translating ----
async function translate() {
  const text = state.source;
  if (running || !text.trim()) return;
  running = true;
  note = problem = ""; help = false;
  const count = size(text);
  if (state.src !== "auto" && state.src === state.dst) { running = false; state.result = text; saveState(); draw(); return; }
  await loadUsage(); // another fence of the plugin may have used a quota since
  const wanted = current();
  const order = [wanted, ...ORDER.filter((id) => id !== wanted)].filter(configured);
  let done = "", why = "";
  try {
    for (const id of order) {
      const e = ENGINES[id], u = slot(id), lim = limitOf(id);
      if (u.exhausted || (cool[id] || 0) > pf.time.now() || (lim !== null && u.chars + count > lim)) continue;
      if (e.can && !e.can(state.src, state.dst)) { why = fmt(t.unsupported, e.name); continue; }
      busy = e.name;
      draw();
      let synced = false;
      try {
        const sync = (n, l) => { synced = true; u.chars = n; if (typeof l === "number") { u.limit = l; u.exhausted = n >= l; } };
        const out = await e.run({ text, src: state.src, dst: state.dst, s: settings(), usage: { sync } });
        if (!synced) u.chars += count;
        state.result = out.text;
        state.detected = state.src === "auto" && out.detected && out.detected !== state.dst ? out.detected.split("-")[0] : "";
        done = id;
        break;
      } catch (err) {
        const kind = err instanceof EngineError ? err.kind : "other";
        if (kind === "quota") { u.exhausted = true; if (lim !== null) u.chars = Math.max(u.chars, lim); }
        else if (kind === "rate") { cool[id] = pf.time.now() + err.wait * 1000; why = fmt(t.rate, e.name); }
        else if (kind === "auth") { cool[id] = pf.time.now() + 600000; why = fmt(t.keyRefused, e.name) + " (" + err.message + ")"; }
        else if (kind === "skip") why = fmt(t.tooLong, e.name);
        else why = e.name + ": " + (err && err.message ? err.message : "error");
      }
    }
  } finally {
    running = false;
    busy = "";
  }
  saveUsage();
  if (done) {
    if (done !== wanted) note = fmt(t.fellBack, ENGINES[wanted].name, ENGINES[done].name) + (why ? " (" + why + ")" : "");
    state.engine = done;
  } else {
    // MyMemory needs no sign-up and comes last: when it cannot help either, say where to get a key
    const mm = slot("mymemory");
    help = mm.exhausted || (cool.mymemory || 0) > pf.time.now() || mm.chars + count > limitOf("mymemory");
    problem = why ? fmt(t.failed, why) : "";
  }
  saveState();
  draw();
}

function switchEngine() {
  const list = usable();
  const from = current();
  note = problem = ""; help = false;
  if (list.length < 2) note = t.onlyOne;
  else {
    const i = list.indexOf(from);
    for (let k = 1; k < list.length; k++) {
      const id = list[(i + k) % list.length];
      if (!slot(id).exhausted) { state.engine = id; break; }
    }
    if (current() === from) note = t.othersUsed;
    saveState();
  }
  draw();
}

// ---- view ----
function langButton(id, label) { return { id, text: label + " ▾", fill: true }; }
function counter() {
  const id = current(), e = ENGINES[id], u = slot(id), lim = limitOf(id);
  const per = e.period === "day" ? t.perDay : t.perMonth;
  const used = (lim === null ? num(u.chars) + " " + t.noLimit : num(u.chars) + "/" + num(lim)) + " " + per;
  const full = u.exhausted || (lim !== null && u.chars >= lim);
  const dim = { text: "|", color: "gray", width: 12, align: "center" };
  return { cells: [
    { text: fmt(t.engine, e.name), bold: true, fill: true },
    dim,
    { text: used, color: full ? "orange" : "gray", tip: fmt(t.tipUsed, e.period === "day" ? t.day : t.month) },
    dim,
    { id: "switch", text: t.sw },
  ] };
}

function draw() {
  const rows = [];
  if (mode !== "main") {
    const pickSrc = mode === "src";
    rows.push({ cells: [{ text: pickSrc ? t.pickSrc : t.pickDst, bold: true, fill: true }, { id: "back", text: t.back }] });
    const items = pickSrc ? [["auto", t.auto]] : [];
    LANGS.forEach((l) => items.push([l[0], l[1]]));
    const chosen = pickSrc ? state.src : state.dst;
    items.forEach(([c, name], i) => {
      const row = { id: "lang:" + c, text: (c === chosen ? "✓ " : "   ") + name, bold: c === chosen };
      if (i === 0) row.pane = "langs";
      rows.push(row);
    });
    pf.show({ rows });
    return;
  }
  const dl = state.detected && lang(state.detected) ? " (" + lang(state.detected)[1] + ")" : "";
  const srcName = state.src === "auto" ? t.auto + dl : lang(state.src)[1];
  rows.push({ cells: [langButton("pick-src", srcName), { id: "swap", text: "⇄", width: 36, align: "center", tip: t.swap }, langButton("pick-dst", lang(state.dst)[1])] });
  rows.push({ input: { type: "text", id: "source", lines: 6, value: state.source, placeholder: t.srcPh, max: MAX_CHARS } });
  rows.push({ cells: [{ id: "translate", text: busy ? "…" : t.translate, fill: true, bold: true }, { id: "copy", text: t.copy }, { id: "clear", text: t.clear }] });
  rows.push({ input: { type: "text", id: "result", lines: 6, value: state.result, placeholder: t.dstPh } });
  if (busy) rows.push({ text: fmt(t.translating, busy), color: "gray", size: "small" });
  if (note) rows.push({ text: note, color: "gray", size: "small" });
  if (problem) rows.push({ text: problem, color: "red", size: "small" });
  if (help) {
    rows.push({ text: t.allUsed, color: "orange", size: "small" });
    rows.push({ id: "open:deepl", text: t.linkDeepl, color: "blue", size: "small" });
    rows.push({ id: "open:azure", text: t.linkAzure, color: "blue", size: "small" });
    rows.push({ id: "open:gemini", text: t.linkGemini, color: "blue", size: "small" });
    rows.push({ id: "open:google", text: t.linkGoogle, color: "blue", size: "small" });
  }
  rows.push({ separator: true });
  rows.push(counter());
  pf.show({ rows });
}

// ---- events ----
function choose(c) {
  if (mode === "src") {
    const old = state.src;
    state.src = c;
    if (c === state.dst) state.dst = old !== "auto" ? old : c === "en" ? "fr" : "en";
  } else {
    const old = state.dst;
    state.dst = c;
    if (c === state.src) state.src = old;
  }
  state.detected = "";
  mode = "main";
  saveState();
  draw();
}

pf.on("click", (e) => {
  const id = e.id || "";
  if (id.startsWith("lang:")) return choose(id.slice(5));
  if (id.startsWith("open:")) { try { pf.open(LINKS[id.slice(5)]); } catch (err) { /* refused */ } return; }
  if (id === "pick-src") { mode = "src"; draw(); }
  else if (id === "pick-dst") { mode = "dst"; draw(); }
  else if (id === "back") { mode = "main"; draw(); }
  else if (id === "swap") {
    const from = state.src === "auto" ? state.detected : state.src;
    if (!from || !lang(from)) { note = t.swapAuto; draw(); return; }
    state.src = state.dst; state.dst = from;
    if (state.result) { state.source = state.result; state.result = ""; }
    state.detected = ""; note = problem = ""; help = false;
    saveState(); draw();
  } else if (id === "translate") translate();
  else if (id === "switch") switchEngine();
  else if (id === "clear") { state.source = state.result = state.detected = ""; note = problem = ""; help = false; saveState(); draw(); }
  else if (id === "copy" && state.result) {
    pf.clipboard.setText(state.result).then(() => { note = t.copied; draw(); }).catch(() => {});
  }
});
pf.on("change", (e) => { if (e.id === "source") { state.source = e.text; saveState(); } });
pf.on("submit", (e) => { if (e.id === "source") translate(); });
pf.on("settings", () => { for (const k in cool) delete cool[k]; draw(); });
pf.on("lang", () => { t = texts(); draw(); });

async function init() {
  try {
    await loadUsage();
    const saved = safeJson(await pf.data.read(stateFile()));
    if (saved && typeof saved === "object") {
      state = { ...state, ...saved };
      if (state.src !== "auto" && !lang(state.src)) state.src = "auto";
      if (!lang(state.dst)) state.dst = defaultTarget();
    }
  } catch (e) { /* start empty */ }
  draw();
}
draw();
init();
