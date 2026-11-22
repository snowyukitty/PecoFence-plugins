# Ollama

Shows the models of [Ollama](https://ollama.com) that run on this computer, with their size.
Click a model to choose it, write a question in the box and press Ctrl+Enter or *Ask*: the answer
of that model shows below (whole, at most about 200 tokens). The list is read again every minute
and when the fence shows.

- Permission: `local.loopback` port 11434 (Ollama on this computer). It asks Ollama at
  `http://127.0.0.1:11434` for its models (`/api/tags`) and sends the question you typed to the
  model you chose (`/api/generate`). Nothing leaves this computer, and it connects to nothing else.
- When Ollama does not run, the fence says so; start Ollama and click the line.

---

显示这台电脑上运行的 Ollama 里有哪些模型和它们的大小。点一个模型选中它，在框里写问题，按 Ctrl+Enter 或「提问」，
下面就显示这个模型的回答（一次给出，最多约 200 个词元）。每分钟和栅栏显示时重新读一次模型列表。权限：`local.loopback`
的 11434 端口（这台电脑上的 Ollama）。它向 `http://127.0.0.1:11434` 的 Ollama 读取模型列表（`/api/tags`），把你写的问题
发给你选的模型（`/api/generate`）。数据不离开这台电脑，也不连接别的地方。Ollama 没有运行时栅栏里会说明，启动 Ollama 后点
那一行即可。
