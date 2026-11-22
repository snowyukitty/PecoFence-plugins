// PC status: CPU and memory load, the computer's IP address (a click copies it), a row that opens
// Task Manager, and the free space of each drive with a bar. It looks every 2 seconds while the
// fence shows (PecoFence holds the timer while the fence is rolled up or hidden) and the address
// every 30 seconds, as it changes only when the network does. All values stay on this computer.

const TEXTS = {
  en: { cpu: "CPU {0}%", memory: "Memory used {0}%", ip: "IP address {0}", ipTip: "Click to copy it",
        copied: "Copied {0}", noIp: "IP address: no network", findingIp: "IP address: looking…",
        taskmgr: "Open Task Manager", drive: "{0}: {1} GB free ({2}%)" },
  "zh-CN": { cpu: "CPU {0}%", memory: "内存已用 {0}%", ip: "本机 IP {0}", ipTip: "点一下复制",
             copied: "已复制 {0}", noIp: "本机 IP：没有连接网络", findingIp: "本机 IP：正在查找…",
             taskmgr: "打开任务管理器", drive: "{0} 盘剩余 {1} GB（{2}%）" },
  "zh-TW": { cpu: "CPU {0}%", memory: "記憶體已用 {0}%", ip: "本機 IP {0}", ipTip: "點一下複製",
             copied: "已複製 {0}", noIp: "本機 IP：沒有連線網路", findingIp: "本機 IP：正在尋找…",
             taskmgr: "開啟工作管理員", drive: "{0} 磁碟剩餘 {1} GB（{2}%）" },
  ja: { cpu: "CPU {0}%", memory: "メモリ使用率 {0}%", ip: "IP アドレス {0}", ipTip: "クリックでコピー",
        copied: "コピーしました {0}", noIp: "IP アドレス：ネットワーク未接続", findingIp: "IP アドレス：確認中…",
        taskmgr: "タスク マネージャーを開く", drive: "{0} ドライブの空き {1} GB（{2}%）" },
  ko: { cpu: "CPU {0}%", memory: "메모리 사용 {0}%", ip: "IP 주소 {0}", ipTip: "클릭하면 복사합니다",
        copied: "복사함 {0}", noIp: "IP 주소: 네트워크 연결 안 됨", findingIp: "IP 주소: 찾는 중…",
        taskmgr: "작업 관리자 열기", drive: "{0} 드라이브 여유 공간 {1}GB({2}%)" },
  de: { cpu: "CPU {0} %", memory: "Arbeitsspeicher belegt {0} %", ip: "IP-Adresse {0}", ipTip: "Klicken zum Kopieren",
        copied: "Kopiert {0}", noIp: "IP-Adresse: kein Netzwerk", findingIp: "IP-Adresse: wird gesucht…",
        taskmgr: "Task-Manager öffnen", drive: "{0}: {1} GB frei ({2} %)" },
  fr: { cpu: "Processeur {0} %", memory: "Mémoire utilisée {0} %", ip: "Adresse IP {0}", ipTip: "Cliquez pour la copier",
        copied: "Copiée {0}", noIp: "Adresse IP : pas de réseau", findingIp: "Adresse IP : recherche…",
        taskmgr: "Ouvrir le Gestionnaire des tâches", drive: "{0}: {1} Go libres ({2} %)" },
  es: { cpu: "CPU {0} %", memory: "Memoria usada {0} %", ip: "Dirección IP {0}", ipTip: "Haga clic para copiarla",
        copied: "Copiada {0}", noIp: "Dirección IP: sin red", findingIp: "Dirección IP: buscando…",
        taskmgr: "Abrir el Administrador de tareas", drive: "{0}: {1} GB libres ({2} %)" },
  "pt-BR": { cpu: "CPU {0}%", memory: "Memória usada {0}%", ip: "Endereço IP {0}", ipTip: "Clique para copiar",
             copied: "Copiado {0}", noIp: "Endereço IP: sem rede", findingIp: "Endereço IP: procurando…",
             taskmgr: "Abrir o Gerenciador de Tarefas", drive: "{0}: {1} GB livres ({2}%)" },
  ru: { cpu: "ЦП {0}%", memory: "Память занята на {0}%", ip: "IP-адрес {0}", ipTip: "Щёлкните, чтобы скопировать",
        copied: "Скопировано {0}", noIp: "IP-адрес: нет сети", findingIp: "IP-адрес: поиск…",
        taskmgr: "Открыть диспетчер задач", drive: "{0}: свободно {1} ГБ ({2}%)" },
  it: { cpu: "CPU {0}%", memory: "Memoria usata {0}%", ip: "Indirizzo IP {0}", ipTip: "Clicca per copiarlo",
        copied: "Copiato {0}", noIp: "Indirizzo IP: nessuna rete", findingIp: "Indirizzo IP: ricerca…",
        taskmgr: "Apri Gestione attività", drive: "{0}: {1} GB liberi ({2}%)" },
};
let t = TEXTS[pf.lang] || TEXTS.en;
pf.on("lang", () => { t = TEXTS[pf.lang] || TEXTS.en; draw(); });
const fill = (text, ...values) => text.replace(/\{(\d)\}/g, (_, i) => String(values[i]));
const GB = 1024 * 1024 * 1024;

// The last values; null while unknown. `ip` is undefined until the first look, null without a
// network.
let cpu = null;
let memory = null;
let drives = [];
let ip;
let ipAsked = 0;
let copiedUntil = 0;
let busy = false;
let shown = "";

const color = (value, warm, hot) => (value > hot ? "red" : value > warm ? "orange" : "green");

function rows() {
  const out = [
    { text: fill(t.cpu, cpu ?? "…"), color: cpu == null ? "gray" : color(cpu, 50, 80), icon: "🧠" },
    { text: fill(t.memory, memory ?? "…"), color: memory == null ? "gray" : color(memory, 85, 85), icon: "📊" },
    { separator: true },
  ];
  if (ip === undefined) out.push({ text: t.findingIp, color: "gray", icon: "📋" });
  else if (ip === null) out.push({ text: t.noIp, color: "gray", icon: "📋" });
  else {
    const copied = pf.time.now() < copiedUntil;
    out.push({ id: "ip", text: fill(copied ? t.copied : t.ip, ip), tip: t.ipTip, icon: "📋" });
  }
  out.push({ id: "taskmgr", text: t.taskmgr, icon: "📈" });
  // The drives come last: when the fence is too short for all rows, they are what is cut.
  out.push({ separator: true });
  for (const d of drives) {
    const free = d.size > 0 ? d.free / d.size : 0;
    out.push({
      text: fill(t.drive, d.letter, Math.round(d.free / GB), Math.round(free * 100)),
      color: free < 0.1 ? "red" : "green",
      icon: "💽",
      progress: 1 - free,
    });
  }
  return out;
}

// Shows the rows only when they changed.
function draw() {
  const view = { rows: rows() };
  const json = JSON.stringify(view);
  if (json !== shown) {
    shown = json;
    pf.show(view);
  }
}

// All values at once; a look that is still under way when the next is due is not doubled.
async function refresh() {
  if (busy) return;
  busy = true;
  const now = pf.time.now();
  const askIp = now - ipAsked >= 30000;
  if (askIp) ipAsked = now;
  try {
    const [c, m, d, i] = await Promise.all([
      pf.sys.cpu().catch(() => null),
      pf.sys.memory().catch(() => null),
      pf.sys.drives().catch(() => drives),
      askIp ? pf.sys.ip().catch(() => null) : ip,
    ]);
    cpu = c;
    memory = m;
    drives = Array.isArray(d) ? d : [];
    ip = i;
  } finally {
    busy = false;
  }
  draw();
}

pf.on("start", () => {
  draw();
  refresh();
});
pf.on("show", refresh);
pf.every(2, refresh);

pf.on("click", (e) => {
  if (e.id === "taskmgr") pf.openSystem("taskmgr").catch(() => {});
  if (e.id === "ip" && ip) {
    pf.clipboard.setText(ip).then(() => {
      copiedUntil = pf.time.now() + 2000;
      draw();
      pf.after(2, draw);
    }, () => {});
  }
});
