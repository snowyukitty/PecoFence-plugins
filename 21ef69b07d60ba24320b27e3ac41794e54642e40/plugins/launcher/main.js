// Launcher: the programs, files and folders the user put into this fence; a click opens one.
// It knows each item by its id, name and picture only: PecoFence keeps the paths and opens them
// as a fence icon opens.
"use strict";
const T = {
  en: ["Add a program…", "Add a file…", "Drop programs, files or folders here, or right-click this fence to add one.", "Add a folder…"],
  "zh-CN": ["添加程序…", "添加文件…", "把程序、文件或文件夹拖到这里，或者右键这个栅栏来添加。", "添加文件夹…"],
  "zh-TW": ["新增程式…", "新增檔案…", "把程式、檔案或資料夾拖到這裡，或在這個圍欄上按右鍵來新增。", "新增資料夾…"],
  ja: ["プログラムを追加…", "ファイルを追加…", "プログラム、ファイル、フォルダーをここにドロップするか、このフェンスを右クリックして追加します。", "フォルダーを追加…"],
  ko: ["프로그램 추가…", "파일 추가…", "프로그램, 파일, 폴더를 여기에 끌어 놓거나 이 펜스를 마우스 오른쪽 단추로 클릭해 추가하세요.", "폴더 추가…"],
  de: ["Programm hinzufügen…", "Datei hinzufügen…", "Ziehen Sie Programme, Dateien oder Ordner hierher, oder fügen Sie sie per Rechtsklick auf diesen Bereich hinzu.", "Ordner hinzufügen…"],
  fr: ["Ajouter un programme…", "Ajouter un fichier…", "Déposez ici des programmes, fichiers ou dossiers, ou faites un clic droit sur ce groupe pour en ajouter.", "Ajouter un dossier…"],
  es: ["Añadir un programa…", "Añadir un archivo…", "Suelta aquí programas, archivos o carpetas, o haz clic derecho en este grupo para añadirlos.", "Añadir una carpeta…"],
  "pt-BR": ["Adicionar um programa…", "Adicionar um arquivo…", "Solte aqui programas, arquivos ou pastas, ou clique com o botão direito neste grupo para adicionar.", "Adicionar uma pasta…"],
  ru: ["Добавить программу…", "Добавить файл…", "Перетащите сюда программы, файлы или папки или щёлкните эту область правой кнопкой мыши, чтобы добавить.", "Добавить папку…"],
  it: ["Aggiungi un programma…", "Aggiungi un file…", "Trascina qui programmi, file o cartelle, oppure fai clic destro su questo riquadro per aggiungerli.", "Aggiungi una cartella…"],
};
const texts = () => T[pf.lang] || T[pf.lang.split("-")[0]] || T.en;
let t = texts();
// Segoe Fluent Icons: a page, for an item whose picture is not ready yet.
const FILE = String.fromCharCode(0xe8a5);
let items = [];
let last = { id: "", at: 0 };

function draw() {
  const rows = items.map((it) => ({
    cells: [
      it.icon ? { id: it.id, image: it.icon, width: 20, height: 20 } : { id: it.id, icon: FILE },
      { id: it.id, text: it.name, fill: true },
    ],
  }));
  if (!rows.length) rows.push({ text: t[2] });
  pf.show({ rows, menu: [{ id: "program", title: t[0] }, { id: "file", title: t[1] }, { id: "folder", title: t[3] }] });
}

async function load() {
  items = await pf.launch.list();
  draw();
}

pf.on("start", load);
// The interface language changed: the texts and the menu again.
pf.on("lang", () => { t = texts(); draw(); });
// An item removed in the plugin's details, or the picture of a new one is ready.
pf.on("settings", load);
pf.on("command", async (c) => {
  // `show` comes from its shortcut: PecoFence has shown the fence already.
  if (["program", "file", "folder"].includes(c.id) && (await pf.launch.pick(c.id))) load();
});
pf.on("drop", async (d) => {
  // All of the drop in one call, while it is handled: pf.launch.add works only here.
  await pf.launch.add(d.files.map((_, i) => i)).catch(() => {});
  load();
});
pf.on("click", (c) => {
  const now = pf.time.now();
  // The second click of a double-click opens nothing more.
  if (c.id === last.id && now - last.at < 600) return;
  last = { id: c.id, at: now };
  pf.launch.open(c.id).catch(() => {});
});
