# Emoji Picker

Every emoji your Windows can draw, in a fence: search them, browse them by category, keep the ones
you use. Click an emoji to copy it to the clipboard, then paste it where you want it.

- **Search** by name and keyword in the language PecoFence is set to (and in English), or by Unicode
  number (`1F600` or `U+1F600`). Enter copies the first result, Esc clears the search.
- **Size slider**: draws the emojis larger or smaller. How many fit in the fence follows its size.
- **Categories**: smileys, people, animals, food, travel, activities, objects, symbols.
- **Recent / Favorites** (the clock button): the last 60 emojis you copied, and your favorites. Click
  an emoji, then *Add to favorites*. *Clear* empties the list you are looking at (click it twice).
- **Skin tone**: choose one in the plugin's settings for the emojis that have it.

The plugin does not bring emoji pictures of its own. It draws each emoji with the system's emoji font
(Segoe UI Emoji), and shows only the emojis that font really draws: after a Windows update that
adds emojis, they appear by themselves. The list of emojis, with their English names, is Unicode's
`emoji-test.txt` (Emoji 18.0) and the CLDR annotations (Unicode License v3), in `emoji-data.js`.
Windows draws flags as two letters, so the flags are not in the list.

**Network.** The names and keywords in your language are the CLDR annotations (version 49.0.0) of
that language, one file of about 0.5 MB. The plugin asks `cdn.jsdelivr.net` for it (a plain
download, `cldr-annotations-full` on npm) the first time the fence runs in that language, keeps what
it needs in its data files, and does not ask again. It sends nothing about you. Without the network,
the search still works in English.

Recent emojis and favorites, and which emojis the system draws, are kept in the plugin's data
files on this computer; each fence keeps its own size and category. The only other permission is
writing to the clipboard (what you click).
