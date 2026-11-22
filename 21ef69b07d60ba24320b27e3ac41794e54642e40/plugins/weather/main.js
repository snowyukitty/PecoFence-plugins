// Weather: the weather now, today and tomorrow from wttr.in, for the city in this fence's setting
// "city" (empty: the place wttr.in finds from the network address). It asks every 30 minutes
// while the fence shows, at once when the city changes, and when the user clicks the last row
// (not within a minute of the last request). When wttr.in says to wait (Retry-After), nothing
// asks before then. wttr.in writes the description of the weather in the display language.

const TEXTS = {
  en: { feels: "Feels like {0}°C, humidity {1}%, wind {2} km/h",
        days: "Today {0} to {1}°C, tomorrow {2} to {3}°C, rain {4}%",
        updated: "Updated at {0}, click to refresh", loading: "Getting the weather from wttr.in…",
        failed: "No weather from wttr.in right now, trying again at {0}",
        unknown: "wttr.in does not know \"{0}\". Change the city in the fence menu, Plugin settings." },
  "zh-CN": { feels: "体感 {0}°C，湿度 {1}%，风 {2} km/h",
             days: "今天 {0} 到 {1}°C，明天 {2} 到 {3}°C，降雨概率 {4}%",
             updated: "{0} 更新，点一下刷新", loading: "正在从 wttr.in 获取天气…",
             failed: "暂时拿不到 wttr.in 的天气，{0} 再试",
             unknown: "wttr.in 找不到「{0}」，请在栅栏菜单的「插件设置」里改一下城市" },
  "zh-TW": { feels: "體感 {0}°C，濕度 {1}%，風 {2} km/h",
             days: "今天 {0} 到 {1}°C，明天 {2} 到 {3}°C，降雨機率 {4}%",
             updated: "{0} 更新，點一下重新整理", loading: "正在從 wttr.in 取得天氣…",
             failed: "暫時拿不到 wttr.in 的天氣，{0} 再試",
             unknown: "wttr.in 找不到「{0}」，請在圍欄選單的「外掛設定」裡改一下城市" },
  ja: { feels: "体感 {0}°C、湿度 {1}%、風 {2} km/h",
        days: "今日 {0}～{1}°C、明日 {2}～{3}°C、降水確率 {4}%",
        updated: "{0} に更新、クリックで再取得", loading: "wttr.in から天気を取得しています…",
        failed: "wttr.in から天気を取得できません。{0} にもう一度試します",
        unknown: "wttr.in に「{0}」が見つかりません。フェンスのメニューの「プラグインの設定」で都市を変えてください" },
  ko: { feels: "체감 {0}°C, 습도 {1}%, 바람 {2}km/h",
        days: "오늘 {0}~{1}°C, 내일 {2}~{3}°C, 강수 확률 {4}%",
        updated: "{0} 업데이트, 클릭하면 새로 고침", loading: "wttr.in에서 날씨를 가져오는 중…",
        failed: "지금은 wttr.in에서 날씨를 가져올 수 없습니다. {0}에 다시 시도합니다",
        unknown: "wttr.in에서 '{0}'을(를) 찾을 수 없습니다. 펜스 메뉴의 '플러그인 설정'에서 도시를 바꾸세요" },
  de: { feels: "Gefühlt {0} °C, Luftfeuchte {1} %, Wind {2} km/h",
        days: "Heute {0} bis {1} °C, morgen {2} bis {3} °C, Regen {4} %",
        updated: "Stand {0}, zum Aktualisieren klicken", loading: "Das Wetter wird von wttr.in geholt…",
        failed: "Gerade kein Wetter von wttr.in, neuer Versuch um {0}",
        unknown: "wttr.in kennt „{0}“ nicht. Ändern Sie die Stadt im Bereichsmenü unter Plugin-Einstellungen." },
  fr: { feels: "Ressenti {0} °C, humidité {1} %, vent {2} km/h",
        days: "Aujourd'hui {0} à {1} °C, demain {2} à {3} °C, pluie {4} %",
        updated: "Mis à jour à {0}, cliquez pour actualiser", loading: "Chargement de la météo depuis wttr.in…",
        failed: "Pas de météo de wttr.in pour l'instant, nouvel essai à {0}",
        unknown: "wttr.in ne connaît pas « {0} ». Changez la ville dans le menu du groupe, Réglages du plugin." },
  es: { feels: "Sensación {0} °C, humedad {1} %, viento {2} km/h",
        days: "Hoy {0} a {1} °C, mañana {2} a {3} °C, lluvia {4} %",
        updated: "Actualizado a las {0}, haga clic para actualizar", loading: "Obteniendo el tiempo de wttr.in…",
        failed: "Ahora no llega el tiempo de wttr.in, se vuelve a intentar a las {0}",
        unknown: "wttr.in no conoce «{0}». Cambie la ciudad en el menú del grupo, Ajustes del plugin." },
  "pt-BR": { feels: "Sensação {0} °C, umidade {1}%, vento {2} km/h",
             days: "Hoje {0} a {1} °C, amanhã {2} a {3} °C, chuva {4}%",
             updated: "Atualizado às {0}, clique para atualizar", loading: "Buscando o tempo no wttr.in…",
             failed: "Sem previsão do wttr.in agora, nova tentativa às {0}",
             unknown: "O wttr.in não conhece \"{0}\". Mude a cidade no menu do grupo, Configurações do plugin." },
  ru: { feels: "Ощущается как {0} °C, влажность {1}%, ветер {2} км/ч",
        days: "Сегодня от {0} до {1} °C, завтра от {2} до {3} °C, дождь {4}%",
        updated: "Обновлено в {0}, щёлкните, чтобы обновить", loading: "Получаю погоду с wttr.in…",
        failed: "Сейчас нет данных с wttr.in, новая попытка в {0}",
        unknown: "wttr.in не знает «{0}». Измените город в меню области, Настройки плагина." },
  it: { feels: "Percepita {0} °C, umidità {1}%, vento {2} km/h",
        days: "Oggi da {0} a {1} °C, domani da {2} a {3} °C, pioggia {4}%",
        updated: "Aggiornato alle {0}, clicca per aggiornare", loading: "Recupero del meteo da wttr.in…",
        failed: "Al momento niente meteo da wttr.in, nuovo tentativo alle {0}",
        unknown: "wttr.in non conosce «{0}». Cambia la città nel menu del riquadro, Impostazioni del plugin." },
};
let t = TEXTS[pf.lang] || TEXTS.en;
const fill = (text, ...values) => text.replace(/\{(\d)\}/g, (_, i) => String(values[i]));
// wttr.in's names of the display languages (English needs none).
const LANG = { en: "", "zh-CN": "zh-cn", "zh-TW": "zh-tw", "pt-BR": "pt-br" };
const MINUTE = 60 * 1000;

let weather = null; // { place, rows } of the last answer
let fetchedAt = 0;
let nextAt = 0; // when to ask next
let waitUntil = 0; // wttr.in asked to wait until then (Retry-After): no request asks sooner
let askedAt = 0; // when the last request went out
let problem = ""; // why the last request failed
let busy = false;

// An emoji for wttr.in's weather code.
function icon(code) {
  const c = Number(code);
  if (c === 113) return "☀️";
  if (c === 116) return "⛅";
  if (c === 119 || c === 122) return "☁️";
  if ([143, 248, 260].includes(c)) return "🌫️";
  if ([200, 386, 389, 392, 395].includes(c)) return "⛈️";
  if ([176, 263, 266, 293, 296, 299, 302, 305, 308, 353, 356, 359].includes(c)) return "🌧️";
  return c ? "❄️" : "🌡️";
}

// The rows of wttr.in's answer (its format j1).
function read(w, city, lang) {
  const now = w.current_condition[0];
  const [today, tomorrow] = w.weather;
  const area = w.nearest_area && w.nearest_area[0];
  const place = city || (area ? area.areaName[0].value : "");
  // wttr.in leaves a description now and then in English ("Smoky haze"): its translation of
  // the same weather code elsewhere in the answer is taken then.
  const own = (e) => (e["lang_" + lang] || e.weatherDesc)[0].value;
  const english = (e) => own(e).trim() === e.weatherDesc[0].value.trim();
  const same = lang && english(now) && w.weather.flatMap((d) => d.hourly).find((h) => h.weatherCode === now.weatherCode && !english(h));
  const desc = own(same || now);
  const rain = Math.max(0, ...tomorrow.hourly.map((h) => Number(h.chanceofrain) || 0));
  return [
    { text: `${place}  ${now.temp_C}°C  ${desc}`, icon: icon(now.weatherCode), size: "large" },
    { text: fill(t.feels, now.FeelsLikeC, now.humidity, now.windspeedKmph) },
    { text: fill(t.days, today.mintempC, today.maxtempC, tomorrow.mintempC, tomorrow.maxtempC, rain) },
  ];
}

function draw() {
  const rows = weather ? [...weather] : [{ text: problem || t.loading, color: "gray" }];
  if (weather && problem) rows.push({ text: problem, color: "orange", size: "small" });
  if (weather) {
    rows.push({ id: "refresh", text: fill(t.updated, pf.time.format(fetchedAt, "time")), color: "gray", size: "small" });
  } else if (problem) {
    rows[0].id = "refresh";
  }
  pf.show({ rows });
}

// Retry-After in ms: seconds, or a date.
function retryAfter(answer) {
  const h = answer.headers["retry-after"];
  if (!h) return 0;
  return Number(h) * 1000 || Math.max(0, Date.parse(h) - pf.time.now()) || 0;
}

async function ask() {
  if (busy) return;
  if (pf.time.now() < waitUntil) {
    problem = fill(t.failed, pf.time.format(waitUntil, "time"));
    nextAt = waitUntil;
    return draw();
  }
  busy = true;
  askedAt = pf.time.now();
  const city = String(pf.settings.city || "").trim();
  const lang = LANG[pf.lang] ?? pf.lang;
  const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1` + (lang ? `&lang=${lang}` : "");
  let wait = 30 * MINUTE;
  try {
    const answer = await pf.http.get(url);
    if (answer.status !== 200) {
      // Retry-After holds back every request; without it the next try is in 5 minutes.
      const after = retryAfter(answer);
      if (after) waitUntil = pf.time.now() + after;
      wait = Math.max(5 * MINUTE, after);
      const notFound = city && /not found/i.test(answer.body || "");
      problem = notFound ? fill(t.unknown, city) : fill(t.failed, pf.time.format(pf.time.now() + wait, "time"));
    } else {
      weather = read(JSON.parse(answer.body), city, lang);
      fetchedAt = pf.time.now();
      problem = "";
    }
  } catch (e) {
    wait = 5 * MINUTE;
    problem = fill(t.failed, pf.time.format(pf.time.now() + wait, "time"));
  } finally {
    busy = false;
  }
  nextAt = pf.time.now() + wait;
  // The city changed while the answer was on its way: that answer is for the old one.
  if (String(pf.settings.city || "").trim() !== city) return ask();
  draw();
}

// Asks when it is time; the minute timer waits while the fence is hidden.
function due() {
  if (pf.time.now() >= nextAt) ask();
}

pf.on("start", () => {
  draw();
  ask();
});
// Another display language: the texts at once, wttr.in's descriptions with its next answer.
pf.on("lang", () => {
  t = TEXTS[pf.lang] || TEXTS.en;
  draw();
  ask();
});
pf.on("show", due);
pf.every(60, due);
pf.on("settings", () => {
  weather = null;
  problem = "";
  draw();
  ask();
});
pf.on("click", (e) => {
  if (e.id === "refresh" && pf.time.now() - askedAt >= MINUTE) ask();
});
