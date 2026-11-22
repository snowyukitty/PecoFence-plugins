# GitHub activity GitHub 仓库动态

The newest open issues (🟢) and pull requests (🔀) of a GitHub repository, newest first, with
their numbers and titles; the tooltip says who opened each and when. A click on one opens it in
the browser, a click on the repository's name opens the repository, and a click on the last row
asks again.

Set the repository in the fence menu, Plugin settings, as `owner/name` (a pasted
`https://github.com/owner/name` address works too). The default is `DayuanJiang/PecoFence`. Each
fence keeps its own repository.

The plugin does not sign in. GitHub answers 60 requests an hour from one network address without
signing in, so the plugin asks once when the fence first shows and then every 10 minutes while it
shows. When GitHub says to wait (`Retry-After`, or `X-RateLimit-Remaining: 0` with the time the
limit resets), it waits that long, and a click waits too; a refusal without either waits 10
minutes. After you change the repository, it asks 2 seconds later. When the first request fails,
a click on the row that says so asks again.

What is sent: one request to `api.github.com` for the repository's open issues, such as
`https://api.github.com/repos/DayuanJiang/PecoFence/issues?state=open&per_page=8`. Like every
web request it shows GitHub your network address. Links open on `github.com` in your browser.
Nothing else leaves the computer.

---

一个 GitHub 仓库最新的、还没关闭的 issue（🟢）和 PR（🔀），最新的在上面；鼠标停留时显示是谁、哪天提的。
点一行在浏览器里打开它，点仓库名打开仓库，点最后一行重新获取。在栅栏菜单的「插件设置」里把仓库写成 `owner/name`
（也可以直接贴 github.com 的网址），默认是 `DayuanJiang/PecoFence`。不登录：GitHub 对一个网络地址每小时最多回答
60 次，所以插件只在栅栏第一次显示时和之后每 10 分钟（栅栏显示时）问一次；GitHub 要求等待时就等到它说的时间，点击也一样，
没说等多久的拒绝等 10 分钟。改了仓库后 2 秒再问。第一次没拿到时，点说明原因的那一行可以重新获取。
发送的内容：向 `api.github.com` 请求这个仓库未关闭的 issue，链接在浏览器里打开 `github.com`。
