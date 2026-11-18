window.__ModuleLoader__.load({
  id: '@local/dsh-session-history',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const TAB_ID = '@local/dsh-session-history'
    const TAB_KIND = 'session-history'
    const NAMESPACE = 'sessionHistory'
    const RECORDS_KEY = 'dsh.session-history.branches.v1'
    const MODE_KEY = 'dsh.session-history.mode.v1'
    const STYLE_ID = '@local/dsh-session-history/session-history.css'
    const FILTER_KEY = 'dsh.session-history.filters.v1'
    const PIN_KEY = 'dsh.session-history.pinned.v1'
    const ORDER_KEY = 'dsh.session-history.order.v1'
    const SHOW_ARCHIVED_KEY = 'dsh.session-history.showArchived.v1'
    const MAX_RECORDS = 500
    const MAX_PINS = 200
    let panelMenuSessionId = null
    let panelMenuAt = 0

    function markPanelMenu(sessionId) {
      panelMenuSessionId = sessionId
      panelMenuAt = Date.now()
    }

    function isPanelMenuTarget(sessionId) {
      if (panelMenuSessionId === null || panelMenuSessionId !== sessionId) return false
      return Date.now() - panelMenuAt < 120000
    }
    const EMPTY_ARCHIVED = []
    const EMPTY_STATUSES = new Map()
    const DEFAULT_FILTERS = ['继续', '继续任务']

    const zh = {
      title: '会话历史',
      guideDescription: '浏览本会话的聊天记录并跳转到对应位置，也可以切换查看所有会话与它们的分支。',
      tabHistory: '历史记录',
      tabBranches: '展示分支',
      filterPlaceholder: '过滤用户发言（支持 * 与 ?，多项用逗号分隔）',
      filterReset: '重置',
      filterCounted: '已过滤{count}条',
      filterHint: '过滤用户发言, 使用英文逗号隔开',
      filterWildcard: '通配符：? 匹配一个字符，* 匹配任意字符',
      emptyHistory: '本会话还没有生成聊天记录。',
      emptyBranches: '还没有可以展示的会话。',
      branchHint: '在任何会话中点击「在新对话中分支」后，分支会话都会记录在这里。',
      current: '当前',
      untitled: '未命名会话',
      noText: '（无文本）',
      forkedFrom: '分支自',
      inferredSuffix: '（推断）',
      showArchived: '展示已归档的会话',
      emptyArchived: '没有已归档的会话。',
      archivedBadge: '已归档',
      pinSession: '置顶会话',
      unpinSession: '取消置顶',
      pinnedBadge: '置顶',
      jumpFailed: '无法跳转到这条记录',
      openFailed: '无法打开这个会话',
    }

    const en = {
      title: 'Session history',
      guideDescription: "Browse this conversation's turns and jump to any of them, or switch to every conversation with its branches.",
      tabHistory: 'History',
      tabBranches: 'Branches',
      filterPlaceholder: 'Filter user messages (supports * and ?, separate with commas)',
      filterReset: 'Reset',
      filterCounted: '{count} filtered',
      filterHint: 'Filter user messages, separated by English commas',
      filterWildcard: 'Wildcards: ? matches one character, * matches any characters',
      emptyHistory: 'This conversation has no recorded turns yet.',
      emptyBranches: 'There are no conversations to show yet.',
      branchHint: 'Conversations forked in any session with "Branch in new chat" are recorded here.',
      current: 'Current',
      untitled: 'Untitled session',
      noText: '(no text)',
      forkedFrom: 'Forked from',
      inferredSuffix: ' (inferred)',
      showArchived: 'Show archived sessions',
      emptyArchived: 'No archived sessions.',
      archivedBadge: 'Archived',
      pinSession: 'Pin session',
      unpinSession: 'Unpin session',
      pinnedBadge: 'Pinned',
      jumpFailed: 'Could not jump to this turn',
      openFailed: 'Could not open this session',
    }

    const CSS = `
.dsh-sh-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary);
}
.dsh-sh-tabs {
  display: flex;
  flex: 0 0 auto;
  gap: 4px;
  padding: 8px 8px 6px;
  border-bottom: 1px solid var(--dsw-alias-border-l2);
}
.dsh-sh-tab {
  flex: 1 1 0;
  min-width: 0;
  appearance: none;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 1.4;
  padding: 5px 8px;
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease;
}
.dsh-sh-tab:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.dsh-sh-tab:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 1px;
}
.dsh-sh-tabActive,
.dsh-sh-tabActive:hover {
  background: var(--dsw-alias-bg-layer-2);
  border-color: var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-primary);
  font-weight: 600;
}
.dsh-sh-pane {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
}
.dsh-sh-filter {
  display: flex;
  flex: 0 0 auto;
  gap: 6px;
  padding: 6px 8px 0;
}
.dsh-sh-filterInput {
  flex: 1 1 auto;
  min-width: 0;
  height: 26px;
  padding: 0 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: var(--dsw-alias-bg-input, transparent);
  color: inherit;
  font: inherit;
  outline: none;
}
.dsh-sh-filterInput::placeholder {
  color: var(--dsw-alias-label-tertiary);
}
.dsh-sh-filterInput:focus {
  border-color: var(--dsw-alias-brand-primary);
}
.dsh-sh-filterReset {
  flex: 0 0 auto;
  height: 26px;
  padding: 0 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  cursor: pointer;
}
.dsh-sh-filterReset:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.dsh-sh-filterMeta {
  flex: 0 0 auto;
  padding: 4px 10px 0;
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 1.4;
}
.dsh-sh-list {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  gap: 2px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 6px;
}
.dsh-sh-row,
.dsh-sh-session {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 2px;
  appearance: none;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.dsh-sh-row {
  padding: 6px 8px;
}
.dsh-sh-row:hover,
.dsh-sh-session:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.dsh-sh-row:focus-visible,
.dsh-sh-session:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: -2px;
}
.dsh-sh-rowHead {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
}
.dsh-sh-turn {
  flex: 0 0 auto;
  padding-top: 1px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
.dsh-sh-prompt {
  display: -webkit-box;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  font-weight: 500;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.dsh-sh-response {
  overflow: hidden;
  padding-left: 22px;
  color: var(--dsw-alias-label-tertiary);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-sh-session {
  position: relative;
  padding: 6px 8px;
}
.dsh-sh-sessionDragging {
  opacity: 0.45;
}
.dsh-sh-sessionDropBefore::before,
.dsh-sh-sessionDropAfter::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  z-index: 2;
  height: 2px;
  border-radius: 1px;
  background: var(--dsw-alias-state-business-primary);
  pointer-events: none;
}
.dsh-sh-sessionDropBefore::before {
  top: -3px;
}
.dsh-sh-sessionDropAfter::after {
  bottom: -3px;
}
.dsh-sh-session[data-current='true'] {
  background: var(--dsw-alias-bg-layer-1);
}
.dsh-sh-session[data-archived='true'] .dsh-sh-sessionTitle {
  color: var(--dsw-alias-label-tertiary);
}
.dsh-sh-session[data-archived='true'] .dsh-sh-sessionLine {
  opacity: 0.85;
}
.dsh-sh-archivedBar {
  display: flex;
  align-items: center;
  margin: 10px 0 4px;
  padding-top: 8px;
  border-top: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
}
.dsh-sh-archivedToggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}
.dsh-sh-archivedCheck {
  width: 13px;
  height: 13px;
  margin: 0;
  accent-color: var(--dsw-alias-state-business-primary);
  cursor: pointer;
}
.dsh-sh-sessionLine {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.dsh-sh-sessionTitle {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-sh-session[data-current='true'] .dsh-sh-sessionTitle {
  font-weight: 600;
}
.dsh-sh-sessionTitle.dsh-sh-sessionTitleUnread {
  color: var(--dsw-alias-state-warn-label);
}
.dsh-sh-dot {
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--dsw-alias-state-success-primary);
}
.dsh-sh-dotRunning {
  background: var(--dsw-alias-state-business-primary);
}
.dsh-sh-dotDone {
  background: var(--dsw-alias-state-success-primary);
}
.dsh-sh-badge {
  flex: 0 0 auto;
  padding: 0 6px;
  font-size: 10px;
  line-height: 1.6;
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
}
.dsh-sh-parent {
  overflow: hidden;
  padding-left: 6px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-sh-hint {
  flex: 0 0 auto;
  padding: 8px 12px 2px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 1.5;
}
.dsh-sh-empty {
  margin: auto;
  padding: 24px 16px;
  color: var(--dsw-alias-label-tertiary);
  line-height: 1.6;
  text-align: center;
}
`

    function HistoryGlyph(props) {
      const size = props && typeof props.size === 'number' ? props.size : 24
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
        },
        h('path', { d: 'M6 3.5v17', key: 'spine' }),
        h('circle', { cx: 6, cy: 6, r: 2, key: 'd1' }),
        h('circle', { cx: 6, cy: 12, r: 2, key: 'd2' }),
        h('circle', { cx: 6, cy: 18, r: 2, key: 'd3' }),
        h('path', { d: 'M8 12h4.4a4 4 0 0 0 4-4V7', key: 'b1' }),
        h('circle', { cx: 18, cy: 5, r: 1.6, key: 'b1d' }),
        h('path', { d: 'M8 12h4.4a4 4 0 0 1 4 4v2', key: 'b2' }),
        h('circle', { cx: 18, cy: 19, r: 1.6, key: 'b2d' }),
      )
    }

    function ensureStyles() {
      const selector = 'style[data-plugin-css="' + STYLE_ID + '"]'
      if (document.querySelector(selector)) return function () {}
      const tag = document.createElement('style')
      tag.dataset.pluginCss = STYLE_ID
      tag.textContent = CSS
      document.head.appendChild(tag)
      return function () {
        tag.remove()
      }
    }

    function readJson(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key)
        if (!raw) return fallback
        return JSON.parse(raw)
      } catch (error) {
        return fallback
      }
    }

    function writeJson(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        /* storage is best effort */
      }
    }

    function readRecords() {
      const raw = readJson(RECORDS_KEY, [])
      if (!Array.isArray(raw)) return []
      const records = []
      for (const item of raw) {
        if (!item || typeof item !== 'object') continue
        if (typeof item.childId !== 'string' || typeof item.parentId !== 'string') continue
        records.push({
          childId: item.childId,
          parentId: item.parentId,
          atSeq: typeof item.atSeq === 'number' ? item.atSeq : undefined,
          parentTitle: typeof item.parentTitle === 'string' ? item.parentTitle : undefined,
          time: typeof item.time === 'number' ? item.time : 0,
        })
      }
      return records
    }

    function readMode() {
      return readJson(MODE_KEY, 'history') === 'branches' ? 'branches' : 'history'
    }

    function writeMode(mode) {
      writeJson(MODE_KEY, mode)
    }

    function readShowArchived() {
      return readJson(SHOW_ARCHIVED_KEY, false) === true
    }

    function writeShowArchived(value) {
      writeJson(SHOW_ARCHIVED_KEY, value === true)
    }

    function readFilterPatterns() {
      const raw = readJson(FILTER_KEY, null)
      if (Array.isArray(raw)) {
        return raw.filter(function (item) {
          return typeof item === 'string' && item.length > 0
        })
      }
      return DEFAULT_FILTERS.slice()
    }

    function writeFilterPatterns(patterns) {
      writeJson(FILTER_KEY, patterns)
    }

    function parseFilterText(text) {
      const patterns = []
      const seen = new Set()
      for (const piece of String(text || '').split(/[\n,，]/)) {
        const pattern = piece.trim()
        if (pattern === '' || seen.has(pattern)) continue
        seen.add(pattern)
        patterns.push(pattern)
        if (patterns.length >= 100) break
      }
      return patterns
    }

    function formatFilterText(patterns) {
      return patterns.join(', ')
    }

    function globToRegExp(pattern) {
      let source = ''
      for (const char of pattern) {
        if (char === '*') source += '.*'
        else if (char === '?') source += '.'
        else source += char.replace(/[\^$.*+?()[\]{}|\\]/g, '\\$&')
      }
      try {
        return new RegExp('^' + source + '$', 'iu')
      } catch (error) {
        return null
      }
    }

    function compileFilters(patterns) {
      const compiled = []
      for (const pattern of patterns) {
        const regexp = globToRegExp(pattern)
        if (regexp) compiled.push(regexp)
      }
      return compiled
    }

    function isFilteredPrompt(prompt, compiled) {
      if (!prompt || compiled.length === 0) return false
      const text = String(prompt).trim()
      if (text === '') return false
      for (const regexp of compiled) {
        if (regexp.test(text)) return true
      }
      return false
    }

    function titleOfSession(service, sessionId) {
      try {
        const snapshot = service.list.getSnapshot()
        const summary = snapshot && snapshot.byId ? snapshot.byId[sessionId] : undefined
        if (summary) return summary.displayTitle || summary.title
      } catch (error) {
        /* ignore */
      }
      return undefined
    }

    function createRecordStore() {
      let records = readRecords()
      const listeners = new Set()

      function emit() {
        for (const listener of listeners) listener()
      }

      function save() {
        writeJson(RECORDS_KEY, records)
      }

      return {
        subscribe(listener) {
          listeners.add(listener)
          return function () {
            listeners.delete(listener)
          }
        },
        getSnapshot() {
          return records
        },
        record(entry) {
          if (!entry || typeof entry.childId !== 'string' || typeof entry.parentId !== 'string') return
          const next = records.filter((item) => item.childId !== entry.childId)
          next.unshift({
            childId: entry.childId,
            parentId: entry.parentId,
            atSeq: entry.atSeq,
            parentTitle: entry.parentTitle,
            time: entry.time || Date.now(),
          })
          records = next.slice(0, MAX_RECORDS)
          save()
          emit()
        },
        prune(liveIds) {
          const next = records.filter((item) => liveIds.has(item.childId))
          if (next.length === records.length) return
          records = next
          save()
          emit()
        },
      }
    }

    function readIdList(key) {
      const raw = readJson(key, [])
      if (!Array.isArray(raw)) return []
      const ids = []
      for (const item of raw) {
        if (typeof item !== 'string' || item === '') continue
        if (ids.indexOf(item) !== -1) continue
        ids.push(item)
      }
      return ids
    }

    function createPinStore() {
      let ids = readIdList(PIN_KEY).slice(0, MAX_PINS)
      const listeners = new Set()

      function emit() {
        for (const listener of listeners) listener()
      }

      return {
        subscribe(listener) {
          listeners.add(listener)
          return function () {
            listeners.delete(listener)
          }
        },
        getSnapshot() {
          return ids
        },
        has(sessionId) {
          return ids.indexOf(sessionId) !== -1
        },
        set(sessionId, pinned) {
          if (typeof sessionId !== 'string' || sessionId === '') return
          const next = ids.filter(function (id) {
            return id !== sessionId
          })
          if (pinned) next.unshift(sessionId)
          const capped = next.slice(0, MAX_PINS)
          if (capped.length === ids.length && capped.every(function (id, index) { return id === ids[index] })) return
          ids = capped
          writeJson(PIN_KEY, ids)
          emit()
        },
      }
    }

    function createOrderStore() {
      let ids = readIdList(ORDER_KEY)
      const listeners = new Set()

      function emit() {
        for (const listener of listeners) listener()
      }

      return {
        subscribe(listener) {
          listeners.add(listener)
          return function () {
            listeners.delete(listener)
          }
        },
        getSnapshot() {
          return ids
        },
        move(fromId, toId, displayedIds, after) {
          if (typeof fromId !== 'string' || typeof toId !== 'string' || fromId === toId) return
          const base = Array.isArray(displayedIds) && displayedIds.length > 0 ? displayedIds : ids
          const next = []
          for (const id of base) {
            if (typeof id === 'string' && id !== '' && next.indexOf(id) === -1) next.push(id)
          }
          const from = next.indexOf(fromId)
          if (from === -1) return
          next.splice(from, 1)
          const target = next.indexOf(toId)
          if (target === -1) return
          next.splice(target + (after ? 1 : 0), 0, fromId)
          if (next.length === ids.length && next.every(function (id, index) { return id === ids[index] })) return
          ids = next
          writeJson(ORDER_KEY, ids)
          emit()
        },
      }
    }

    function findTurnRow(turn) {
      const rows = Array.from(document.querySelectorAll('[data-chat-turn]'))
      let exact = null
      let nearestAfter = null
      let last = null
      for (const row of rows) {
        const value = Number(row.getAttribute('data-chat-turn'))
        if (!Number.isFinite(value)) continue
        if (value === turn && exact === null) exact = row
        if (value >= turn && (nearestAfter === null || value < Number(nearestAfter.getAttribute('data-chat-turn')))) {
          nearestAfter = row
        }
        if (last === null || value > Number(last.getAttribute('data-chat-turn'))) last = row
      }
      return exact || nearestAfter || last
    }

    function scrollToTurnDom(turn) {
      return new Promise(function (resolve) {
        const deadline = Date.now() + 4000
        const attempt = function () {
          const row = typeof turn === 'number' && Number.isFinite(turn) ? findTurnRow(turn) : null
          if (row) {
            try {
              row.scrollIntoView({ block: 'center', behavior: 'smooth' })
            } catch (error) {
              try {
                row.scrollIntoView()
              } catch (ignored) {
                /* ignore */
              }
            }
            resolve(true)
            return
          }
          if (Date.now() > deadline) {
            resolve(false)
            return
          }
          window.setTimeout(attempt, 80)
        }
        attempt()
      })
    }

    function openTabInSession(ctx, sessionId) {
      const sidebar = ctx.sidebarRight
      if (!sidebar || typeof sessionId !== 'string') return
      let attempts = 0
      const tick = function () {
        attempts += 1
        let done = false
        try {
          const tabs = typeof sidebar.tabsIn === 'function' ? sidebar.tabsIn(sessionId) : undefined
          done = Array.isArray(tabs) && tabs.some(function (tab) {
            return tab && tab.kind === TAB_KIND
          })
          if (!done && typeof sidebar.openTabIn === 'function') sidebar.openTabIn(sessionId, TAB_KIND)
        } catch (error) {
          /* the target surface is not ready yet; retry below */
        }
        if (!done && attempts < 24) window.setTimeout(tick, 100)
      }
      window.setTimeout(tick, 0)
    }

    /**
     * Sessions without a durable title are displayed by the Host with a
     * placeholder (the workspace directory basename or the raw session id).
     * Those read as "workspaces" in the branch tree, so they are left out.
     */
    function hasDurableTitle(summary) {
      return !!summary && typeof summary.title === 'string' && summary.title.trim() !== ''
    }

    function buildBranchRows(sessions, records, archivedIds, pinnedIds, orderIds) {
      const byId = sessions && sessions.byId ? sessions.byId : {}
      const live = new Set()
      for (const id of sessions && sessions.ids ? sessions.ids : []) {
        const summary = byId[id]
        if (!summary) continue
        if (summary.origin === 'subagent') continue
        if (!hasDurableTitle(summary)) continue
        if (archivedIds && archivedIds.has(id)) continue
        live.add(id)
      }
      const pinnedRank = new Map()
      for (let index = 0; index < (pinnedIds || []).length; index += 1) {
        pinnedRank.set(pinnedIds[index], index)
      }
      const orderRank = new Map()
      for (let index = 0; index < (orderIds || []).length; index += 1) {
        orderRank.set(orderIds[index], index)
      }
      const updatedAt = function (id) {
        return (byId[id] && byId[id].updatedAt) || 0
      }
      const compareRows = function (a, b) {
        const pinnedA = pinnedRank.has(a)
        const pinnedB = pinnedRank.has(b)
        if (pinnedA !== pinnedB) return pinnedA ? -1 : 1
        if (pinnedA) {
          const ra = orderRank.has(a) ? orderRank.get(a) : 1e9 + pinnedRank.get(a)
          const rb = orderRank.has(b) ? orderRank.get(b) : 1e9 + pinnedRank.get(b)
          if (ra !== rb) return ra - rb
          return updatedAt(b) - updatedAt(a)
        }
        const orderedA = orderRank.has(a)
        const orderedB = orderRank.has(b)
        if (orderedA && orderedB) return orderRank.get(a) - orderRank.get(b)
        if (orderedA) return -1
        if (orderedB) return 1
        return updatedAt(b) - updatedAt(a)
      }
      const parentOf = new Map()
      const inferredOf = new Set()
      const childrenByParent = new Map()
      const link = function (childId, parentId, inferred) {
        if (!live.has(childId) || !live.has(parentId) || childId === parentId) return
        if (parentOf.has(childId)) return
        parentOf.set(childId, parentId)
        if (inferred) inferredOf.add(childId)
        let bucket = childrenByParent.get(parentId)
        if (!bucket) {
          bucket = []
          childrenByParent.set(parentId, bucket)
        }
        bucket.push(childId)
      }
      for (const record of records || []) {
        if (!record) continue
        link(record.childId, record.parentId, false)
      }

      /**
       * Sessions forked before this plugin was installed carry no durable
       * parent link. Two best-effort fallbacks recover most of them:
       *  1. the Host still exposes the historical `parentSessionId` header
       *     value for some sessions;
       *  2. DSH names a fork "<base title> (n)", so an unlinked session whose
       *     title ends with a numeric suffix nests under the live session that
       *     still carries the base title.
       */
      const inferParent = function (childId) {
        const summary = byId[childId]
        if (!summary) return null
        if (summary.parentSessionId && summary.parentSessionId !== childId && live.has(summary.parentSessionId)) {
          return { parentId: summary.parentSessionId, inferred: false }
        }
        const title = typeof summary.title === 'string' ? summary.title.trim() : ''
        const match = /^(.+?)\s*[\(（]\d+[\)）]$/u.exec(title)
        if (!match) return null
        const base = match[1].trim()
        if (!base) return null
        let best = null
        for (const candidateId of live) {
          if (candidateId === childId) continue
          const candidate = byId[candidateId]
          if (!candidate || typeof candidate.title !== 'string') continue
          if (candidate.title.trim() !== base) continue
          if (best === null || ((candidate.updatedAt || 0) > ((byId[best] && byId[best].updatedAt) || 0))) best = candidateId
        }
        return best === null ? null : { parentId: best, inferred: true }
      }
      for (const id of live) {
        if (parentOf.has(id)) continue
        const found = inferParent(id)
        if (!found) continue
        if (parentOf.get(found.parentId) === id) continue
        link(id, found.parentId, found.inferred)
      }

      for (const bucket of childrenByParent.values()) {
        bucket.sort(compareRows)
      }
      const roots = []
      for (const id of live) {
        if (!parentOf.has(id) || pinnedRank.has(id)) roots.push(id)
      }
      roots.sort(compareRows)
      const rows = []
      const visited = new Set()
      const walk = function (id, depth) {
        if (visited.has(id)) return
        visited.add(id)
        rows.push({ sessionId: id, depth: depth, parentId: parentOf.get(id), inferred: inferredOf.has(id) })
        for (const childId of childrenByParent.get(id) || []) walk(childId, depth + 1)
      }
      for (const root of roots) walk(root, 0)
      for (const id of live) {
        if (!visited.has(id)) rows.push({ sessionId: id, depth: 0 })
      }
      return rows
    }

    /**
     * Archived sessions are listed after the branch tree, behind an explicit
     * toggle. They keep their flat updatedAt order instead of tree order.
     */
    function buildArchivedRows(sessions, archivedIds) {
      const byId = sessions && sessions.byId ? sessions.byId : {}
      const rows = []
      for (const id of sessions && sessions.ids ? sessions.ids : []) {
        const summary = byId[id]
        if (!summary) continue
        if (summary.origin === 'subagent') continue
        if (!hasDurableTitle(summary)) continue
        if (!archivedIds || !archivedIds.has(id)) continue
        rows.push({ sessionId: id, depth: 0, archived: true })
      }
      rows.sort(function (a, b) {
        return ((byId[b.sessionId] && byId[b.sessionId].updatedAt) || 0) - ((byId[a.sessionId] && byId[a.sessionId].updatedAt) || 0)
      })
      return rows
    }

    function createPanel(ctx, store, pins, order) {
      return function SessionHistoryPanel(props) {
        const t = props.t
        const sessionId = props.sessionId
        const [mode, setMode] = React.useState(readMode)
        const [showArchived, setShowArchived] = React.useState(readShowArchived)
        const [filterText, setFilterText] = React.useState(function () {
          return formatFilterText(readFilterPatterns())
        })
        const compiledFilters = React.useMemo(
          function () {
            return compileFilters(parseFilterText(filterText))
          },
          [filterText],
        )

        const outlineResult = props.useProjection ? props.useProjection('turnOutline') : undefined

        const getListSnapshot = React.useCallback(function () {
          return ctx.sessions.list.getSnapshot()
        }, [])
        const subscribeList = React.useCallback(function (notify) {
          return ctx.sessions.list.subscribe(notify)
        }, [])
        const sessions = React.useSyncExternalStore(subscribeList, getListSnapshot)

        const readArchivedIds = React.useCallback(function () {
          try {
            const service = ctx.workspaces || (typeof ctx.get === 'function' ? ctx.get('workspaces') : undefined)
            const list = service && service.list
            if (!list || typeof list.getSnapshot !== 'function') return EMPTY_ARCHIVED
            const snapshot = list.getSnapshot()
            return snapshot && snapshot.archivedSessionIds ? snapshot.archivedSessionIds : EMPTY_ARCHIVED
          } catch (error) {
            return EMPTY_ARCHIVED
          }
        }, [])
        const subscribeArchived = React.useCallback(function (notify) {
          try {
            const service = ctx.workspaces || (typeof ctx.get === 'function' ? ctx.get('workspaces') : undefined)
            const list = service && service.list
            if (!list || typeof list.subscribe !== 'function') return function () {}
            return list.subscribe(notify)
          } catch (error) {
            return function () {}
          }
        }, [])
        const archivedIds = React.useSyncExternalStore(subscribeArchived, readArchivedIds)

        const readStatuses = React.useCallback(function () {
          try {
            const service = ctx.uiSession || (typeof ctx.get === 'function' ? ctx.get('uiSession') : undefined)
            const source = service && service.sessionStatus
            return source && typeof source.getSnapshot === 'function' ? source.getSnapshot() : EMPTY_STATUSES
          } catch (error) {
            return EMPTY_STATUSES
          }
        }, [])
        const subscribeStatuses = React.useCallback(function (notify) {
          try {
            const service = ctx.uiSession || (typeof ctx.get === 'function' ? ctx.get('uiSession') : undefined)
            const source = service && service.sessionStatus
            if (!source || typeof source.subscribe !== 'function') return function () {}
            return source.subscribe(notify)
          } catch (error) {
            return function () {}
          }
        }, [])
        const statuses = React.useSyncExternalStore(subscribeStatuses, readStatuses)

        const records = React.useSyncExternalStore(store.subscribe, store.getSnapshot)
        const pinnedIds = React.useSyncExternalStore(pins.subscribe, pins.getSnapshot)
        const orderIds = React.useSyncExternalStore(order.subscribe, order.getSnapshot)

        React.useEffect(
          function () {
            if (!sessions || sessions.phase !== 'ready') return
            store.prune(new Set(sessions.ids))
          },
          [sessions],
        )

        const switchMode = React.useCallback(function (next) {
          setMode(next)
          writeMode(next)
        }, [])

        const jumpToTurn = React.useCallback(
          function (item) {
            const binding = ctx.sessions.binding(sessionId)
            const session = binding && binding.session
            const finish = function () {
              if (item && typeof item.turn === 'number') scrollToTurnDom(item.turn)
            }
            if (session && typeof session.loadThrough === 'function' && item && typeof item.seq === 'number') {
              session.loadThrough(item.seq).then(finish, finish)
              return
            }
            finish()
          },
          [sessionId],
        )

        const openSession = React.useCallback(
          function (id) {
            if (!id || id === sessionId) return
            try {
              const workspace = ctx.uiWorkspace
              if (workspace && typeof workspace.openSession === 'function') workspace.openSession(id)
              openTabInSession(ctx, id)
            } catch (error) {
              console.warn('[dsh-session-history] open session failed', error)
            }
          },
          [sessionId],
        )

        const changeFilter = React.useCallback(function (value) {
          setFilterText(value)
          writeFilterPatterns(parseFilterText(value))
        }, [])

        const resetFilter = React.useCallback(function () {
          changeFilter(formatFilterText(DEFAULT_FILTERS))
        }, [])

        const turns = React.useMemo(
          function () {
            if (!Array.isArray(outlineResult)) return []
            const items = outlineResult.filter(function (item) {
              return item && typeof item.turn === 'number' && typeof item.seq === 'number'
            })
            return items.slice().sort(function (a, b) {
              return a.turn - b.turn
            })
          },
          [outlineResult],
        )

        const visibleTurns = React.useMemo(
          function () {
            return turns.filter(function (item) {
              return !isFilteredPrompt(item.prompt, compiledFilters)
            })
          },
          [turns, compiledFilters],
        )
        const hiddenTurns = turns.length - visibleTurns.length

        const branchRows = React.useMemo(
          function () {
            if (!sessions) return []
            return buildBranchRows(
              sessions,
              records,
              new Set(Array.isArray(archivedIds) ? archivedIds : []),
              Array.isArray(pinnedIds) ? pinnedIds : [],
              Array.isArray(orderIds) ? orderIds : [],
            )
          },
          [sessions, records, archivedIds, pinnedIds, orderIds],
        )

        const archivedRows = React.useMemo(
          function () {
            if (!sessions) return []
            return buildArchivedRows(sessions, new Set(Array.isArray(archivedIds) ? archivedIds : []))
          },
          [sessions, archivedIds],
        )

        const toggleShowArchived = React.useCallback(function (event) {
          const next = !!(event && event.target && event.target.checked)
          setShowArchived(next)
          writeShowArchived(next)
        }, [])

        const [dragId, setDragId] = React.useState(null)
        const [dropId, setDropId] = React.useState(null)
        const [dropAfter, setDropAfter] = React.useState(false)

        const startDrag = React.useCallback(
          function (event, row) {
            setDragId(row.sessionId)
            try {
              if (event && event.dataTransfer) {
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', row.sessionId)
              }
            } catch (error) {
              /* drag payload is best effort */
            }
          },
          [],
        )
        const endDrag = React.useCallback(function () {
          setDragId(null)
          setDropId(null)
          setDropAfter(false)
        }, [])
        const enterDrop = React.useCallback(
          function (event, row) {
            if (!dragId || dragId === row.sessionId) return
            if (pins.has(dragId) !== pins.has(row.sessionId)) return
            if (event && typeof event.preventDefault === 'function') event.preventDefault()
            try {
              if (event && event.dataTransfer) event.dataTransfer.dropEffect = 'move'
            } catch (error) {
              /* ignore */
            }
            let after = false
            try {
              const element = event && event.currentTarget
              const rect =
                element && typeof element.getBoundingClientRect === 'function' ? element.getBoundingClientRect() : null
              if (rect && typeof event.clientY === 'number' && rect.height > 0) {
                after = event.clientY > rect.top + rect.height / 2
              }
            } catch (error) {
              after = false
            }
            if (dropId !== row.sessionId) setDropId(row.sessionId)
            setDropAfter(after)
          },
          [dragId, dropId, pins],
        )
        const drop = React.useCallback(
          function (event, row) {
            if (event && typeof event.preventDefault === 'function') event.preventDefault()
            let from = dragId
            try {
              if (event && event.dataTransfer && typeof event.dataTransfer.getData === 'function') {
                from = event.dataTransfer.getData('text/plain') || from
              }
            } catch (error) {
              /* ignore */
            }
            if (from && from !== row.sessionId && pins.has(from) === pins.has(row.sessionId)) {
              order.move(
                from,
                row.sessionId,
                branchRows.map(function (item) {
                  return item.sessionId
                }),
                dropAfter,
              )
            }
            setDragId(null)
            setDropId(null)
            setDropAfter(false)
          },
          [dragId, dropAfter, pins, order, branchRows],
        )

        const header = h(
          'div',
          { className: 'dsh-sh-tabs', role: 'tablist' },
          h(
            'button',
            {
              type: 'button',
              role: 'tab',
              'aria-selected': mode === 'history',
              className: mode === 'history' ? 'dsh-sh-tab dsh-sh-tabActive' : 'dsh-sh-tab',
              onClick: function () {
                switchMode('history')
              },
            },
            t('tabHistory'),
          ),
          h(
            'button',
            {
              type: 'button',
              role: 'tab',
              'aria-selected': mode === 'branches',
              className: mode === 'branches' ? 'dsh-sh-tab dsh-sh-tabActive' : 'dsh-sh-tab',
              onClick: function () {
                switchMode('branches')
              },
            },
            t('tabBranches'),
          ),
        )

        if (mode === 'branches') {
          const renderSessionRow = function (row, archived) {
            const summary = sessions.byId[row.sessionId] || {}
            const title = summary.displayTitle || summary.title || t('untitled')
            const parentSummary = row.parentId ? sessions.byId[row.parentId] : undefined
            const parentTitle = hasDurableTitle(parentSummary)
              ? parentSummary.displayTitle || parentSummary.title
              : undefined
            const pinned = !archived && pins.has(row.sessionId)
            const status = statuses && typeof statuses.get === 'function' ? statuses.get(row.sessionId) : undefined
            const running = !!(status && status.running) || !!summary.running
            const unread = !!(status && status.completionUnread)
            let className = 'dsh-sh-session'
            if (archived) className += ' dsh-sh-sessionArchived'
            if (!archived && dragId === row.sessionId) className += ' dsh-sh-sessionDragging'
            if (!archived && dropId === row.sessionId && dragId && dragId !== row.sessionId) {
              className += dropAfter ? ' dsh-sh-sessionDropAfter' : ' dsh-sh-sessionDropBefore'
            }
            const parentHint =
              !archived && row.depth > 0 && parentTitle
                ? t('forkedFrom') + ' ' + parentTitle + (row.inferred ? t('inferredSuffix') : '')
                : undefined
            return h(
              'button',
              {
                type: 'button',
                key: row.sessionId,
                className: className,
                'data-current': row.sessionId === sessionId ? 'true' : undefined,
                'data-archived': archived ? 'true' : undefined,
                draggable: !archived,
                style: { paddingLeft: 8 + row.depth * 14 + 'px' },
                title: parentHint || title,
                onDragStart: archived
                  ? undefined
                  : function (event) {
                      startDrag(event, row)
                    },
                onDragOver: archived
                  ? undefined
                  : function (event) {
                      enterDrop(event, row)
                    },
                onDragLeave: archived
                  ? undefined
                  : function () {
                      if (dropId === row.sessionId) {
                        setDropId(null)
                        setDropAfter(false)
                      }
                    },
                onDragEnd: archived ? undefined : endDrag,
                onDrop: archived
                  ? undefined
                  : function (event) {
                      drop(event, row)
                    },
                onContextMenu: function (event) {
                  if (event && typeof event.preventDefault === 'function') event.preventDefault()
                  try {
                    const menus = ctx.contextMenus
                    if (!menus || typeof menus.open !== 'function') return
                    markPanelMenu(row.sessionId)
                    menus.open(
                      { kind: 'session', value: { sessionId: row.sessionId, displayTitle: title } },
                      { x: event.clientX, y: event.clientY },
                    )
                  } catch (error) {
                    panelMenuSessionId = null
                    console.warn('[dsh-session-history] open session menu failed', error)
                  }
                },
                onClick: function () {
                  openSession(row.sessionId)
                },
              },
              h(
                'span',
                { className: 'dsh-sh-sessionLine' },
                running ? h('span', { className: 'dsh-sh-dot dsh-sh-dotRunning' }) : null,
                !running && unread ? h('span', { className: 'dsh-sh-dot dsh-sh-dotDone' }) : null,
                h(
                  'span',
                  { className: unread ? 'dsh-sh-sessionTitle dsh-sh-sessionTitleUnread' : 'dsh-sh-sessionTitle' },
                  title,
                ),
                pinned ? h('span', { className: 'dsh-sh-badge' }, t('pinnedBadge')) : null,
                archived ? h('span', { className: 'dsh-sh-badge' }, t('archivedBadge')) : null,
                row.sessionId === sessionId ? h('span', { className: 'dsh-sh-badge' }, t('current')) : null,
              ),
              parentHint ? h('span', { className: 'dsh-sh-parent' }, parentHint) : null,
            )
          }
          const rows = branchRows.map(function (row) {
            return renderSessionRow(row, false)
          })
          const archivedList = archivedRows.map(function (row) {
            return renderSessionRow(row, true)
          })

          return h(
            'div',
            { className: 'dsh-sh-root' },
            header,
            h(
              'div',
              { className: 'dsh-sh-pane' },
              h('div', { className: 'dsh-sh-hint' }, t('branchHint')),
              h(
                'div',
                { className: 'dsh-sh-list' },
                rows.length === 0 && archivedList.length === 0
                  ? h('div', { className: 'dsh-sh-empty' }, t('emptyBranches'))
                  : rows,
                h(
                  'div',
                  { className: 'dsh-sh-archivedBar' },
                  h(
                    'label',
                    { className: 'dsh-sh-archivedToggle' },
                    h('input', {
                      type: 'checkbox',
                      className: 'dsh-sh-archivedCheck',
                      checked: showArchived,
                      onChange: toggleShowArchived,
                    }),
                    h('span', null, t('showArchived')),
                  ),
                ),
                showArchived
                  ? archivedList.length === 0
                    ? h('div', { className: 'dsh-sh-empty' }, t('emptyArchived'))
                    : archivedList
                  : null,
              ),
            ),
          )
        }

        return h(
          'div',
          { className: 'dsh-sh-root' },
          header,
          h(
            'div',
            { className: 'dsh-sh-pane' },
            h(
              'div',
              { className: 'dsh-sh-filter' },
              h('input', {
                className: 'dsh-sh-filterInput',
                type: 'text',
                value: filterText,
                placeholder: t('filterPlaceholder'),
                spellCheck: false,
                autoComplete: 'off',
                onChange: function (event) {
                  changeFilter(event.target.value)
                },
              }),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-sh-filterReset',
                  title: t('filterReset'),
                  onClick: resetFilter,
                },
                t('filterReset'),
              ),
            ),
            h('div', { className: 'dsh-sh-filterMeta' }, t('filterHint') + ', ' + t('filterCounted').replace('{count}', String(hiddenTurns))),
            h('div', { className: 'dsh-sh-filterMeta' }, t('filterWildcard')),
            h(
              'div',
              { className: 'dsh-sh-list' },
              visibleTurns.length === 0
                ? h('div', { className: 'dsh-sh-empty' }, t('emptyHistory'))
                : visibleTurns.map(function (item) {
                    const prompt = typeof item.prompt === 'string' ? item.prompt : ''
                    const response = typeof item.response === 'string' ? item.response : ''
                    return h(
                      'button',
                      {
                        type: 'button',
                        key: item.turn,
                        className: 'dsh-sh-row',
                        title: [prompt, response].filter(Boolean).join('\n'),
                        onClick: function () {
                          jumpToTurn(item)
                        },
                      },
                      h(
                        'span',
                        { className: 'dsh-sh-rowHead' },
                        h('span', { className: 'dsh-sh-turn' }, '#' + String(item.turn + 1)),
                        h('span', { className: 'dsh-sh-prompt' }, prompt || t('noText')),
                      ),
                      response ? h('span', { className: 'dsh-sh-response' }, response) : null,
                    )
                  }),
            ),
          ),
        )
      }
    }

    return {
      inject: ['slots', 'locale', 'sessions', 'uiSession', 'workspaces', 'remoteAccess', 'sidebarRight', 'sidebarRightTabs', 'contextMenus', 'uiWorkspace'],
      apply(ctx) {
        ctx.effect(
          function () {
            return ensureStyles()
          },
          'dsh-session-history: styles',
        )

        ctx.effect(
          function () {
            return ctx.locale.register(NAMESPACE, { zh: zh, en: en })
          },
          'dsh-session-history: dictionaries',
        )

        const t = ctx.locale.bind(NAMESPACE)
        const records = createRecordStore()
        const pins = createPinStore()
        const order = createOrderStore()

        ctx.effect(
          function () {
            const service = ctx.sessions
            if (!service || typeof service.fork !== 'function' || service.fork.__dshSessionHistoryWrapped) {
              return function () {}
            }
            const original = service.fork
            const wrapped = async function (options) {
              const result = await original.call(service, options)
              try {
                if (typeof result === 'string') {
                  records.record({
                    childId: result,
                    parentId: options && options.sessionId,
                    atSeq: options && typeof options.atSeq === 'number' ? options.atSeq : undefined,
                    parentTitle: titleOfSession(service, options && options.sessionId),
                    time: Date.now(),
                  })
                }
              } catch (error) {
                console.warn('[dsh-session-history] record branch failed', error)
              }
              return result
            }
            wrapped.__dshSessionHistoryWrapped = true
            service.fork = wrapped
            return function () {
              if (service.fork === wrapped) service.fork = original
            }
          },
          'dsh-session-history: fork recorder',
        )

        ctx.effect(
          function () {
            const menus = ctx.contextMenus
            const active = menus && menus.active
            if (!active || typeof active.subscribe !== 'function') return function () {}
            const unsubscribe = active.subscribe(function () {
              if (active.getSnapshot() === null) panelMenuSessionId = null
            })
            return function () {
              unsubscribe()
            }
          },
          'dsh-session-history: panel menu marker',
        )

        /**
         * The shared session menu's built-in pin action writes Host workspace
         * state (`workspace/pinSession`). While the menu was opened from this
         * panel, the access source reports it as unavailable so the built-in
         * item stays hidden and the panel-local pin action below is the only
         * one shown; the left workspace list keeps its own pin untouched.
         */
        ctx.effect(
          function () {
            const access = ctx.remoteAccess || (typeof ctx.get === 'function' ? ctx.get('remoteAccess') : undefined)
            if (!access || typeof access.source !== 'function' || access.source.__dshSessionHistoryWrapped) {
              return function () {}
            }
            const original = access.source
            const wrapped = function (kind, id, endpoint) {
              if (
                (endpoint === 'workspace/pinSession' || endpoint === 'workspace/unpinSession')
                && typeof id === 'string'
                && isPanelMenuTarget(id)
              ) {
                return {
                  getSnapshot: function () {
                    return false
                  },
                  subscribe: function () {
                    return function () {}
                  },
                }
              }
              return original.call(access, kind, id, endpoint)
            }
            wrapped.__dshSessionHistoryWrapped = true
            access.source = wrapped
            return function () {
              if (access.source === wrapped) access.source = original
            }
          },
          'dsh-session-history: pin access mask',
        )

        ctx.effect(
          function () {
            const service = ctx.workspaces || (typeof ctx.get === 'function' ? ctx.get('workspaces') : undefined)
            if (!service || typeof service.pinSession !== 'function' || typeof service.unpinSession !== 'function') {
              return function () {}
            }
            if (service.pinSession.__dshSessionHistoryWrapped) return function () {}
            const originalPin = service.pinSession
            const originalUnpin = service.unpinSession
            const wrap = function (original, pinned) {
              const wrapped = async function (sessionId) {
                if (isPanelMenuTarget(sessionId)) {
                  pins.set(sessionId, pinned)
                  return undefined
                }
                return original.call(service, sessionId)
              }
              wrapped.__dshSessionHistoryWrapped = true
              return wrapped
            }
            const pinWrapper = wrap(originalPin, true)
            const unpinWrapper = wrap(originalUnpin, false)
            service.pinSession = pinWrapper
            service.unpinSession = unpinWrapper
            return function () {
              if (service.pinSession === pinWrapper) service.pinSession = originalPin
              if (service.unpinSession === unpinWrapper) service.unpinSession = originalUnpin
            }
          },
          'dsh-session-history: local pins',
        )

        ctx.effect(
          function () {
            const menus = ctx.contextMenus
            if (!menus || typeof menus.register !== 'function') return function () {}
            return menus.register({
              id: 'session.historyPin',
              target: 'session',
              order: 100,
              observe: function () {
                return [pins]
              },
              resolve: function (target) {
                if (!target || !isPanelMenuTarget(target.sessionId)) return []
                let archived = false
                try {
                  const list = ctx.workspaces && ctx.workspaces.list
                  const snapshot = list && typeof list.getSnapshot === 'function' ? list.getSnapshot() : undefined
                  archived =
                    !!snapshot &&
                    Array.isArray(snapshot.archivedSessionIds) &&
                    snapshot.archivedSessionIds.indexOf(target.sessionId) !== -1
                } catch (error) {
                  archived = false
                }
                if (archived) return []
                const pinned = pins.has(target.sessionId)
                return [
                  {
                    id: 'pin',
                    label: t(pinned ? 'unpinSession' : 'pinSession'),
                    icon: { key: pinned ? 'workspace.unpin' : 'workspace.pin' },
                    run: function () {
                      pins.set(target.sessionId, !pinned)
                    },
                  },
                ]
              },
            })
          },
          'dsh-session-history: pin menu',
        )

        ctx.effect(
          function () {
            return ctx.sidebarRightTabs.register({
              id: TAB_ID,
              kind: TAB_KIND,
              title: function () {
                return t('title')
              },
              guide: [
                {
                  id: 'open',
                  order: 24,
                  title: function () {
                    return t('title')
                  },
                  description: function () {
                    return t('guideDescription')
                  },
                  icon: HistoryGlyph,
                },
              ],
            })
          },
          'dsh-session-history: tab type',
        )

        const Panel = createPanel(ctx, records, pins, order)
        ctx.slots.inject('sidebar.right.pane.tab', function () {
          return ctx.slots.register(
            {
              name: 'sidebar.right.pane.tab',
              key: TAB_ID,
              locale: NAMESPACE,
            },
            Panel,
          )
        })
      },
    }
  },
})
