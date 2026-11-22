// Countdown: days left until the dates in this fence's setting "dates", nearest first. Dates that
// have passed show how long ago they were. Entries are separated by ";" (or "；") or new lines:
// "2026-12-25 Christmas" for one day, "12-25 Christmas" for the same day every year.

const TEXTS = {
  en: { left: "in {0} days", tomorrow: "tomorrow", today: "today", yesterday: "yesterday", ago: "{0} days ago",
        none: "No dates yet: add them in the fence menu, Plugin settings", bad: "Not understood: {0}" },
  "zh-CN": { left: "还有 {0} 天", tomorrow: "明天", today: "就是今天", yesterday: "昨天", ago: "已过 {0} 天",
             none: "还没有日期，请在栅栏菜单的「插件设置」里添加", bad: "这一项看不懂：{0}" },
  "zh-TW": { left: "還有 {0} 天", tomorrow: "明天", today: "就是今天", yesterday: "昨天", ago: "已過 {0} 天",
             none: "還沒有日期，請在柵欄選單的「外掛設定」裡新增", bad: "這一項看不懂：{0}" },
  ja: { left: "あと {0} 日", tomorrow: "明日", today: "今日", yesterday: "昨日", ago: "{0} 日前",
        none: "日付がありません。フェンスのメニューの「プラグインの設定」で追加してください", bad: "読めない項目：{0}" },
  ko: { left: "{0}일 남음", tomorrow: "내일", today: "오늘", yesterday: "어제", ago: "{0}일 지남",
        none: "아직 날짜가 없습니다. 펜스 메뉴의 '플러그인 설정'에서 추가하세요", bad: "알 수 없는 항목: {0}" },
  de: { left: "in {0} Tagen", tomorrow: "morgen", today: "heute", yesterday: "gestern", ago: "vor {0} Tagen",
        none: "Noch keine Daten: im Bereichsmenü unter Plugin-Einstellungen hinzufügen", bad: "Nicht verstanden: {0}" },
  fr: { left: "dans {0} jours", tomorrow: "demain", today: "aujourd'hui", yesterday: "hier", ago: "il y a {0} jours",
        none: "Pas encore de dates : ajoutez-les dans le menu du groupe, Réglages du plugin", bad: "Non compris : {0}" },
  es: { left: "faltan {0} días", tomorrow: "mañana", today: "hoy", yesterday: "ayer", ago: "hace {0} días",
        none: "Aún no hay fechas: añádalas en el menú del grupo, Ajustes del plugin", bad: "No se entiende: {0}" },
  "pt-BR": { left: "faltam {0} dias", tomorrow: "amanhã", today: "hoje", yesterday: "ontem", ago: "há {0} dias",
             none: "Ainda não há datas: adicione-as no menu do grupo, Configurações do plugin", bad: "Não entendido: {0}" },
  ru: { left: "через {0} дн.", tomorrow: "завтра", today: "сегодня", yesterday: "вчера", ago: "{0} дн. назад",
        none: "Дат пока нет: добавьте их в меню области, Настройки плагина", bad: "Непонятно: {0}" },
  it: { left: "tra {0} giorni", tomorrow: "domani", today: "oggi", yesterday: "ieri", ago: "{0} giorni fa",
        none: "Ancora nessuna data: aggiungile nel menu del riquadro, Impostazioni del plugin", bad: "Non capito: {0}" },
};
let t = TEXTS[pf.lang] || TEXTS.en;
pf.on("lang", () => { t = TEXTS[pf.lang] || TEXTS.en; draw(); });
// The setting's default (plugin.json), shown with its names in the user's language.
const DEFAULT = "12-25 Christmas; 01-01 New Year";
const EXAMPLE = {
  "zh-CN": "12-25 圣诞节; 01-01 元旦", "zh-TW": "12-25 聖誕節; 01-01 元旦", ja: "12-25 クリスマス; 01-01 元日",
  ko: "12-25 크리스마스; 01-01 새해", de: "12-25 Weihnachten; 01-01 Neujahr", fr: "12-25 Noël; 01-01 Nouvel An",
  es: "12-25 Navidad; 01-01 Año Nuevo", "pt-BR": "12-25 Natal; 01-01 Ano-Novo", ru: "12-25 Рождество; 01-01 Новый год",
  it: "12-25 Natale; 01-01 Capodanno",
};
const DAY = 24 * 60 * 60 * 1000;
let shown = "";
// The nearest date to come and its days: the title row shows it while the fence is rolled up.
let nearest;

const fill = (text, n) => text.replace("{0}", String(n));
const when = (days) => (days === 0 ? t.today : days === 1 ? t.tomorrow : fill(t.left, days));

// Days from today to year-month-day, counted on the calendar (no clock time involved).
function daysUntil(today, y, m, d) {
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / DAY);
}

// One entry of the setting: { name, days } or { bad } when it cannot be read.
function parse(entry, today) {
  const full = /^(\d{4})-(\d{2})-(\d{2})\s+(.+)$/.exec(entry);
  const yearly = /^(\d{2})-(\d{2})\s+(.+)$/.exec(entry);
  if (full) {
    const [, y, m, d, name] = full;
    if (+m >= 1 && +m <= 12 && +d >= 1 && +d <= 31) return { name, days: daysUntil(today, +y, +m, +d) };
  } else if (yearly) {
    const [, m, d, name] = yearly;
    if (+m >= 1 && +m <= 12 && +d >= 1 && +d <= 31) {
      let days = daysUntil(today, today.getFullYear(), +m, +d);
      if (days < 0) days = daysUntil(today, today.getFullYear() + 1, +m, +d);
      return { name, days };
    }
  }
  return { bad: entry };
}

function rows() {
  const today = new Date(pf.time.now());
  const dates = pf.settings.dates === DEFAULT ? EXAMPLE[pf.lang] || DEFAULT : pf.settings.dates;
  const entries = String(dates || "").split(/[;；\n]/).map((s) => s.trim()).filter(Boolean);
  const items = entries.map((e) => parse(e, today));
  const upcoming = items.filter((i) => i.days >= 0).sort((a, b) => a.days - b.days);
  nearest = upcoming.length ? `${upcoming[0].name} ${when(upcoming[0].days)}` : undefined;
  const past = pf.settings.past ? items.filter((i) => i.days < 0).sort((a, b) => b.days - a.days) : [];
  const out = upcoming.map((i) => ({
    text: `${i.name}  ${when(i.days)}`,
    color: i.days <= 1 ? "green" : undefined,
    bold: i.days === 0 || undefined,
  }));
  for (const i of past) out.push({ text: `${i.name}  ${i.days === -1 ? t.yesterday : fill(t.ago, -i.days)}`, color: "gray" });
  for (const i of items.filter((i) => i.bad)) out.push({ text: fill(t.bad, i.bad), color: "orange" });
  return out.length ? out : [{ text: t.none, color: "gray" }];
}

// Shows the rows only when they changed: once a day, or when the settings change.
function draw() {
  const view = { rows: rows(), caption: nearest };
  const json = JSON.stringify(view);
  if (json !== shown) {
    shown = json;
    pf.show(view);
  }
}

pf.on("start", draw);
pf.on("show", draw);
pf.on("settings", draw);
pf.on("timechange", draw);
pf.every(60, draw, { align: "minute" });
