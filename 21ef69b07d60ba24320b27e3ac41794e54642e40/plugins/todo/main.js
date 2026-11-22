// To-do: a list of tasks in this fence. The top row takes a new task (Enter adds it); a click on a
// task ticks it or takes the tick away; tasks that are done go under the others, grey. A task's
// right-click menu deletes it, the fence menu deletes every task that is done. The list is this
// fence's own data file (<fence id>-todo.json), so it goes with the fence and stays on this PC.
"use strict";
const T = {
  en: { add: "Add a task…", empty: "No tasks yet. Click the line above, type, press Enter.", del: "Delete",
        clear: "Delete the tasks that are done", hidden: "{0} done (hidden)", full: "At most {0} tasks: delete some first.",
        bad: "The saved list could not be read; it was kept as {0}." },
  "zh-CN": { add: "添加一件事…", empty: "还没有待办。点上面一行，输入后按 Enter。", del: "删除",
             clear: "删除已完成的事项", hidden: "已完成 {0} 项（已隐藏）", full: "最多 {0} 项，请先删掉一些。",
             bad: "保存的清单读不出来，已另存为 {0}。" },
  "zh-TW": { add: "新增一件事…", empty: "還沒有待辦。點上面一行，輸入後按 Enter。", del: "刪除",
             clear: "刪除已完成的事項", hidden: "已完成 {0} 項（已隱藏）", full: "最多 {0} 項，請先刪掉一些。",
             bad: "儲存的清單讀不出來，已另存為 {0}。" },
  ja: { add: "やることを追加…", empty: "やることはまだありません。上の行をクリックして入力し、Enter を押します。", del: "削除",
        clear: "終わったことを削除", hidden: "終わったこと {0} 件（非表示）", full: "最大 {0} 件です。先にいくつか削除してください。",
        bad: "保存されたリストを読めませんでした。{0} として残しました。" },
  ko: { add: "할 일 추가…", empty: "할 일이 아직 없습니다. 위 줄을 클릭해 입력하고 Enter를 누르세요.", del: "삭제",
        clear: "끝난 일 삭제", hidden: "끝난 일 {0}개 (숨김)", full: "최대 {0}개입니다. 먼저 몇 개를 삭제하세요.",
        bad: "저장된 목록을 읽지 못해 {0}(으)로 남겨 두었습니다." },
  de: { add: "Aufgabe hinzufügen…", empty: "Noch keine Aufgaben. Oben klicken, tippen, Eingabe drücken.", del: "Löschen",
        clear: "Erledigte Aufgaben löschen", hidden: "{0} erledigt (ausgeblendet)", full: "Höchstens {0} Aufgaben: zuerst einige löschen.",
        bad: "Die gespeicherte Liste war nicht lesbar; sie liegt jetzt als {0}." },
  fr: { add: "Ajouter une tâche…", empty: "Pas encore de tâche. Cliquez sur la ligne du haut, tapez, appuyez sur Entrée.", del: "Supprimer",
        clear: "Supprimer les tâches faites", hidden: "{0} faite(s) (masquées)", full: "{0} tâches au plus : supprimez-en d'abord.",
        bad: "La liste enregistrée était illisible ; elle est gardée sous {0}." },
  es: { add: "Añadir una tarea…", empty: "Aún no hay tareas. Haz clic en la línea de arriba, escribe y pulsa Intro.", del: "Eliminar",
        clear: "Eliminar las tareas hechas", hidden: "{0} hecha(s) (ocultas)", full: "Como mucho {0} tareas: elimina algunas antes.",
        bad: "No se pudo leer la lista guardada; se guardó como {0}." },
  "pt-BR": { add: "Adicionar uma tarefa…", empty: "Ainda não há tarefas. Clique na linha de cima, digite e pressione Enter.", del: "Excluir",
             clear: "Excluir as tarefas concluídas", hidden: "{0} concluída(s) (ocultas)", full: "No máximo {0} tarefas: exclua algumas antes.",
             bad: "Não foi possível ler a lista salva; ela foi guardada como {0}." },
  ru: { add: "Добавить дело…", empty: "Дел пока нет. Щёлкните строку выше, впишите дело и нажмите Enter.", del: "Удалить",
        clear: "Удалить сделанные дела", hidden: "Сделано: {0} (скрыто)", full: "Не больше {0} дел: сначала удалите лишние.",
        bad: "Сохранённый список не прочитался; он сохранён как {0}." },
  it: { add: "Aggiungi un'attività…", empty: "Ancora nessuna attività. Fai clic sulla riga in alto, scrivi e premi Invio.", del: "Elimina",
        clear: "Elimina le attività fatte", hidden: "{0} fatte (nascoste)", full: "Al massimo {0} attività: eliminane prima qualcuna.",
        bad: "Non è stato possibile leggere l'elenco salvato; è stato tenuto come {0}." },
};
const texts = () => T[pf.lang] || T[pf.lang.split("-")[0]] || T.en;
let t = texts();
const fill = (text, v) => text.replace("{0}", String(v));
const MAX = 200;
// The list of this fence: { next, items: [{ n, text, done }] } in the order the tasks were added.
const file = () => pf.fence.id + "-todo.json";
let list = { next: 1, items: [] };
let loaded = false;
let note = "";
let shown = "";

function draw() {
  if (!loaded) return;
  const rows = [{ input: { type: "line", id: "add", value: "", placeholder: t.add } }];
  if (note) rows.push({ text: note, color: "orange", size: "small" });
  const open = list.items.filter((i) => !i.done);
  const done = list.items.filter((i) => i.done);
  const row = (i) => ({ id: "i:" + i.n, text: i.text, todo: i.done, color: i.done ? "gray" : undefined,
                        menu: [{ id: "delete", title: t.del }] });
  for (const i of open) rows.push(row(i));
  if (pf.settings.hideDone) {
    if (done.length) rows.push({ text: fill(t.hidden, done.length), color: "gray", size: "small" });
  } else {
    for (const i of done) rows.push(row(i));
  }
  if (!list.items.length) rows.push({ text: t.empty, color: "gray" });
  const view = { rows, menu: [{ id: "clear", title: t.clear, disabled: !done.length }] };
  const json = JSON.stringify(view);
  if (json !== shown) {
    shown = json;
    pf.show(view);
  }
}

// One write after another, each of the whole list, so a quick second change is never lost.
let queue = Promise.resolve();
function save() {
  const text = JSON.stringify(list);
  queue = queue.then(() => pf.data.write(file(), text)).catch(() => {});
}

async function load() {
  const text = await pf.data.read(file()).catch(() => null);
  if (text) {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data.items)) {
        const items = data.items.filter((i) => i && typeof i.text === "string");
        let next = Math.max(Number(data.next) || 1, ...items.map((i) => (Number.isInteger(i.n) ? i.n + 1 : 1)));
        // A task without a number of its own gets a new one, so no two rows share an id.
        list = { next: 0, items: items.map((i) => ({ n: Number.isInteger(i.n) ? i.n : next++, text: i.text, done: i.done === true })) };
        list.next = next;
      }
    } catch (e) {
      // Kept beside it instead of being overwritten by the next change.
      const kept = pf.fence.id + "-todo.bad.json";
      await pf.data.write(kept, text).catch(() => {});
      note = fill(t.bad, kept);
    }
  }
  loaded = true;
  draw();
}

const find = (id) => list.items.find((i) => "i:" + i.n === id);

pf.on("start", load);
pf.on("show", draw);
pf.on("settings", draw);
pf.on("lang", () => { t = texts(); shown = ""; draw(); });
pf.on("text", (e) => {
  if (e.id !== "add") return;
  const text = String(e.text || "").replace(/\s+/g, " ").trim().slice(0, 500);
  if (!text) return;
  if (list.items.length >= MAX) {
    note = fill(t.full, MAX);
  } else {
    note = "";
    list.items.push({ n: list.next++, text, done: false });
    save();
  }
  draw();
});
pf.on("change", (e) => {
  const item = find(e.id);
  if (!item) return;
  item.done = e.value === true;
  save();
  draw();
});
pf.on("command", (c) => {
  if (c.id === "delete" && find(c.row)) {
    list.items = list.items.filter((i) => "i:" + i.n !== c.row);
  } else if (c.id === "clear") {
    list.items = list.items.filter((i) => !i.done);
  } else {
    return;
  }
  note = "";
  save();
  draw();
});
