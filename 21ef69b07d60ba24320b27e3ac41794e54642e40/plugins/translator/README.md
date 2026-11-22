# Translator

Two boxes: type or paste the text in the top one, pick the languages above it (the source language
can be *Auto-detect*), then click *Translate* or press Ctrl+Enter. The translation shows in the
bottom box; *Copy* puts it on the clipboard. The last line tells which engine did the work and how
much of its free quota is used:

`Engine: DeepL | 2,427/500,000 | Switch engine`

*Switch engine* moves to the next engine you can use. The numbers are the characters this plugin
translated in the current period (a day for MyMemory and Gemini, a month for the others). For
DeepL the plugin reads the real count from DeepL's own usage counter after each translation.

## Engines, in the order they are tried

| Engine | Needs | Free quota the plugin respects |
|---|---|---|
| DeepL | free key ([DeepL API Free](https://www.deepl.com/pro-api)) | 500,000 characters a month |
| Microsoft Translator | key of the free plan F0 ([Azure](https://azure.microsoft.com/products/ai-services/ai-translator)) | 2,000,000 characters a month |
| Google Cloud Translation | key, with a billing account ([Google Cloud](https://cloud.google.com/translate/docs/setup)) | 500,000 characters a month |
| Gemini | free key from [Google AI Studio](https://aistudio.google.com/apikey) | Google's own limits (the plugin only counts characters) |
| MyMemory | **nothing, no sign-up** | 5,000 characters a day (50,000 with the optional e-mail in the settings) |

Keys are typed by the user in the plugin settings (fence menu, *Plugin settings*) and saved
encrypted by PecoFence; the plugin has no key of its own. Without any key the plugin works with
MyMemory alone.

When an engine says its quota is used up, asks to wait, or has not enough quota left for the text,
the plugin goes on to the next one and says which one did the translation. The plugin stops using an
engine once the free quota it knows is reached, so it never goes into a paid quota on its own. When
every engine is used up, the fence says so and links to the places where a free key is made.

## What is sent, and where

Only when you translate (never in the background), the text of the top box, the two language codes
and, for the engines you set up, your key, go to the host of the engine that is asked:

- `api.mymemory.translated.net`: MyMemory. The text goes in pieces of at most 450 bytes, one
  paragraph piece per request, as its terms ask. If you typed an e-mail in the settings, it is sent
  too (MyMemory's `de` parameter, which raises the free limit).
- `api-free.deepl.com` or `api.deepl.com` (a key that does not end in `:fx`): DeepL, with its
  usage counter.
- `api.cognitive.microsofttranslator.com`: Microsoft Translator.
- `translation.googleapis.com`: Google Cloud Translation.
- `generativelanguage.googleapis.com`: Gemini (the model name is a setting).

Nothing else is sent. Translated text, the languages chosen and the counters stay on this computer
(the plugin's data files). The *Copy* button writes the translation to the clipboard
(`clipboard: write`); the plugin never reads it. The links at the bottom of the fence open in the
browser only when you click them.

## Notes

- A translation is at most 5,000 characters.
- MyMemory is a translation memory: its quality varies, and it asks for no more than one paragraph
  at a time, so a long text takes one request per paragraph (at most 40 for one translation).
- Gemini is a language model: it follows the instruction to answer with the translation only, but
  its answer can differ from a dedicated translation engine.
- The services' terms apply to the keys you use. No key is in the plugin's code.

---

## En français

Deux zones : tapez ou collez le texte dans celle du haut, choisissez les langues au-dessus (la
langue source peut être *Détection auto*), puis cliquez sur *Traduire* ou appuyez sur Ctrl+Entrée.
La traduction s'affiche dans la zone du bas. La dernière ligne indique le moteur utilisé et la part
de son quota gratuit déjà consommée, par exemple `Moteur : DeepL | 2 427/500 000 | Changer de moteur`.

Sans aucune clé, le plugin fonctionne avec MyMemory (sans inscription, 5 000 caractères par jour).
Avec des clés gratuites saisies dans les réglages du plugin (DeepL, Microsoft Translator, Google
Cloud Translation, Gemini), il passe de l'un à l'autre quand un quota est épuisé, puis affiche où
obtenir une clé quand plus aucun moteur n'est disponible. Le texte n'est envoyé qu'au moment de la
traduction, uniquement au service interrogé ; aucune clé n'est dans le code.
