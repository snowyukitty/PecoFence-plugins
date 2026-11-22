# Clipboard history 剪贴板历史

Keeps what you copy, newest first: texts, lists of files (from File Explorer) and pictures. This
plugin is the clipboard history script fence that [xan2622](https://github.com/xan2622) wrote for
PecoFence in pull request #223, rewritten as a plugin.

- **A click on an entry** copies it to the clipboard again. A **double-click** shows more of it:
  the first lines of a text, the files of a list, a picture in a larger size; another
  double-click shows less.
- The **trash button** at the right deletes the entry; the **pin** under it keeps it. Pinned
  entries stay at the top, are kept by *Delete all*, by the purge and when the list is full,
  and come back when PecoFence starts again.
- **Show entries**: untick it and every entry is blurred until the pointer is on it, which keeps
  passwords and the like out of a stream or a screen share.
- **Delete all** deletes every entry that is not pinned.
- **Purge entries in: < 10 min >**: when ticked, every entry that is not pinned is deleted that
  long after the first one came, and the time left counts down beside it. `<` and `>` step
  through the usual delays (5 seconds to 24 hours); a click on the delay opens a box to type
  minutes, or minutes:seconds such as `1:30`.

It keeps the newest 30 entries that are not pinned. A copy of an entry that is already in the
list moves it to the top. PecoFence hands a plugin at most 256 KB of a text: a longer text is cut
there, and its entry is orange with a tooltip that says so. What password managers mark as not
to be kept (the clipboard formats `ExcludeClipboardContentFromMonitorProcessing`, `CanIncludeInClipboardHistory` = 0 and
`Clipboard Viewer Ignore`) PecoFence leaves out, as Windows' own history does.

Permissions:

- `clipboard: readwrite`: reading what you copy is the plugin's purpose; writing puts an entry
  back on the clipboard when you click it.
- `background`: the history keeps listening while the fence is rolled up or hidden.

Nothing leaves this computer, and nothing is sent anywhere. What is kept on its disk, in the
plugin's data folder (`plugins-data\clipboard-history` beside PecoFence's settings):

- Texts over 2,000 characters and pictures, as files, while their entry is in the list. Shorter
  texts and lists of files that are not pinned are only in memory.
- The pinned entries with their texts, file lists and pictures, and the state of the boxes, so
  they come back when PecoFence starts again.

When PecoFence quits, the files of entries that are not pinned are deleted (what is left then is
deleted at the next start). PecoFence keeps no copy of what this fence shows. Each fence keeps its
own history, in files named after the fence: when the fence is deleted, PecoFence deletes them,
pinned entries too, at its next start (undoing the delete keeps them). Uninstalling the plugin
deletes the whole folder.

---

保存你复制过的内容，最新的在上面：文字、文件（从资源管理器复制的）和图片。这个插件来自 xan2622 在 #223 里为
PecoFence 写的剪贴板历史脚本栅栏。点一下条目把它再复制到剪贴板；双击显示更多（文字的前几行、列表里的文件、
大一些的图片），再双击收起。右边的垃圾桶删除这一条，下面的图钉固定它：固定的条目在最上面，「全部删除」、
自动清除和条目满了的时候都保留，下次启动也还在。取消勾选「显示条目」后所有条目都模糊显示，鼠标移上去才看得清，
适合直播或共享屏幕时用。「清除条目，时间：< 10 分钟 >」勾选后，第一条出现后经过这段时间删除所有没固定的条目，
旁边倒数剩下的时间；< 和 > 在常用的时间之间切换，点时间可以直接输入分钟数或「分:秒」。
密码管理器标记为不保留的内容，PecoFence 不会交给插件。超过 256 KB 的文字 PecoFence 只交给插件前 256 KB，
这样的条目显示为橙色，鼠标停留时会说明。所有内容都留在这台电脑上，不联网。写到硬盘上的有：超过 2000 个字符的文字和
图片（条目还在列表里时），固定的条目和各个勾选框的状态（下次启动时恢复）；没固定的较短文字和文件列表只在内存里。
PecoFence 退出时删除没固定的条目的文件，PecoFence 也不保存这个栅栏显示的内容。删除栅栏时，它的文件（包括固定的条目）
一起删除；卸载插件时删除整个文件夹。
