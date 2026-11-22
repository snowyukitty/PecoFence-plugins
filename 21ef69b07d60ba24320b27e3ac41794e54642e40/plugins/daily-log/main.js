// Daily log: a line typed into the box goes, with the time, into today's Markdown file in a folder
// the user picked (<folder>\2026-11\2026-11-16.md); the fence shows today's lines. The plugin may
// write only inside that folder (folders: "readwrite") and only data files.
"use strict";
const T = {
  en: { pick: "Choose a folder…", trash: "Move today's log to the Recycle Bin", none: "Click here to choose the folder the log goes into.",
        hint: "Write what you are doing, Ctrl+Enter to log it", empty: "Nothing logged today.", failed: "Not written: " },
  "zh-CN": { pick: "选择文件夹…", trash: "把今天的记录移到回收站", none: "点这里选一个文件夹，记录会写在那里。",
             hint: "写下现在在做的事，按 Ctrl+Enter 记下", empty: "今天还没有记录。", failed: "没有写进去：" },
  "zh-TW": { pick: "選擇資料夾…", trash: "把今天的記錄移到資源回收筒", none: "點這裡選一個資料夾，記錄會寫在那裡。",
             hint: "寫下現在在做的事，按 Ctrl+Enter 記下", empty: "今天還沒有記錄。", failed: "沒有寫進去：" },
  ja: { pick: "フォルダーを選ぶ…", trash: "今日の記録をごみ箱に移す", none: "ここをクリックして、記録を書き込むフォルダーを選んでください。",
        hint: "今していることを書いて、Ctrl+Enter で記録", empty: "今日の記録はまだありません。", failed: "書き込めませんでした: " },
  ko: { pick: "폴더 선택…", trash: "오늘 기록을 휴지통으로 이동", none: "여기를 클릭해 기록을 쓸 폴더를 고르세요.",
        hint: "지금 하는 일을 쓰고 Ctrl+Enter로 기록", empty: "오늘 기록이 아직 없습니다.", failed: "쓰지 못했습니다: " },
  de: { pick: "Ordner wählen…", trash: "Heutiges Protokoll in den Papierkorb", none: "Hier klicken, um den Ordner für das Protokoll zu wählen.",
        hint: "Schreiben Sie, was Sie gerade tun; Strg+Eingabe trägt es ein", empty: "Heute noch nichts eingetragen.", failed: "Nicht geschrieben: " },
  fr: { pick: "Choisir un dossier…", trash: "Mettre le journal du jour à la corbeille", none: "Cliquez ici pour choisir le dossier du journal.",
        hint: "Écrivez ce que vous faites ; Ctrl+Entrée l'enregistre", empty: "Rien d'enregistré aujourd'hui.", failed: "Non écrit : " },
  es: { pick: "Elegir una carpeta…", trash: "Mover el registro de hoy a la papelera", none: "Haz clic aquí para elegir la carpeta del registro.",
        hint: "Escribe lo que estás haciendo; Ctrl+Intro lo registra", empty: "Hoy no hay nada registrado.", failed: "No se escribió: " },
  "pt-BR": { pick: "Escolher uma pasta…", trash: "Mover o registro de hoje para a lixeira", none: "Clique aqui para escolher a pasta do registro.",
             hint: "Escreva o que está fazendo; Ctrl+Enter registra", empty: "Nada registrado hoje.", failed: "Não foi gravado: " },
  ru: { pick: "Выбрать папку…", trash: "Переместить сегодняшние записи в корзину", none: "Нажмите здесь, чтобы выбрать папку для записей.",
        hint: "Напишите, чем вы заняты; Ctrl+Enter запишет", empty: "Сегодня записей ещё нет.", failed: "Не записано: " },
  it: { pick: "Scegli una cartella…", trash: "Sposta il registro di oggi nel cestino", none: "Fai clic qui per scegliere la cartella del registro.",
        hint: "Scrivi cosa stai facendo; Ctrl+Invio lo registra", empty: "Niente registrato oggi.", failed: "Non scritto: " },
};
const texts = () => T[pf.lang] || T[pf.lang.split("-")[0]] || T.en;
let t = texts();
// The folder of this fence, kept in a data file named after the fence (it goes with the fence).
const kept = () => pf.fence.id + "-folder.txt";
let folder = null;
let lines = [];
let draft = "";
let problem = "";

const pad = (n) => String(n).padStart(2, "0");
function today() {
  const d = new Date(pf.time.now());
  const month = d.getFullYear() + "-" + pad(d.getMonth() + 1);
  const dir = folder + "\\" + month;
  return { dir, file: dir + "\\" + month + "-" + pad(d.getDate()) + ".md" };
}

function draw() {
  const rows = [];
  if (!folder) {
    rows.push({ id: "pick", text: t.none, color: "blue" });
  } else {
    rows.push({ text: folder.split("\\").pop(), color: "gray", size: "small", tip: folder });
    rows.push({ input: { type: "text", id: "entry", lines: 3, value: draft, placeholder: t.hint, max: 2000 } });
    if (problem) rows.push({ text: t.failed + problem, color: "red" });
    if (!lines.length) rows.push({ text: t.empty, color: "gray" });
    for (const l of lines.slice(-30)) rows.push({ text: l });
  }
  pf.show({ rows, menu: [{ id: "pick", title: t.pick }, { id: "trash", title: t.trash, disabled: !folder }] });
}

// Whether `list` (pf.folder.list's answer) has the file or folder at the end of `path`.
const named = (list, path) => list.items.some((e) => e.name.toLowerCase() === path.split("\\").pop().toLowerCase());
// Today's file as it is, "" when there is none yet. A file that is there but cannot be read (more
// than a plugin may read at once, a cloud file not on this computer) rejects: nothing overwrites it.
async function readToday() {
  const { dir, file } = today();
  if (!named(await pf.folder.list(folder), dir)) return "";
  return named(await pf.folder.list(dir), file) ? pf.folder.read(file) : "";
}

async function load() {
  folder = (await pf.data.read(kept())) || null;
  lines = [];
  if (folder) {
    const text = await readToday().catch(() => "");
    lines = text.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
  }
  draw();
}

async function pick() {
  const picked = await pf.folder.pick();
  if (!picked) return;
  await pf.data.write(kept(), picked);
  problem = "";
  load();
}

// One line after another: a second Ctrl+Enter waits for the first, so no line is lost.
let queue = Promise.resolve();
function log(text) {
  queue = queue.then(() => append(text)).catch(() => {});
}

async function append(text) {
  const line = pf.time.format(pf.time.now(), "time") + " " + text.replace(/\s*\n\s*/g, " ").trim();
  const { dir, file } = today();
  try {
    await pf.folder.mkdir(dir);
    const before = (await readToday()) || "# " + file.split("\\").pop().slice(0, -3) + "\n\n";
    await pf.folder.write(file, before + "- " + line + "\n");
    // Only this line's draft: what was typed meanwhile stays in the box.
    if (draft === text) draft = "";
    problem = "";
  } catch (e) {
    problem = e.message;
  }
  await load();
}

pf.on("start", load);
pf.on("lang", () => { t = texts(); draw(); });
pf.on("click", (c) => { if (c.id === "pick") pick(); });
pf.on("change", (c) => { if (c.id === "entry") draft = c.text; });
pf.on("submit", (c) => { if (c.id === "entry" && draft.trim()) log(draft); });
pf.on("command", async (c) => {
  if (c.id === "pick") pick();
  if (c.id === "trash" && folder) {
    await pf.folder.trash(today().file).catch((e) => { problem = e.message; });
    load();
  }
});
