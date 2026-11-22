# Now playing 正在播放

Shows the song or video playing now, as Windows shows it in its media flyout: the title, the
artist, the album, the cover and where it is, with buttons for the previous item, play or pause
and the next one. A line says when Spotify runs. While the fence is rolled up or hidden it reads
nothing.

Permissions: `media: "control"` (sees what plays, may pause and skip, only when you click a
button) and `apps: ["spotify.exe"]` (knows whether Spotify runs, and names it when it is the
one playing). It sends nothing over the network.

---

显示正在播放的歌曲或视频，和 Windows 媒体浮窗里的一样：标题、歌手、专辑、封面和播放到哪里，下面有上一首、播放或暂停、
下一首三个按钮。Spotify 在运行时多显示一行。栅栏收起或隐藏时什么也不读。权限：`media: "control"`（看到正在播放的内容，
只在你点按钮时暂停或切歌）和 `apps: ["spotify.exe"]`（知道 Spotify 是否在运行，正在播放的是它时显示它的名字）。不联网。
