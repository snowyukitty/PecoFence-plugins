# PC status 电脑状态

What your computer is doing, updated every 2 seconds:

- CPU load and memory in use, in green, orange or red as they rise.
- The computer's IPv4 address on the network it is connected to (the adapter that is up and has a
  default gateway). A click copies it to the clipboard. It is looked up again every 30 seconds, so
  a new Wi-Fi network shows soon.
- *Open Task Manager*: a click opens Windows' Task Manager.
- The free space of each local drive, with a bar of how full it is; red under 10 % free. The
  drives come last, so a short fence cuts them first.

The plugin stops looking while its fence is rolled up or hidden.

Permissions: `clipboard: write`, only to put the IP address on the clipboard when you click it.
It never reads the clipboard. Sends nothing over the network: all values stay on this computer.

---

每 2 秒更新一次电脑的状态：CPU 和内存的占用（越高颜色从绿变橙、变红），本机在网络里的 IPv4 地址（点一下复制，
每 30 秒重新查一次），「打开任务管理器」，以及每个本地磁盘的剩余空间和一个显示用了多少的进度条（剩余不到 10% 时变红）。
栅栏收起或隐藏时不查。权限：只写剪贴板，用来在你点一下时复制 IP 地址，不读剪贴板。不联网，所有数值都留在这台电脑上。
