# 会话历史与分支（dsh-session-history-ui）

在 DeepSeek Harness 右侧栏里查看当前会话的聊天记录、一键跳转，并浏览所有会话之间的分支关系。

## 截图

| 历史记录 | 展示分支 |
| --- | --- |
| <img src="https://raw.githubusercontent.com/pokereva/dsh-session-history-ui/main/assets/screenshot-history.png" width="380" alt="历史记录：轮次列表、过滤条件、已过滤计数与通配符说明" /> | <img src="https://raw.githubusercontent.com/pokereva/dsh-session-history-ui/main/assets/screenshot-branches.png" width="380" alt="展示分支：分支树、置顶、运行/完成状态、推断关系与已归档会话" /> |

> 截图使用示例会话数据渲染（面板与线上一致），不包含任何真实聊天内容。

## 功能

- **历史记录**：按轮次列出当前会话的用户消息与 AI 回复摘要。点击任意一条，会话窗口会跳到对应位置，并让该轮的用户提示词贴着聊天区顶部（距顶部 16px）；如果该轮次尚未加载，会先通过 `session.loadThrough(seq)` 把历史翻到目标轮次，再滚动定位。定位后用户提示词气泡会闪一下淡蓝底光，提示「就是这里」。
- **当前轮次高亮**：主聊天窗口滚动到哪一轮，历史记录里对应的那一条就会出现 2px 蓝色描边和淡蓝色底，方便知道自己现在看的是哪段对话。判定方式是读取聊天 DOM 里可见的 `[data-chat-turn]` 行（以 `[data-conversation-scroll]` 的视口为准），滚动时按帧节流更新。描边颜色取主题的 `--dsw-alias-state-business-primary`（DSH 暗色主题里的品牌蓝），而不是 `--dsw-alias-brand-primary`（它在暗色主题下是接近黑色的文字反色）。
- **Ctrl+F 查找**：按 `Ctrl+F`（macOS 为 `⌘F`）会打开右侧栏的「会话历史」并弹出类似浏览器查找栏的检索框：输入关键词后实时显示 `当前/总数`，`↑`/`↓` 切换上下一个匹配（`Enter` 下一个、`Shift+Enter` 上一个），`Esc` 或 `×` 关闭；每次切换匹配会同时把主聊天窗口滚到那一轮。检索框下方有三个范围按钮：**全局**（用户发言 + AI 回复）、**AI**（只搜 AI 回复）、**人类**（只搜用户发言）。命中的文字会在列表里用高亮标出；查找期间会临时显示被过滤器隐藏的轮次，避免搜不到。
- **过滤用户发言**：历史记录上方有一个过滤器输入框。默认过滤 `继续`、`继续任务` 这类任务中断后的接续记录；支持多个条件（用逗号或换行分隔），并支持通配符 `?`（匹配一个字符）与 `*`（匹配任意字符）。过滤只匹配用户的发言，不会因为 AI 回复命中条件而隐藏记录。过滤条件保存在 `localStorage` 的 `dsh.session-history.filters.v1`。输入框下方用小字提示 ``过滤用户发言, 使用英文逗号隔开, 已过滤x条``（x 为当前被过滤掉的条数）与通配符说明。
- **历史记录默认定位到最新**：打开「历史记录」时列表默认滚动到最下面（最新一轮）；如果你手动往上翻，它不会把你拽回来，滚回底部后又会自动跟随新记录。
- **当前会话被归档时切回上一个会话**：插件会记住最近打开过的会话顺序。如果正在打开的会话被归档（DSH 会清空主视图、留下空白页），插件会自动打开上一个仍然存在且未归档的会话，并提示「当前会话已归档，已自动切换到上一个会话」。
- **展示分支**：把当前所有会话（不含子代理会话）以「分支树」的形式列出来：普通会话是根，用「在新对话中分支」产生的会话作为子节点缩进显示，并标注「分支自 …」。点击任意会话可以直接切换过去；在会话上右键会打开与会话列表一致的会话右键菜单（重命名、分叉、复制 Session ID、归档等，由各插件贡献的菜单项也会出现）。未命名（Host 只能显示成工作区目录名或原始会话 ID）的会话不会出现在这里；已归档的会话默认隐藏，见下一条。
- **已归档会话**：分支树最下面有一条横线，横线上有「展示已归档的会话」勾选框，勾选后会在横线下方按最近更新顺序列出已归档的会话，标题置灰并带「已归档」标记。左键点击已归档会话不做任何操作（DSH 会主动关闭已归档会话的主视图，直接跳转只会得到空白页面）；在归档行上右键选择「取消归档」后，插件会在取消归档落地后自动打开该会话，并弹出「已取消归档并打开会话」提示。勾选状态保存在 `localStorage` 的 `dsh.session-history.showArchived.v1`。
- **面板内置顶**：在「展示分支」里右键会话选择「置顶会话」，只会把会话置顶在这个面板里（置顶的会话排在列表最上面，并显示「置顶」标记），不会影响左侧工作区列表的置顶；选中「取消置顶」即可恢复。置顶记录保存在 `localStorage` 的 `dsh.session-history.pinned.v1`。
- **拖动调整顺序**：「展示分支」里的会话可以直接拖动排序，顺序保存在 `localStorage` 的 `dsh.session-history.order.v1`；置顶的会话始终固定在最上面，不能和非置顶会话互相拖动。拖动经过某一行时，会像左侧工作区一样在行的上沿或下沿显示一条蓝色横线，表示松手后的插入位置。
- **运行 / 完成提醒**：与左侧工作区一致，正在输出的会话显示蓝色圆点，AI 输出完成但还没查看的会话显示绿色圆点并把标题显示为黄色，提醒你这条会话有新的完成结果。
- **自动记录分支**：在任意会话（主会话或分支会话）中点击「在新对话中分支」时，插件会记录父子关系（`childId`、`parentId`、分叉点 `atSeq`、时间）。记录保存在 `localStorage` 的 `dsh.session-history.branches.v1`。
- **删除同步**：会话被删除后，它会从「展示分支」列表中消失；对应的分支记录也会在会话列表就绪后被自动清理。
- **历史分支推断**：插件安装前产生的分支，DSH 普通分支并不会持久化父会话（`parentSession` 只写给子代理会话），所以没有可直接复用的记录。插件会做两种尽力而为的还原：优先使用 Host 仍在返回的 `parentSessionId`；否则如果会话标题符合 DSH 的分支命名 `<父标题> (n)`，就把它挂到标题为父标题的现存会话下。推断出来的关系会标注「（推断）」，标题被改过或父会话已删除时可能推断不到。

## 使用

1. 打开任意会话的右侧栏（右上角的侧栏按钮），在工具页签里找到「会话历史」入口，点击打开。
2. 面板顶部有两个按钮：**历史记录** / **展示分支**，用于切换两种视图。
3. 在聊天窗口的某条 AI 消息上使用「在新对话中分支」，随后打开「展示分支」即可看到新的分支。

## 实现说明

- 纯客户端插件：`index.js` 是空的 Host 端（`export function apply() {}`），全部逻辑在 `client.js`。
- 通过 `ctx.sidebarRightTabs.register` + `ctx.slots.register({ name: 'sidebar.right.pane.tab' })` 注册右侧栏页签。
- 历史记录来自 Host 的 `turnOutline` 投影（由 `@deepseek-ai/dsh-session-turn-outline` 提供），无需在客户端折叠事件。
- 分支关系在客户端包装 `ctx.sessions.fork` 记录；DSH 的普通 fork 不持久化父会话信息，因此只能在这一层记录。
- 「展示分支」的置顶是面板本地状态：打开菜单时记录来源会话，随后临时屏蔽 `ctx.remoteAccess.source` 里 `workspace/pinSession`、`workspace/unpinSession` 两个端点的数据（让内置的「置顶会话」项不出现），并注册本插件的 `session.historyPin` 菜单项写入本地置顶；`ctx.workspaces.pinSession/unpinSession` 也做了同样的兜底重定向，左侧工作区不受影响。
- 历史分支推断在 `buildBranchRows` 里完成：没有本地分支记录的会话先看 `summary.parentSessionId`（Host 有时仍会返回），再按标题正则 `/^(.+?)\s*[\(（]\d+[\)）]$/` 推导父标题并匹配现存会话；推断的父子关系在下钻时带环检测，根节点顺序仍按置顶/拖拽顺序/`updatedAt` 排序。
- 已归档会话的左键点击被忽略：ui-workspace 的 `watchNavigation` 在 `archivedSessionIds` 包含当前主视图会话时会 `clearMain()`，直接打开只会得到空白主视图。右键本面板的归档行会留下一个「待打开意图」（10 秒有效）；插件订阅 `ctx.workspaces.list`，一旦该会话从 `archivedSessionIds` 中消失（说明共享菜单里的「取消归档」动作已生效），就 `ctx.uiWorkspace.openSession(sessionId)` 并提示成功。这样不依赖拦截 ui-workspace 的服务调用，任何取消归档路径都能兜住。注意共享菜单会在执行菜单项之前先把 `contextMenus.active` 置空，因此面板标记采用「到期时间」而不是「active 变 null 立即清除」。
- 已归档会话走单独的 `buildArchivedRows`：只取存在于 `ctx.workspaces.list` 的 `archivedSessionIds` 里、且有真实标题的非子代理会话，按 `updatedAt` 倒序平铺在分支树下方；归档行不参与置顶、拖拽和分支树父子关系。
- 拖动顺序通过 HTML5 拖拽实现，落位后把当前展示顺序写回 `dsh.session-history.order.v1`；拖动时的蓝色插入线用 `::before` / `::after` 绘制，颜色取主题变量 `--dsw-alias-state-business-primary`，按指针落在行的上半/下半决定插入在目标行之前还是之后。
- 运行 / 完成状态来自 `ctx.uiSession.sessionStatus`（`completionUnread` / `running`）：完成的标题使用 `--dsw-alias-state-warn-label`，圆点分别使用活动蓝与完成绿，与左侧工作区的状态语言保持一致。
- 「上一个会话」的兜底订阅了 `ctx.sessions.list`：从 `retainedBy.mainView` 读出当前主视图会话，维护最近 20 个主视图会话栈；当主视图会话被归档、主视图被清空时，从栈里取最近一个仍然存在且未归档的会话 `openSession` 打开。除了归档场景外不会触发，正常的会话切换不受影响。
- 历史记录的自动滚底用一个 ref 记录是否「贴底」（距离底部小于 24px），在投影轮次数、过滤条件或会话变化后，如果仍然贴底就把 `scrollTop` 设到 `scrollHeight`；用户主动上翻后不再自动跟随。
- 当前轮次高亮监听文档捕获阶段的 `scroll` 事件并对 `requestAnimationFrame` 节流，按 `[data-chat-turn]` 行相对滚动容器的位置挑出视口顶部那一轮；因此不需要 Chat 视图暴露额外 API。
- 点击跳转的定位步骤：先找到该轮 `data-chat-flow-kind="user"` 的那一行（即人类提示词），用 `scrollTop = scrollTop + (rowTop - viewportTop) - 16` 直接赋值实现瞬时对齐（聊天区在隐藏/离屏时浏览器的平滑滚动会被丢弃，直接赋值更可靠），随后给这行里真正画出背景的气泡元素（优先 `[data-message-bubble]`，否则取行内背景色不透明、面积最大的后代）盖一个 2.2s 的蓝色光晕覆盖层（`position: fixed` 的 `.dsh-sh-flashLayer`，蓝色描边 + 外发光 + 渐隐）。用覆盖层而不是给气泡加 class，是因为聊天区是 React 树，外部加的 class 可能在下一次重渲染时被丢掉，用户根本来不及看到；覆盖层每帧用气泡的 `getBoundingClientRect()` 重新定位，并按聊天滚动容器的可视区域裁剪，所以滚动时会跟着气泡走，气泡滚出视口后就自动隐藏，不会悬空。
- Ctrl+F 快捷键在 `apply` 里通过 `ctx.effect` 注册文档捕获阶段 `keydown`（`ctrlKey || metaKey` + `f`），调用 `ctx.sidebarRight.openTab('session-history')` 打开页签，再通过一个模块级的 `finderHooks` 集合通知已挂载的面板打开检索框（页签可能刚打开，因此带最多 30 次、间隔 80ms 的重试）。检索范围只影响命中集合，不影响过滤器的保存值。

## 安装

从 npm 安装（推荐）：

```bash
dsh plugin add dsh-session-history-ui
```

或在 DSH 的「插件」页里选择「添加插件」，填入包名 `dsh-session-history-ui`、本仓库地址，或本地目录路径。安装后重启 / 刷新 DSH，右侧栏的「更多工具」里会出现「会话历史」入口。

## 开发

```bash
npm run check   # node --check client.js && node --check index.js
```

本地调试安装：在 DSH 的「插件」页里对本仓库目录使用插件安装流程（bundle patch 会以 `dsh-session-history-ui` 注入 `dsh-session-history`）。
