// Notes: the fence is a note. PecoFence edits the text in place, keeps it with the fence (in its
// configuration, so backups, export and snapshots carry it) and draws "[ ]" lines as to-dos that
// can be ticked without opening the editor. The plugin only says where the note goes.

function draw() {
  pf.show({ rows: [{ input: { id: "note", type: "note" } }] });
}

pf.on("start", draw);
