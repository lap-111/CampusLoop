import { computed, onUnmounted, ref, watch } from 'vue'

/**
 * 网格虚拟列表：按行窗口化渲染，避免长列表下大量卡片 DOM 与图片解码压力。
 * 列数与 ListView 中 el-col 断点（xs/sm/md/lg）对齐。
 */
export function useGridVirtualizer(scrollElRef, items, options = {}) {
  const rowHeight = options.rowHeight ?? 228
  const overscan = options.overscan ?? 1

  const width = ref(0)
  const scrollTop = ref(0)

  let ro = null
  let raf = 0

  function colsFor(w) {
    if (w < 768) return 1
    if (w < 992) return 2
    if (w < 1200) return 3
    return 4
  }

  const cols = computed(() => colsFor(width.value || 768))

  const totalRows = computed(() => {
    const c = cols.value
    if (!c) return 0
    return Math.ceil(items.value.length / c)
  })

  const totalHeight = computed(() => totalRows.value * rowHeight)

  const visibleRange = computed(() => {
    const el = scrollElRef.value
    const len = items.value.length
    if (!el || len === 0 || totalRows.value === 0) {
      return { startRow: 0, endRow: -1 }
    }
    const st = scrollTop.value
    const ch = el.clientHeight || 0
    const rh = rowHeight
    let startRow = Math.floor(st / rh) - overscan
    let endRow = Math.ceil((st + ch) / rh) + overscan
    startRow = Math.max(0, startRow)
    endRow = Math.min(totalRows.value - 1, endRow)
    return { startRow, endRow }
  })

  const visibleRows = computed(() => {
    const { startRow, endRow } = visibleRange.value
    const list = items.value
    const c = cols.value
    if (endRow < startRow || !list.length) return []

    const rows = []
    for (let r = startRow; r <= endRow; r++) {
      const rowItems = []
      for (let j = 0; j < c; j++) {
        const i = r * c + j
        if (i < list.length) rowItems.push(list[i])
      }
      if (rowItems.length) rows.push({ rowIndex: r, items: rowItems })
    }
    return rows
  })

  const offsetY = computed(() => visibleRange.value.startRow * rowHeight)

  function onScroll() {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      const el = scrollElRef.value
      if (el) scrollTop.value = el.scrollTop
    })
  }

  function detach(el) {
    if (ro && el) {
      ro.disconnect()
      ro = null
    }
    if (el) el.removeEventListener('scroll', onScroll)
  }

  watch(
    () => scrollElRef.value,
    (el, prev) => {
      detach(prev)
      if (!el) {
        width.value = 0
        scrollTop.value = 0
        return
      }
      ro = new ResizeObserver(() => {
        width.value = el.clientWidth
      })
      ro.observe(el)
      width.value = el.clientWidth
      el.addEventListener('scroll', onScroll, { passive: true })
      scrollTop.value = el.scrollTop
    },
    { flush: 'post', immediate: true },
  )

  watch(
    () => items.value.length,
    () => {
      const el = scrollElRef.value
      if (!el) return
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight)
      if (el.scrollTop > maxScroll) el.scrollTop = maxScroll
    },
  )

  onUnmounted(() => {
    cancelAnimationFrame(raf)
    detach(scrollElRef.value)
  })

  return {
    cols,
    totalHeight,
    offsetY,
    visibleRows,
    rowHeight,
  }
}
