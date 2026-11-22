// Home Assistant: the states of the Home Assistant whose address the user typed in the fence's
// settings (`device`; port 8123 of permissions.local.lan), with a long-lived access token
// (`secret`). Sensors show their value, lights and switches turn on or off with a click. Read
// every 30 s and after each click.
"use strict";
const T = {
  en: { address: "Type the address of Home Assistant in this fence's plugin settings.", token: "Type a long-lived access token in the plugin settings (Home Assistant: your profile, Security).", loading: "Reading Home Assistant…", denied: "Home Assistant did not take the token. Check it in the plugin settings.", off: "Home Assistant does not answer at {0}. Click to try again.", on: "On", offState: "Off", none: "No entities to show.", many: "Home Assistant has too many entities to read at once. List the ones to show in the plugin settings." },
  "zh-CN": { address: "在这个栅栏的插件设置里填写 Home Assistant 的地址。", token: "在插件设置里填写长期访问令牌（在 Home Assistant 的个人资料 › 安全 里创建）。", loading: "正在读取 Home Assistant…", denied: "Home Assistant 没有接受这个令牌，请在插件设置里检查。", off: "{0} 上的 Home Assistant 没有回应。点一下再试。", on: "开", offState: "关", none: "没有可以显示的实体。", many: "Home Assistant 的实体太多，一次读不完。请在插件设置里填写要显示的实体。" },
  "zh-TW": { address: "在這個圍欄的外掛設定裡填寫 Home Assistant 的位址。", token: "在外掛設定裡填寫長期存取權杖（在 Home Assistant 的個人資料 › 安全性 裡建立）。", loading: "正在讀取 Home Assistant…", denied: "Home Assistant 沒有接受這個權杖，請在外掛設定裡檢查。", off: "{0} 上的 Home Assistant 沒有回應。點一下再試。", on: "開", offState: "關", none: "沒有可以顯示的實體。", many: "Home Assistant 的實體太多，一次讀不完。請在外掛設定裡填寫要顯示的實體。" },
  ja: { address: "このフェンスのプラグイン設定に Home Assistant のアドレスを入力してください。", token: "プラグイン設定に長期アクセストークンを入力してください（Home Assistant のプロフィール › セキュリティで作成）。", loading: "Home Assistant を読み込み中…", denied: "Home Assistant がトークンを受け付けませんでした。プラグイン設定で確認してください。", off: "{0} の Home Assistant が応答しません。クリックで再試行します。", on: "オン", offState: "オフ", none: "表示するエンティティがありません。", many: "Home Assistant のエンティティが多すぎて一度に読めません。プラグインの設定で表示するエンティティを入力してください。" },
  ko: { address: "이 펜스의 플러그인 설정에 Home Assistant 주소를 입력하세요.", token: "플러그인 설정에 장기 액세스 토큰을 입력하세요 (Home Assistant의 프로필 › 보안에서 만듭니다).", loading: "Home Assistant를 읽는 중…", denied: "Home Assistant가 토큰을 받지 않았습니다. 플러그인 설정에서 확인하세요.", off: "{0}의 Home Assistant가 응답하지 않습니다. 클릭하면 다시 시도합니다.", on: "켜짐", offState: "꺼짐", none: "표시할 엔티티가 없습니다.", many: "Home Assistant의 엔티티가 너무 많아 한 번에 읽을 수 없습니다. 플러그인 설정에 표시할 엔티티를 입력하세요." },
  de: { address: "Geben Sie die Adresse von Home Assistant in den Plugin-Einstellungen dieses Bereichs ein.", token: "Geben Sie in den Plugin-Einstellungen ein langlebiges Zugriffstoken ein (Home Assistant: Profil, Sicherheit).", loading: "Home Assistant wird gelesen…", denied: "Home Assistant hat das Token nicht angenommen. Prüfen Sie es in den Plugin-Einstellungen.", off: "Home Assistant antwortet unter {0} nicht. Klicken, um es erneut zu versuchen.", on: "An", offState: "Aus", none: "Keine Entitäten anzuzeigen.", many: "Home Assistant hat zu viele Entitäten, um sie auf einmal zu lesen. Tragen Sie die anzuzeigenden in den Plugin-Einstellungen ein." },
  fr: { address: "Saisissez l'adresse de Home Assistant dans les réglages du plugin de ce groupe.", token: "Saisissez un jeton d'accès longue durée dans les réglages du plugin (Home Assistant : votre profil, Sécurité).", loading: "Lecture de Home Assistant…", denied: "Home Assistant n'a pas accepté le jeton. Vérifiez-le dans les réglages du plugin.", off: "Home Assistant ne répond pas à {0}. Cliquez pour réessayer.", on: "Allumé", offState: "Éteint", none: "Aucune entité à afficher.", many: "Home Assistant a trop d'entités pour les lire d'un coup. Indiquez celles à afficher dans les réglages du plugin." },
  es: { address: "Escribe la dirección de Home Assistant en los ajustes del plugin de este grupo.", token: "Escribe un token de acceso de larga duración en los ajustes del plugin (Home Assistant: tu perfil, Seguridad).", loading: "Leyendo Home Assistant…", denied: "Home Assistant no aceptó el token. Revísalo en los ajustes del plugin.", off: "Home Assistant no responde en {0}. Haz clic para reintentar.", on: "Encendido", offState: "Apagado", none: "No hay entidades que mostrar.", many: "Home Assistant tiene demasiadas entidades para leerlas de una vez. Escribe las que quieres mostrar en los ajustes del plugin." },
  "pt-BR": { address: "Digite o endereço do Home Assistant nas configurações do plugin deste grupo.", token: "Digite um token de acesso de longa duração nas configurações do plugin (Home Assistant: seu perfil, Segurança).", loading: "Lendo o Home Assistant…", denied: "O Home Assistant não aceitou o token. Confira nas configurações do plugin.", off: "O Home Assistant não responde em {0}. Clique para tentar de novo.", on: "Ligado", offState: "Desligado", none: "Nenhuma entidade para mostrar.", many: "O Home Assistant tem entidades demais para ler de uma vez. Digite as que quer mostrar nas configurações do plugin." },
  ru: { address: "Укажите адрес Home Assistant в настройках плагина этой области.", token: "Укажите долгосрочный токен доступа в настройках плагина (Home Assistant: профиль, Безопасность).", loading: "Чтение Home Assistant…", denied: "Home Assistant не принял токен. Проверьте его в настройках плагина.", off: "Home Assistant не отвечает по адресу {0}. Нажмите, чтобы повторить.", on: "Вкл.", offState: "Выкл.", none: "Нет объектов для показа.", many: "У Home Assistant слишком много объектов, чтобы прочитать их сразу. Укажите нужные в настройках плагина." },
  it: { address: "Inserisci l'indirizzo di Home Assistant nelle impostazioni del plugin di questo riquadro.", token: "Inserisci un token di accesso di lunga durata nelle impostazioni del plugin (Home Assistant: il tuo profilo, Sicurezza).", loading: "Lettura di Home Assistant…", denied: "Home Assistant non ha accettato il token. Controllalo nelle impostazioni del plugin.", off: "Home Assistant non risponde a {0}. Fai clic per riprovare.", on: "Acceso", offState: "Spento", none: "Nessuna entità da mostrare.", many: "Home Assistant ha troppe entità da leggere in una volta. Indica quelle da mostrare nelle impostazioni del plugin." },
};
const texts = () => T[pf.lang] || T[pf.lang.split("-")[0]] || T.en;
let t = texts();
const TOGGLES = ["light", "switch", "fan", "input_boolean"];

// states: null until read; problem: the text shown instead of them.
let states = null, problem = "";
const base = () => "http://" + pf.settings.host + ":8123";
const auth = () => ({ Authorization: "Bearer " + pf.settings.token, "Content-Type": "application/json" });

function draw() {
  const rows = [];
  if (problem) rows.push({ id: "retry", text: problem, color: "gray" });
  else if (!states) rows.push({ text: t.loading, color: "gray" });
  else if (!states.length) rows.push({ text: t.none, color: "gray" });
  for (const s of (problem ? [] : states || [])) {
    const kind = s.entity_id.split(".")[0];
    const name = (s.attributes && s.attributes.friendly_name) || s.entity_id;
    const toggle = TOGGLES.includes(kind) && (s.state === "on" || s.state === "off");
    const unit = (s.attributes && s.attributes.unit_of_measurement) || "";
    const value = toggle ? (s.state === "on" ? t.on : t.offState) : s.state + (unit ? " " + unit : "");
    // A light or switch: a button that stays lit while it is on.
    const cell = toggle ? { id: "toggle:" + s.entity_id, text: value, checked: s.state === "on" } : { text: value, color: "gray" };
    rows.push({ cells: [{ text: name, fill: true }, cell] });
  }
  pf.show({ rows });
}

async function load() {
  if (!pf.settings.host) { problem = t.address; return draw(); }
  if (!pf.settings.token) { problem = t.token; return draw(); }
  const wanted = String(pf.settings.entities || "").split(",").map((x) => x.trim()).filter(Boolean);
  try {
    // The listed entities one by one (an unknown one is left out); without a list the first 30.
    const read = [];
    for (const id of wanted.length ? wanted.slice(0, 30) : [""]) {
      const r = await pf.http.get(base() + "/api/states" + (id ? "/" + encodeURIComponent(id) : ""), { headers: auth() });
      if (r.status === 401 || r.status === 403) { problem = t.denied; return draw(); }
      if (r.status === 404 && id) continue;
      if (r.status !== 200) throw new Error("HTTP " + r.status);
      read.push(...[].concat(JSON.parse(r.body)));
    }
    states = read.slice(0, 30);
    problem = "";
  } catch (e) {
    // A home with hundreds of entities answers more than a plugin may read at once.
    const many = !wanted.length && /larger than|would take/.test(e.message);
    problem = many ? t.many : t.off.replace("{0}", pf.settings.host) + " (" + e.message + ")";
  }
  draw();
}

pf.on("click", async (e) => {
  if (e.id === "retry") return load();
  if (!e.id || !e.id.startsWith("toggle:")) return;
  const body = JSON.stringify({ entity_id: e.id.slice(7) });
  await pf.http.post(base() + "/api/services/homeassistant/toggle", { headers: auth(), body }).catch(() => null);
  load();
});
pf.on("settings", load);
pf.on("show", load);
pf.on("lang", () => { t = texts(); draw(); });
pf.every(30, load);
draw();
load();
