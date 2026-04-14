import { defineStore } from 'pinia'
import { ref } from 'vue'

const LS_SEARCH = 'cl-search-history'
const LS_RECENT = 'cl-recent-views'

function loadJson(key, fallback) {
  try {
    const t = localStorage.getItem(key)
    return t ? JSON.parse(t) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {
    /* ignore */
  }
}

export const useHistoryStore = defineStore('history', () => {
  const searchHistory = ref(loadJson(LS_SEARCH, []))
  const recentViews = ref(loadJson(LS_RECENT, []))

  function addSearch(q) {
    const t = String(q || '').trim()
    if (!t) return
    const next = [t, ...searchHistory.value.filter((x) => x !== t)].slice(0, 10)
    searchHistory.value = next
    saveJson(LS_SEARCH, next)
  }

  function clearSearchHistory() {
    searchHistory.value = []
    try {
      localStorage.removeItem(LS_SEARCH)
    } catch {
      /* ignore */
    }
  }

  function removeSearchOne(q) {
    searchHistory.value = searchHistory.value.filter((x) => x !== q)
    saveJson(LS_SEARCH, searchHistory.value)
  }

  function addRecentView(entry) {
    if (!entry?.id) return
    const row = {
      id: entry.id,
      title: entry.title || '',
      cover: entry.cover || '',
      at: new Date().toISOString(),
    }
    const rest = recentViews.value.filter((x) => x.id !== row.id)
    recentViews.value = [row, ...rest].slice(0, 20)
    saveJson(LS_RECENT, recentViews.value)
  }

  function clearRecentViews() {
    recentViews.value = []
    try {
      localStorage.removeItem(LS_RECENT)
    } catch {
      /* ignore */
    }
  }

  return {
    searchHistory,
    recentViews,
    addSearch,
    clearSearchHistory,
    removeSearchOne,
    addRecentView,
    clearRecentViews,
  }
})
