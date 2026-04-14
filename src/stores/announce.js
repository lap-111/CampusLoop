import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchAnnouncements } from '@/api/campusApi'

export const useAnnounceStore = defineStore('announce', () => {
  const list = ref([])
  const loading = ref(false)
  const loaded = ref(false)

  const unreadCount = computed(() => list.value.filter((x) => !x.read).length)

  async function load() {
    if (loading.value) return
    loading.value = true
    try {
      const { list: rows } = await fetchAnnouncements()
      list.value = rows
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  function markRead(id) {
    list.value = list.value.map((x) => (x.id === id ? { ...x, read: true } : x))
  }

  function markAllRead() {
    list.value = list.value.map((x) => ({ ...x, read: true }))
  }

  return {
    list,
    loading,
    loaded,
    unreadCount,
    load,
    markRead,
    markAllRead,
  }
})
