# Weather 天气

The weather now (temperature, a short description, how warm it feels, humidity and wind) and the
lowest and highest temperature of today and tomorrow, with tomorrow's chance of rain. The data
comes from [wttr.in](https://wttr.in), a free weather service; the description is in PecoFence's
display language.

Set the city in the fence menu, Plugin settings (in English or in your language, for example
`Tokyo`, `北京` or `New York`). Left empty, wttr.in finds the place from your network address.
Each fence keeps its own city, so two fences can show two cities.

The plugin asks wttr.in when the fence first shows, every 30 minutes after that while the fence
shows, at once when you change the city, and when you click the last row (a click within a
minute of the last request does nothing). When wttr.in does not answer, it tries again in 5
minutes. When wttr.in says to wait (`Retry-After`), nothing asks before then, clicks and a new
city included.

What is sent: one request to `wttr.in` with the city from the setting (nothing when it is empty)
and the display language, such as `https://wttr.in/Tokyo?format=j1&lang=zh-cn`. Like every web
request it shows wttr.in your network address. Nothing else leaves the computer.

---

现在的天气（气温、天气、体感、湿度和风）以及今天和明天的最低、最高气温和明天的降雨概率，数据来自免费的天气服务
wttr.in，天气的说明随 PecoFence 的显示语言。在栅栏菜单的「插件设置」里写城市（英文或中文都可以）；空着时，
wttr.in 按你的网络位置找地方。每个栅栏有自己的城市。栅栏第一次显示时、之后每 30 分钟（栅栏显示时）、改了城市时、
点最后一行时各请求一次（离上一次请求不到一分钟时，点了不会再请求）；没拿到时 5 分钟后再试。wttr.in 要求等待时，
在它说的时间之前不再请求，点击和改城市也一样。发送的内容：向 `wttr.in` 发一个请求，里面只有设置里的城市和显示语言。
