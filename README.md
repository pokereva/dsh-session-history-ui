# 会话历史与分支（@local/dsh-session-history）

在 DeepSeek Harness 右侧栏里查看当前会话的聊天记录、一键跳转，并浏览所有会话之间的分支关系。

## 功能

- **历史记录**：按轮次列出当前会话的用户消息与 AI 回复摘要。点击任意一条，会话窗口会跳到对应位置；如果该轮次尚未加载，会先通过 `session.loadThrough(seq)` 把历史翻到目标轮次，再滚动定位。
- **过滤用户发言**：历史记录上方有一个过滤器输入框。默认过滤 `继续`、`继续任务` 这类任务中断后的接续记录；支持多个条件（用逗号或换行分隔），并支持通配符 `?`（匹配一个字符）与 `*`（匹配任意字符）。过滤只匹配用户的发言，不会因为 AI 回复命中条件而隐藏记录。过滤条件保存在 `localStorage` 的 `dsh.session-history.filters.v1`。输入框下方用小字提示 ``过滤用户发言, 使用英文逗号隔开, 已过滤x条``（x 为当前被过滤掉的条数）与通配符说明。
- **展示分支**：把当前所有会话（不含子代理会话）以「分支树」的形式列出来：普通会话是根，用「在新对话中分支」产生的会话作为子节点缩进显示，并标注「分支自 …」。点击任意会话可以直接切换过去；在会话上右键会打开与会话列表一致的会话右键菜单（重命名、分叉、复制 Session ID、归档等，由各插件贡献的菜单项也会出现）。未命名（Host 只能显示成工作区目录名或原始会话 ID）的会话、以及已归档的会话都不会出现在这里。
- **面板内置顶**：在「展示分支」里右键会话选择「置顶会话」，只会把会话置顶在这个面板里（置顶的会话排在列表最上面，并显示「置顶」标记），不会影响左侧工作区列表的置顶；选中「取消置顶」即可恢复。置顶记录保存在 `localStorage` 的 `dsh.session-history.pinned.v1`。
- **拖动调整顺序**：「展示分支」里的会话可以直接拖动排序，顺序保存在 `localStorage` 的 `dsh.session-history.order.v1`；置顶的会话始终固定在最上面，不能和非置顶会话互相拖动。拖动经过某一行时，会像左侧工作区一样在行的上沿或下沿显示一条蓝色横线，表示松手后的插入位置。
- **运行 / 完成提醒**：与左侧工作区一致，正在输出的会话显示蓝色圆点，AI 输出完成但还没查看的会话显示绿色圆点并把标题显示为黄色，提醒你这条会话有新的完成结果。
- **自动记录分支**：在任意会话（主会话或分支会话）中点击「在新对话中分支」时，插件会记录父子关系（`childId`、`parentId`、分叉点 `atSeq`、时间）。记录保存在 `localStorage` 的 `dsh.session-history.branches.v1`。
- **删除同步**：会话被删除后，它会从「展示分支」列表中消失；对应的分支记录也会在会话列表就绪后被自动清理。

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
- 拖动顺序通过 HTML5 拖拽实现，落位后把当前展示顺序写回 `dsh.session-history.order.v1`；拖动时的蓝色插入线用 `::before` / `::after` 绘制，颜色取主题变量 `--dsw-alias-state-business-primary`，按指针落在行的上半/下半决定插入在目标行之前还是之后。
- 运行 / 完成状态来自 `ctx.uiSession.sessionStatus`（`completionUnread` / `running`）：完成的标题使用 `--dsw-alias-state-warn-label`，圆点分别使用活动蓝与完成绿，与左侧工作区的状态语言保持一致。

## 开发

```bash
npm run check   # node --check client.js && node --check index.js
```

安装：在该目录上使用 DSH 的插件安装流程（bundle patch 会注入 `dsh-session-history`）。
