import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const LS_FAV = 'cl-favorites'
const LS_PUB = 'cl-published'
const LS_VIEWS = 'cl-extra-views'
const LS_DRAFT = 'cl-publish-draft'

const ZONES = ['东区宿舍', '西区宿舍', '图书馆', '体育馆', '北门广场']

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

function mockItems() {
  const categories = ['教材', '数码', '日用', '服饰']
  const titles = ['高等数学同济版', 'iPad 保护壳', '台灯', '蓝牙耳机', '数据结构笔记']
  return Array.from({ length: 80 }, (_, i) => {
    const dayOff = Math.floor(i / 3)
    const posted = new Date(Date.now() - dayOff * 86400000 - (i % 7) * 3600000)
    return {
      id: String(i + 1),
      title: `${titles[i % titles.length]} #${i + 1}`,
      price: Math.round(10 + Math.random() * 200),
      category: categories[i % categories.length],
      cover: `https://picsum.photos/seed/campus${i}/400/300`,
      images: [
        `https://picsum.photos/seed/campus${i}a/800/600`,
        `https://picsum.photos/seed/campus${i}b/800/600`,
      ],
      desc: '校园自提，成色如图。建议图书馆或宿舍区当面交易，付款前请验货。',
      seller: `同学${String((i % 40) + 1).padStart(2, '0')}`,
      zone: ZONES[i % ZONES.length],
      postedAt: posted.toISOString(),
      views: Math.floor(15 + Math.random() * 400),
      condition: ['几乎全新', '轻微使用痕迹', '功能正常'][i % 3],
      status: '在售',
      isMine: false,
    }
  })
}

function mergeItemList(published, mock) {
  const map = new Map()
  for (const it of mock) map.set(it.id, { ...it })
  for (const it of published) map.set(it.id, { ...it })
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
  )
}

export const useProductStore = defineStore('product', () => {
  const published = ref(loadJson(LS_PUB, []))
  const baseMock = mockItems()
  const items = ref(mergeItemList(published.value, baseMock))

  const favIds = ref(loadJson(LS_FAV, []))
  const extraViews = ref(loadJson(LS_VIEWS, {}))

  function persistPublished() {
    saveJson(LS_PUB, published.value)
    items.value = mergeItemList(published.value, baseMock)
  }

  const favoriteIds = computed(() => [...favIds.value])

  function toggleFavorite(id) {
    const s = new Set(favIds.value)
    if (s.has(id)) s.delete(id)
    else s.add(id)
    favIds.value = Array.from(s)
    saveJson(LS_FAV, favIds.value)
  }

  function isFavorite(id) {
    return favIds.value.includes(id)
  }

  function getById(id) {
    return items.value.find((x) => x.id === id) ?? null
  }

  function recordView(id) {
    extraViews.value = {
      ...extraViews.value,
      [id]: (extraViews.value[id] || 0) + 1,
    }
    saveJson(LS_VIEWS, extraViews.value)
  }

  function displayViews(id) {
    const it = getById(id)
    if (!it) return 0
    return (it.views || 0) + (extraViews.value[id] || 0)
  }

  function getRelated(id, limit = 4) {
    const it = getById(id)
    if (!it) return []
    return items.value
      .filter((x) => x.id !== id && x.category === it.category)
      .slice(0, limit)
  }

  function myListings() {
    return items.value.filter((x) => x.isMine)
  }

  function savePublishDraft(draft) {
    saveJson(LS_DRAFT, draft)
  }

  function loadPublishDraft() {
    return loadJson(LS_DRAFT, null)
  }

  function clearPublishDraft() {
    try {
      localStorage.removeItem(LS_DRAFT)
    } catch {
      /* ignore */
    }
  }

  function publishListing(data) {
    const id = `u${Date.now()}`
    const now = new Date().toISOString()
    const item = {
      id,
      title: data.title,
      price: Number(data.price),
      category: data.category,
      cover:
        Array.isArray(data.photos) && data.photos.length
          ? data.photos[0]
          : `https://picsum.photos/seed/${id}/400/300`,
      images:
        Array.isArray(data.photos) && data.photos.length
          ? data.photos
          : [`https://picsum.photos/seed/${id}a/800/600`],
      desc: data.remark?.trim() || '卖家未填写详细描述。',
      seller: '我',
      zone: data.zone || ZONES[0],
      postedAt: now,
      views: 0,
      condition: data.condition || '几乎全新',
      status: '在售',
      isMine: true,
    }
    published.value = [item, ...published.value]
    persistPublished()
    return id
  }

  return {
    items,
    published,
    favIds,
    favoriteIds,
    toggleFavorite,
    isFavorite,
    getById,
    recordView,
    displayViews,
    getRelated,
    myListings,
    publishListing,
    savePublishDraft,
    loadPublishDraft,
    clearPublishDraft,
    zones: ZONES,
  }
})
