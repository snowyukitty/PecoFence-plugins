// GitHub: the newest open issues and pull requests of the repository in this fence's setting
// "repo" (owner/name); a click on one opens it in the browser. It asks GitHub without signing
// in, which allows 60 requests an hour from one network address: once every 10 minutes while the
// fence shows, and when GitHub says to wait (Retry-After, or the reset time of its limit; a 403 or
// 429 without either, 10 minutes), it waits that long, clicks included. After a settings change
// it asks 2 seconds later, once the changes stopped.

const COUNT = 8;
const TEXTS = {
  en: { updated: "Updated at {0}, click to refresh", loading: "Asking GitHub…",
        failed: "No answer from GitHub, trying again at {0}", limited: "GitHub asks to wait, trying again at {0}",
        missing: "GitHub has no public repository {0}",
        bad: "Write the repository as owner/name in the fence menu, Plugin settings",
        none: "No open issues or pull requests", tip: "{0}, {1}" },
  "zh-CN": { updated: "{0} 更新，点一下刷新", loading: "正在询问 GitHub…",
             failed: "GitHub 没有回应，{0} 再试", limited: "GitHub 要求等一等，{0} 再试",
             missing: "GitHub 上没有公开的仓库 {0}",
             bad: "请在栅栏菜单的「插件设置」里把仓库写成 owner/name",
             none: "没有未关闭的 issue 和 PR", tip: "{0}，{1}" },
  "zh-TW": { updated: "{0} 更新，點一下重新整理", loading: "正在詢問 GitHub…",
             failed: "GitHub 沒有回應，{0} 再試", limited: "GitHub 要求等一等，{0} 再試",
             missing: "GitHub 上沒有公開的存放庫 {0}",
             bad: "請在圍欄選單的「外掛設定」裡把存放庫寫成 owner/name",
             none: "沒有未關閉的 issue 和 PR", tip: "{0}，{1}" },
  ja: { updated: "{0} に更新、クリックで再取得", loading: "GitHub に問い合わせています…",
        failed: "GitHub から応答がありません。{0} にもう一度試します",
        limited: "GitHub から待つように言われました。{0} にもう一度試します",
        missing: "GitHub に公開リポジトリ {0} がありません",
        bad: "フェンスのメニューの「プラグインの設定」で、リポジトリを owner/name の形で書いてください",
        none: "未解決の Issue とプル リクエストはありません", tip: "{0}、{1}" },
  ko: { updated: "{0} 업데이트, 클릭하면 새로 고침", loading: "GitHub에 묻는 중…",
        failed: "GitHub에서 응답이 없습니다. {0}에 다시 시도합니다",
        limited: "GitHub이 기다리라고 합니다. {0}에 다시 시도합니다",
        missing: "GitHub에 공개 저장소 {0}이(가) 없습니다",
        bad: "펜스 메뉴의 '플러그인 설정'에서 저장소를 owner/name 형식으로 쓰세요",
        none: "열린 이슈와 풀 리퀘스트가 없습니다", tip: "{0}, {1}" },
  de: { updated: "Stand {0}, zum Aktualisieren klicken", loading: "GitHub wird gefragt…",
        failed: "Keine Antwort von GitHub, neuer Versuch um {0}", limited: "GitHub bittet zu warten, neuer Versuch um {0}",
        missing: "GitHub hat kein öffentliches Repository {0}",
        bad: "Schreiben Sie das Repository als owner/name ins Bereichsmenü unter Plugin-Einstellungen",
        none: "Keine offenen Issues oder Pull Requests", tip: "{0}, {1}" },
  fr: { updated: "Mis à jour à {0}, cliquez pour actualiser", loading: "Interrogation de GitHub…",
        failed: "Pas de réponse de GitHub, nouvel essai à {0}", limited: "GitHub demande d'attendre, nouvel essai à {0}",
        missing: "GitHub n'a pas de dépôt public {0}",
        bad: "Écrivez le dépôt sous la forme owner/name dans le menu du groupe, Réglages du plugin",
        none: "Aucune issue ni pull request ouverte", tip: "{0}, {1}" },
  es: { updated: "Actualizado a las {0}, haga clic para actualizar", loading: "Consultando GitHub…",
        failed: "GitHub no responde, se vuelve a intentar a las {0}",
        limited: "GitHub pide esperar, se vuelve a intentar a las {0}",
        missing: "GitHub no tiene un repositorio público {0}",
        bad: "Escriba el repositorio como owner/name en el menú del grupo, Ajustes del plugin",
        none: "No hay issues ni pull requests abiertas", tip: "{0}, {1}" },
  "pt-BR": { updated: "Atualizado às {0}, clique para atualizar", loading: "Consultando o GitHub…",
             failed: "Sem resposta do GitHub, nova tentativa às {0}",
             limited: "O GitHub pede para esperar, nova tentativa às {0}",
             missing: "O GitHub não tem um repositório público {0}",
             bad: "Escreva o repositório como owner/name no menu do grupo, Configurações do plugin",
             none: "Nenhuma issue ou pull request aberta", tip: "{0}, {1}" },
  ru: { updated: "Обновлено в {0}, щёлкните, чтобы обновить", loading: "Запрос к GitHub…",
        failed: "GitHub не отвечает, новая попытка в {0}", limited: "GitHub просит подождать, новая попытка в {0}",
        missing: "На GitHub нет открытого репозитория {0}",
        bad: "Укажите репозиторий в виде owner/name в меню области, Настройки плагина",
        none: "Нет открытых задач и пул-реквестов", tip: "{0}, {1}" },
  it: { updated: "Aggiornato alle {0}, clicca per aggiornare", loading: "Richiesta a GitHub…",
        failed: "Nessuna risposta da GitHub, nuovo tentativo alle {0}",
        limited: "GitHub chiede di aspettare, nuovo tentativo alle {0}",
        missing: "GitHub non ha un repository pubblico {0}",
        bad: "Scrivi il repository come owner/name nel menu del riquadro, Impostazioni del plugin",
        none: "Nessuna issue o pull request aperta", tip: "{0}, {1}" },
};
let t = TEXTS[pf.lang] || TEXTS.en;
pf.on("lang", () => { t = TEXTS[pf.lang] || TEXTS.en; draw(); });
const fill = (text, ...values) => text.replace(/\{(\d)\}/g, (_, i) => String(values[i]));
const MINUTE = 60 * 1000;

let items = null; // the last list: [{ id, url, text, pr, tip }]
let fetchedAt = 0;
let nextAt = 0; // when to ask next
let waitUntil = 0; // GitHub asked to wait until then: clicks wait too
let problem = "";
let busy = false;
let settled = 0; // the timer that asks 2 seconds after the last settings change

// The setting as owner/name; a pasted github.com address works too. "" when it is not one (a
// part of only dots, such as "..", would make another address of the API).
function repo() {
  const r = String(pf.settings.repo || "").trim()
    .replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "")
    .replace(/(\.git)?\/*$/, "");
  return /^[\w.-]+\/[\w.-]+$/.test(r) && !r.split("/").some((part) => /^\.+$/.test(part)) ? r : "";
}

function draw() {
  const name = repo();
  if (!name) return pf.show({ rows: [{ text: t.bad, color: "orange" }] });
  const rows = [{ id: "repo", text: name, icon: "🐙", bold: true, tip: `https://github.com/${name}` }, { separator: true }];
  // Before the first list, the row that says what went wrong is the one to click to ask again.
  if (!items) rows.push({ text: problem || t.loading, color: "gray", ...(problem && { id: "refresh" }) });
  else if (!items.length) rows.push({ text: t.none, color: "gray" });
  for (const i of items || []) rows.push({ id: i.id, text: i.text, icon: i.pr ? "🔀" : "🟢", tip: i.tip });
  if (items) {
    rows.push({ separator: true });
    if (problem) rows.push({ text: problem, color: "orange", size: "small" });
    rows.push({ id: "refresh", text: fill(t.updated, pf.time.format(fetchedAt, "time")), color: "gray", size: "small" });
  }
  pf.show({ rows });
}

// How long GitHub asks to wait, in ms (0 when it does not).
function asked(answer) {
  const h = answer.headers;
  const after = Number(h["retry-after"]) || 0;
  if (after > 0) return after * 1000;
  if (h["x-ratelimit-remaining"] === "0") return Math.max(0, Number(h["x-ratelimit-reset"]) * 1000 - pf.time.now());
  return 0;
}

async function ask() {
  const name = repo();
  if (busy || !name) return;
  if (pf.time.now() < waitUntil) {
    problem = fill(t.limited, pf.time.format(waitUntil, "time"));
    return draw();
  }
  busy = true;
  let wait = 10 * MINUTE;
  const at = (ms) => pf.time.format(pf.time.now() + ms, "time");
  try {
    const answer = await pf.http.get(`https://api.github.com/repos/${name}/issues?state=open&per_page=${COUNT}`, {
      headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    });
    const pause = asked(answer);
    if (answer.status === 200) {
      items = JSON.parse(answer.body).map((i) => ({
        id: "item:" + i.number,
        url: i.html_url,
        text: `#${i.number}  ${i.title}`,
        pr: Boolean(i.pull_request),
        tip: fill(t.tip, i.user && i.user.login, pf.time.format(Date.parse(i.created_at), "date")),
      }));
      fetchedAt = pf.time.now();
      problem = "";
    } else if (answer.status === 404) {
      items = null;
      problem = fill(t.missing, name);
    } else if (pause > 0 || answer.status === 403 || answer.status === 429) {
      // Without Retry-After or a reset time, GitHub's limit for too many requests: 10 minutes.
      wait = pause > 0 ? pause : 10 * MINUTE;
      waitUntil = pf.time.now() + wait;
      problem = fill(t.limited, at(wait));
    } else {
      problem = fill(t.failed, at(wait));
    }
    // The limit is used up: the next request waits for its reset.
    if (pause > 0) {
      wait = Math.max(wait, pause);
      waitUntil = pf.time.now() + pause;
    }
  } catch (e) {
    problem = fill(t.failed, at(wait));
  } finally {
    busy = false;
  }
  nextAt = pf.time.now() + wait;
  // The setting changed while the answer was on its way: that answer is for the old one. The
  // 2 second wait after the change asks; when it ran out meanwhile (it found a request under
  // way), the new one is asked now.
  if (repo() !== name) {
    items = null;
    problem = "";
    if (!settled) return ask();
    return draw();
  }
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
pf.on("show", due);
pf.every(60, due);
pf.on("settings", () => {
  items = null;
  problem = "";
  draw();
  pf.cancel(settled);
  settled = pf.after(2, () => {
    settled = 0;
    ask();
  });
});
pf.on("click", (e) => {
  const name = repo();
  if (e.id === "refresh") ask();
  if (e.id === "repo" && name) pf.open(`https://github.com/${name}`).catch(() => {});
  // The address comes from GitHub's answer: PecoFence refuses it unless its host is github.com.
  const item = (items || []).find((i) => i.id === e.id);
  try {
    if (item) pf.open(item.url).catch(() => {});
  } catch (err) {
    problem = String(err.message);
    draw();
  }
});
