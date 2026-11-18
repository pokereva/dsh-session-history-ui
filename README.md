# 会话历史与分支（dsh-session-history-ui）

在 DeepSeek Harness 右侧栏里查看当前会话的聊天记录、一键跳转，并浏览所有会话之间的分支关系。

## 功能

- **历史记录**：按轮次列出当前会话的用户消息与 AI 回复摘要。点击任意一条，会话窗口会跳到对应位置；如果该轮次尚未加载，会先通过 `session.loadThrough(seq)` 把历史翻到目标轮次，再滚动定位。
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
