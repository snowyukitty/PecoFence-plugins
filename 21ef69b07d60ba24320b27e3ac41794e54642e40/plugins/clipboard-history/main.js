// Clipboard history: what you copy (texts, lists of files and pictures), newest first. A click
// on an entry copies it again, a double-click shows more of it, the trash button deletes it and
// the pin under it keeps it: pinned entries stay on top and through Delete all, the purge and
// restarts. At the top: Show entries (untick it and every entry is blurred until the pointer is
// on it), Delete all, and the purge, which deletes every entry a while after the first came.
// Ported from the clipboard history script fence xan2622 wrote for PecoFence (#223).
//
// Nothing leaves the computer. Entries live in memory; long texts, pictures, the pinned entries
// and the boxes' state are files in the plugin's data folder whose names start with this fence's
// id, so each fence keeps its own history and PecoFence deletes them with the fence. PecoFence
// leaves out what password managers mark private, and keeps no copy of what this fence shows.

const MAX_ENTRIES = 30; // entries kept, the pinned ones not counted (the oldest go first)
const KEEP_TEXT = 2000; // characters a text keeps in memory; a longer one goes to a data file
const IMAGE_HEIGHT = 110; // DIPs a picture is drawn at most, and after a double-click
const BIG_HEIGHT = 320;
const MORE_LINES = 12; // lines a double-click shows of a text or a list of files
const STEPS = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 300, 600, 900, 1200, 1800, 2700, 3600,
  5400, 7200, 10800, 14400, 28800, 43200, 86400]; // the purge delays < and > go through, seconds

// Segoe Fluent Icons characters of the buttons.
const ICON = { trash: String.fromCharCode(0xe74d), pin: String.fromCharCode(0xe718),
  less: String.fromCharCode(0xe76b), more: String.fromCharCode(0xe76c) };

const TEXTS = {
  en: { show: "Show entries", showTip: "Untick to blur every entry until the pointer is on it, for instance while you stream",
        deleteAll: "Delete all", auto: "Purge entries in:", autoTip: "Delete every entry this long after the first one came",
        min: "min", sec: "s", valueTip: "Click to type minutes and seconds", typeDelay: "Type minutes, or minutes:seconds such as 1:30",
        less: "Less", more: "More", pin: "Pin", unpin: "Unpin", empty: "Nothing copied yet. What you copy shows here.",
        delTip: "Delete this entry", copyTip: "Click to copy it again, double-click to see more of it",
        image: "Image", file: "file", files: "files", chars: "characters", cut: "Only the first 256 KB of this text were kept" },
  "zh-CN": { show: "显示条目", showTip: "取消勾选后，所有条目都模糊显示，鼠标移上去才看得清，例如直播时",
             deleteAll: "全部删除", auto: "清除条目，时间：", autoTip: "第一条出现后经过这段时间，删除所有条目",
             min: "分钟", sec: "秒", valueTip: "点击输入分钟和秒数", typeDelay: "输入分钟数，或者像 1:30 这样的分:秒",
             less: "减少", more: "增加", pin: "固定", unpin: "取消固定", empty: "还没有复制任何内容。复制的内容会显示在这里。",
             delTip: "删除此条目", copyTip: "点击再次复制，双击查看更多",
             image: "图片", file: "个文件", files: "个文件", chars: "个字符", cut: "这段文字太长，只保留了前 256 KB" },
  "zh-TW": { show: "顯示項目", showTip: "取消勾選後，所有項目都模糊顯示，滑鼠移上去才看得清，例如直播時",
             deleteAll: "全部刪除", auto: "清除項目，時間：", autoTip: "第一筆出現後經過這段時間，刪除所有項目",
             min: "分鐘", sec: "秒", valueTip: "點擊輸入分鐘和秒數", typeDelay: "輸入分鐘數，或像 1:30 這樣的分:秒",
             less: "減少", more: "增加", pin: "固定", unpin: "取消固定", empty: "尚未複製任何內容。複製的內容會顯示在這裡。",
             delTip: "刪除此項目", copyTip: "點擊再次複製，按兩下查看更多",
             image: "圖片", file: "個檔案", files: "個檔案", chars: "個字元", cut: "這段文字太長，只保留了前 256 KB" },
  ja: { show: "項目を表示", showTip: "チェックを外すと、マウスを乗せるまですべての項目をぼかします（配信中など）",
        deleteAll: "すべて削除", auto: "次の時間後に項目を消去:", autoTip: "最初の項目が入ってから、この時間後にすべての項目を削除します",
        min: "分", sec: "秒", valueTip: "クリックして分と秒を入力", typeDelay: "分、または 1:30 のように分:秒で入力",
        less: "減らす", more: "増やす", pin: "ピン留め", unpin: "ピン留めを外す", empty: "まだ何もコピーされていません。コピーしたものがここに表示されます。",
        delTip: "この項目を削除", copyTip: "クリックでもう一度コピー、ダブルクリックで続きを表示",
        image: "画像", file: "個のファイル", files: "個のファイル", chars: "文字", cut: "長すぎるため、この文字列は最初の 256 KB だけを保存しました" },
  ko: { show: "항목 표시", showTip: "선택을 해제하면 마우스를 올리기 전까지 모든 항목을 흐리게 합니다(예: 방송 중)",
        deleteAll: "모두 삭제", auto: "다음 시간 후 항목 비우기:", autoTip: "첫 항목이 들어온 뒤 이 시간이 지나면 모든 항목을 삭제합니다",
        min: "분", sec: "초", valueTip: "클릭하여 분과 초 입력", typeDelay: "분 또는 1:30처럼 분:초로 입력",
        less: "줄이기", more: "늘리기", pin: "고정", unpin: "고정 해제", empty: "아직 복사한 것이 없습니다. 복사한 내용이 여기에 표시됩니다.",
        delTip: "이 항목 삭제", copyTip: "클릭하여 다시 복사, 두 번 클릭하면 더 보기",
        image: "이미지", file: "개 파일", files: "개 파일", chars: "자", cut: "너무 길어서 이 텍스트는 처음 256KB만 저장했습니다" },
  de: { show: "Einträge anzeigen", showTip: "Abwählen, um alle Einträge unscharf zu zeigen, bis die Maus darauf steht, z. B. bei einem Livestream",
        deleteAll: "Alle löschen", auto: "Einträge bereinigen in:", autoTip: "Löscht alle Einträge nach dieser Zeit, ab dem ersten",
        min: "Min.", sec: "Sek.", valueTip: "Klicken, um Minuten und Sekunden einzutippen", typeDelay: "Minuten eingeben, oder Minuten:Sekunden wie 1:30",
        less: "Weniger", more: "Mehr", pin: "Anheften", unpin: "Lösen", empty: "Noch nichts kopiert. Was Sie kopieren, erscheint hier.",
        delTip: "Diesen Eintrag löschen", copyTip: "Klicken, um ihn erneut zu kopieren, doppelklicken, um mehr zu sehen",
        image: "Bild", file: "Datei", files: "Dateien", chars: "Zeichen", cut: "Nur die ersten 256 KB dieses Textes wurden behalten" },
  fr: { show: "Afficher les entrées", showTip: "Décochez pour flouter toutes les entrées tant que la souris n'est pas dessus, par exemple pendant un direct",
        deleteAll: "Tout supprimer", auto: "Purger les entrées dans :", autoTip: "Supprime toutes les entrées après ce délai, compté depuis l'arrivée de la première",
        min: "min", sec: "s", valueTip: "Cliquez pour saisir minutes et secondes", typeDelay: "Saisissez les minutes, ou minutes:secondes comme 1:30",
        less: "Moins", more: "Plus", pin: "Épingler", unpin: "Désépingler", empty: "Rien n'a encore été copié. Ce que vous copiez apparaît ici.",
        delTip: "Supprimer cette entrée", copyTip: "Cliquez pour la copier à nouveau, double-cliquez pour en voir plus",
        image: "Image", file: "fichier", files: "fichiers", chars: "caractères", cut: "Seuls les 256 premiers Ko de ce texte ont été gardés" },
  es: { show: "Mostrar entradas", showTip: "Desmarque para desenfocar todas las entradas hasta que el puntero esté encima, por ejemplo durante una emisión en directo",
        deleteAll: "Borrar todo", auto: "Purgar entradas en:", autoTip: "Borra todas las entradas pasado este tiempo desde la primera",
        min: "min", sec: "s", valueTip: "Haga clic para escribir minutos y segundos", typeDelay: "Escriba los minutos, o minutos:segundos como 1:30",
        less: "Menos", more: "Más", pin: "Anclar", unpin: "Desanclar", empty: "Aún no se ha copiado nada. Lo que copie aparecerá aquí.",
        delTip: "Borrar esta entrada", copyTip: "Haga clic para copiarla de nuevo, doble clic para ver más",
        image: "Imagen", file: "archivo", files: "archivos", chars: "caracteres", cut: "Solo se guardaron los primeros 256 KB de este texto" },
  "pt-BR": { show: "Mostrar entradas", showTip: "Desmarque para desfocar todas as entradas até o ponteiro passar sobre elas, por exemplo durante uma transmissão ao vivo",
             deleteAll: "Excluir tudo", auto: "Limpar entradas em:", autoTip: "Exclui todas as entradas depois deste tempo, contado da primeira",
             min: "min", sec: "s", valueTip: "Clique para digitar minutos e segundos", typeDelay: "Digite os minutos, ou minutos:segundos como 1:30",
             less: "Menos", more: "Mais", pin: "Fixar", unpin: "Desafixar", empty: "Nada copiado ainda. O que você copiar aparece aqui.",
             delTip: "Excluir esta entrada", copyTip: "Clique para copiá-la de novo, clique duas vezes para ver mais",
             image: "Imagem", file: "arquivo", files: "arquivos", chars: "caracteres", cut: "Só os primeiros 256 KB deste texto foram guardados" },
  ru: { show: "Показывать записи", showTip: "Снимите флажок, чтобы размыть все записи, пока на них нет указателя, например во время трансляции",
        deleteAll: "Удалить все", auto: "Очистка записей через:", autoTip: "Удаляет все записи через это время после появления первой",
        min: "мин", sec: "сек", valueTip: "Щёлкните, чтобы ввести минуты и секунды", typeDelay: "Введите минуты или минуты:секунды, например 1:30",
        less: "Меньше", more: "Больше", pin: "Закрепить", unpin: "Открепить", empty: "Пока ничего не скопировано. Скопированное появится здесь.",
        delTip: "Удалить эту запись", copyTip: "Щёлкните, чтобы скопировать снова, дважды щёлкните, чтобы увидеть больше",
        image: "Изображение", file: "файл", files: "файлов", chars: "символов", cut: "Сохранены только первые 256 КБ этого текста" },
  it: { show: "Mostra voci", showTip: "Deseleziona per sfocare tutte le voci finché il puntatore non ci passa sopra, ad esempio durante una diretta",
        deleteAll: "Elimina tutto", auto: "Svuota le voci tra:", autoTip: "Elimina tutte le voci dopo questo tempo dalla prima",
        min: "min", sec: "s", valueTip: "Clicca per digitare minuti e secondi", typeDelay: "Scrivi i minuti, o minuti:secondi come 1:30",
        less: "Meno", more: "Più", pin: "Fissa", unpin: "Rimuovi", empty: "Ancora niente di copiato. Ciò che copi compare qui.",
        delTip: "Elimina questa voce", copyTip: "Clicca per copiarla di nuovo, doppio clic per vederne di più",
        image: "Immagine", file: "file", files: "file", chars: "caratteri", cut: "Sono stati tenuti solo i primi 256 KB di questo testo" },
};
let t = TEXTS[pf.lang] || TEXTS.en;
pf.on("lang", () => { t = TEXTS[pf.lang] || TEXTS.en; draw(); });

// This fence's files in the data folder start with OWN: its id and a hyphen, which PecoFence
// reads as files of this fence and deletes with it.
const OWN = pf.fence.id + "-";
const SETTINGS = OWN + "settings.json";
const PINNED = OWN + "pinned.json";

let cfg = { show: true, auto: false, seconds: 600 };
// Newest first: { id, kind (text, files, image), at, pinned, key (to find the same copy again),
// line and preview (what the row and its tooltip show), chars, text or file (a long text's data
// file), truncated (PecoFence cut the text at 256 KB), paths, image (a data file), more (the
// lines a double-click shows) }.
let entries = [];
let nextId = 1;
let deadline = 0; // when the purge empties the list
let ticker = 0; // the second timer while the purge counts down
let ignoreUntil = 0; // the clipboard change the plugin made itself is not a new copy
let ready = false; // the pinned entries are loaded
let typing = false; // the box for the purge delay shows
let hidden = false;
let reading = false;
let readAgain = false;
let shown = "";

const fill = (text, ...values) => text.replace(/\{(\d)\}/g, (_, i) => String(values[i]));
const unpinned = () => entries.filter((e) => !e.pinned);
const oneLine = (s) => s.slice(0, 4000).replace(/\s+/g, " ").trim().slice(0, 300);
const cut = (s) => (s.length > 300 ? s.slice(0, 300) + "…" : s);

// 1 min 30 s, 45 s, 10 min: the purge delay as it is shown.
function delay(total) {
  if (total < 60) return `${total} ${t.sec}`;
  const m = Math.floor(total / 60);
  return total % 60 ? `${m} ${t.min} ${total % 60} ${t.sec}` : `${m} ${t.min}`;
}

function saveSettings() {
  pf.data.write(SETTINGS, JSON.stringify(cfg)).catch(() => {});
}

// The pinned entries, written down to be there at the next start.
function savePinned() {
  const keep = entries.filter((e) => e.pinned).map(({ more, ...e }) => e);
  const done = keep.length ? pf.data.write(PINNED, JSON.stringify(keep)) : pf.data.remove(PINNED);
  done.catch(() => {});
}

const filesOf = (list) => list.flatMap((e) => [e.file, e.image]).filter(Boolean);

// Removes data files one at a time: PecoFence takes at most 16 calls of a plugin at once.
const toRemove = [];
let removing = false;
async function drop(names) {
  toRemove.push(...names);
  if (removing) return;
  removing = true;
  try {
    while (toRemove.length) await pf.data.remove(toRemove.shift()).catch(() => {});
  } catch (err) {
    // Too many calls at once: the rest goes with the next removal.
  } finally {
    removing = false;
  }
}

function remove(e) {
  entries = entries.filter((x) => x !== e);
  drop(filesOf([e]));
  if (e.pinned) savePinned();
  if (!unpinned().length) deadline = 0;
}

// Everything but the pinned entries.
function clear() {
  drop(filesOf(unpinned()));
  entries = entries.filter((e) => e.pinned);
  deadline = 0;
}

function startPurge() {
  if (cfg.auto && !deadline && unpinned().length) deadline = pf.time.now() + cfg.seconds * 1000;
}

// The entry of the same copy: the key (a text's length, head and tail) finds the candidates, the
// whole text decides.
async function sameEntry(found) {
  for (const e of entries.filter((x) => found.key && x.key === found.key)) {
    if (found.kind !== "text") return e;
    const text = e.text ?? (await pf.data.read(e.file).catch(() => null));
    if (text === found.text) return e;
  }
  return null;
}

// What was copied comes in as an entry; copied again, an entry goes back to the top (a pinned
// one stays where it is). Pictures are always new entries: the plugin does not see their bytes.
async function add(found) {
  const same = await sameEntry(found);
  // An entry deleted or purged while its text was read is not put back: the copy comes in new.
  if (same && entries.includes(same)) {
    if (!same.pinned) {
      entries = [same, ...entries.filter((e) => e !== same)];
      same.at = pf.time.now();
    }
    return;
  }
  const e = { id: String(nextId++), at: pf.time.now(), pinned: false, ...found };
  if (e.kind === "text") {
    e.line = oneLine(e.text);
    e.preview = cut(e.text);
    e.chars = e.text.length;
    if (e.text.length > KEEP_TEXT) {
      e.file = OWN + e.id + ".txt";
      await pf.data.write(e.file, e.text);
      delete e.text;
    }
  } else if (e.kind === "files") {
    e.line = oneLine(e.paths.slice(0, 20).join("; "));
    e.preview = cut(e.paths.slice(0, 20).join("\n"));
  }
  entries.unshift(e);
  while (unpinned().length > MAX_ENTRIES) remove(unpinned().pop());
  startPurge();
}

// Reads the clipboard after it changed: a text first, then a list of files, then a picture.
async function readClipboard() {
  if (reading) return (readAgain = true);
  reading = true;
  try {
    const text = await pf.clipboard.text();
    const s = text ? text.text : "";
    if (s.trim()) {
      const truncated = Boolean(text.truncated);
      await add({ kind: "text", text: s, truncated, key: `t${truncated ? "cut" : ""}${s.length}:${s.slice(0, 1000)}${s.slice(-1000)}` });
    } else {
      const files = await pf.clipboard.files();
      if (files && files.length) {
        await add({ kind: "files", paths: files, key: "f" + files.join("\n") });
      } else {
        const image = await pf.clipboard.image(OWN + nextId + ".png");
        if (image) await add({ kind: "image", image });
      }
    }
  } catch (err) {
    // The clipboard was busy or the picture too large: this copy is not kept.
  } finally {
    reading = false;
  }
  // update(): the first entry may have started the purge, whose countdown needs its timer.
  update();
  if (readAgain) {
    readAgain = false;
    readClipboard();
  }
}

// Puts an entry back on the clipboard; the change that makes is not read as a new copy.
async function copy(e) {
  ignoreUntil = pf.time.now() + 2000;
  try {
    if (e.kind === "text") await pf.clipboard.setText(e.text ?? (await pf.data.read(e.file)) ?? "");
    else if (e.kind === "files") await pf.clipboard.setFiles(e.paths);
    else await pf.clipboard.setImage(e.image);
  } catch (err) {
    ignoreUntil = 0;
  }
}

// A double-click shows more of an entry under it (a bigger picture), the next one less.
async function more(e) {
  if (e.more) {
    delete e.more;
  } else if (e.kind === "image") {
    e.more = [];
  } else {
    const all = e.kind === "files" ? e.paths : (e.text ?? (await pf.data.read(e.file)) ?? "").split(/\r?\n/);
    e.more = all.slice(0, MORE_LINES).map((l) => l.slice(0, 300));
    if (all.length > MORE_LINES) e.more.push("…");
  }
  draw();
}

function entryRows(e) {
  const blur = !cfg.show;
  const when = pf.time.format(e.at, "time");
  const n = e.paths ? e.paths.length : 0;
  const label = e.kind === "image" ? t.image : n ? `${n} ${n === 1 ? t.file : t.files}` : `${e.chars} ${t.chars}`;
  // A blurred entry's tooltip names what it is and not what it says. A text PecoFence cut is
  // orange and its tooltip says so first.
  const cut = e.truncated ? `${t.cut}\n` : "";
  const tip = cut + (blur || e.kind === "image" ? `${label}\n${when}\n${t.copyTip}` : `${e.preview}\n\n${when}\n${t.copyTip}`);
  const content = e.kind === "image"
    ? { id: "copy:" + e.id, image: e.image, height: e.more ? BIG_HEIGHT : IMAGE_HEIGHT, fill: true, blur, tip }
    : { id: "copy:" + e.id, text: e.line, fill: true, blur, tip, ...(e.truncated && { color: "orange" }) };
  const rows = [{ cells: [
    content,
    { id: "del:" + e.id, icon: ICON.trash, tip: t.delTip },
    { id: "pin:" + e.id, icon: ICON.pin, under: true, checked: e.pinned, tip: e.pinned ? t.unpin : t.pin },
  ] }];
  for (const line of e.more || []) rows.push({ text: line, size: "small", color: "gray", blur });
  return rows;
}

function rows() {
  const purge = [
    { id: "auto", check: cfg.auto, text: t.auto, tip: t.autoTip },
    { id: "less", icon: ICON.less, tip: t.less },
    { id: "value", text: delay(cfg.seconds), width: 84, align: "center", tip: t.valueTip },
    { id: "more", icon: ICON.more, tip: t.more },
  ];
  if (deadline) {
    // minutes:seconds left, counting down
    const left = Math.max(0, Math.ceil((deadline - pf.time.now()) / 1000));
    const two = (n) => String(n).padStart(2, "0");
    purge.push({ text: `${two(Math.floor(left / 60))}:${two(left % 60)}`, color: "gray", width: 40 });
  }
  // Delete all beside Show entries: the purge's row keeps < delay > together in a 400 px fence.
  const out = [{ cells: [{ id: "show", check: cfg.show, text: t.show, tip: t.showTip }, { id: "all", text: t.deleteAll }] }, { cells: purge }];
  if (typing) out.push({ input: { id: "delay", type: "line", value: "", placeholder: t.typeDelay } });
  out.push({ separator: true });
  // What is above stays in place; the entries scroll under it. Pinned ones first, a line, then
  // the others.
  const list = [];
  if (ready && !entries.length) list.push({ text: t.empty, color: "gray" });
  const pinned = entries.filter((e) => e.pinned);
  for (const e of pinned) list.push(...entryRows(e));
  if (pinned.length && pinned.length < entries.length) list.push({ separator: true });
  for (const e of unpinned()) list.push(...entryRows(e));
  if (list.length) list[0].pane = "entries";
  return out.concat(list);
}

// Shows the rows when they changed; while the fence is hidden, at the next show.
function draw() {
  if (hidden) return;
  const view = { rows: rows() };
  const json = JSON.stringify(view);
  if (json !== shown) {
    shown = json;
    pf.show(view);
  }
}

// Once a second while the purge counts down: the seconds left, and the purge when they are up.
function tick() {
  if (deadline && pf.time.now() >= deadline) clear();
  if (!deadline) {
    pf.cancel(ticker);
    ticker = 0;
  }
  draw();
}

function update() {
  if (deadline && !ticker) ticker = pf.every(1, tick, { align: "second" });
  draw();
}

function setDelay(seconds) {
  cfg.seconds = Math.max(1, Math.min(86400, Math.round(seconds)));
  if (deadline) deadline = pf.time.now() + cfg.seconds * 1000;
  saveSettings();
}

// The boxes' state and the pinned entries of the last run; files of entries that were not
// pinned are removed.
async function load() {
  try {
    const saved = JSON.parse((await pf.data.read(SETTINGS)) || "{}");
    cfg = { ...cfg, ...saved };
    const pinned = JSON.parse((await pf.data.read(PINNED)) || "[]");
    entries = pinned.map((e) => ({ ...e, pinned: true }));
    nextId = 1 + Math.max(0, ...entries.map((e) => Number(e.id) || 0));
    // Done before the first copy comes in, which may take the number of a file removed here.
    const keep = new Set([SETTINGS, PINNED, ...entries.flatMap((e) => [e.file, e.image])]);
    const old = (await pf.data.list()).filter((name) => name.startsWith(OWN) && !keep.has(name));
    await drop(old);
  } catch (err) {
    // A file that does not read: the history starts empty.
  }
  ready = true;
  draw();
}

pf.on("start", () => {
  draw();
  load();
});
pf.on("clipboard", () => {
  if (pf.time.now() < ignoreUntil) ignoreUntil = 0;
  else if (ready) readClipboard();
});
pf.on("hide", () => (hidden = true));
pf.on("show", () => {
  hidden = false;
  draw();
});
// The files of entries that were not pinned go when PecoFence quits or the plugin stops. The
// plugin ends right after this handler, so no answer comes back to wait for: the removals are
// sent at once, as many as PecoFence takes (16 calls under way). What is left goes with the
// fence when it was deleted (PecoFence deletes the files named after it), or at the next start.
pf.on("stop", () => {
  try {
    for (const name of filesOf(unpinned())) pf.data.remove(name).catch(() => {});
  } catch (err) {
    // Past 16 calls: the rest goes as said above.
  }
});

pf.on("change", (e) => {
  if (e.id === "show") {
    cfg.show = e.value;
    saveSettings();
  }
  if (e.id === "auto") {
    cfg.auto = e.value;
    deadline = 0;
    startPurge();
    saveSettings();
  }
  update();
});

pf.on("click", (c) => {
  const [what, id] = c.id.split(":");
  const e = entries.find((x) => x.id === id);
  if (what === "all") clear();
  if (what === "less" || what === "more") {
    const i = STEPS.findIndex((s) => s > cfg.seconds);
    const next = what === "more" ? STEPS[i] : [...STEPS].reverse().find((s) => s < cfg.seconds);
    if (next) setDelay(next);
  }
  if (what === "value") typing = !typing;
  if (what === "del" && e) remove(e);
  if (what === "copy" && e) copy(e);
  if (what === "pin" && e) {
    e.pinned = !e.pinned;
    savePinned();
    if (!unpinned().length) deadline = 0;
    startPurge();
  }
  update();
});

pf.on("dblclick", (c) => {
  const [what, id] = c.id.split(":");
  const e = entries.find((x) => x.id === id);
  if (what === "copy" && e) more(e);
});

// The purge delay typed in its box: minutes, or minutes:seconds.
pf.on("text", (e) => {
  const m = /^\s*(\d+)\s*(?::\s*(\d{1,2}))?\s*$/.exec(e.text || "");
  if (e.id === "delay" && m) {
    setDelay(Number(m[1]) * 60 + Number(m[2] || 0));
    typing = false;
  }
  update();
});
