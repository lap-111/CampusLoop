<script setup>
import { computed, h, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElImage, ElLink, ElTag } from 'element-plus'
import { useProductStore } from '@/stores/product'
import { useHistoryStore } from '@/stores/history'
import { fetchHotKeywords } from '@/api/campusApi'
import { useGridVirtualizer } from '@/composables/useGridVirtualizer'

const route = useRoute()
const router = useRouter()
const store = useProductStore()
const history = useHistoryStore()

const listReady = ref(false)
const hotKeywords = ref([])

onMounted(async () => {
  try {
    const { keywords } = await fetchHotKeywords()
    hotKeywords.value = keywords
  } finally {
    listReady.value = true
  }
})

function runSearch() {
  history.addSearch(keyword.value)
}

function pickHistory(term) {
  keyword.value = term
  history.addSearch(term)
}

function pickHot(term) {
  keyword.value = term
}

const keyword = ref(route.query.q?.toString() ?? '')
const category = ref(route.query.cat?.toString() ?? '')
const zone = ref(route.query.zone?.toString() ?? '')
const sort = ref(route.query.sort?.toString() ?? 'time')
const viewMode = ref(route.query.view?.toString() === 'grid' ? 'grid' : 'table')

function syncQuery() {
  const q = {}
  if (keyword.value.trim()) q.q = keyword.value.trim()
  if (category.value) q.cat = category.value
  if (zone.value) q.zone = zone.value
  if (sort.value && sort.value !== 'time') q.sort = sort.value
  if (viewMode.value === 'grid') q.view = 'grid'
  router.replace({ query: q })
}

watch(
  () => [keyword.value, category.value, zone.value, sort.value, viewMode.value],
  () => syncQuery(),
  { flush: 'post' },
)

watch(
  () => route.query,
  (q) => {
    keyword.value = q.q?.toString() ?? ''
    category.value = q.cat?.toString() ?? ''
    zone.value = q.zone?.toString() ?? ''
    sort.value = q.sort?.toString() ?? 'time'
    viewMode.value = q.view?.toString() === 'grid' ? 'grid' : 'table'
  },
)

const filtered = computed(() => {
  let list = store.items
  const k = keyword.value.trim().toLowerCase()
  if (k) list = list.filter((x) => x.title.toLowerCase().includes(k))
  if (category.value) list = list.filter((x) => x.category === category.value)
  if (zone.value) list = list.filter((x) => x.zone === zone.value)
  return list
})

const sortedList = computed(() => {
  const list = [...filtered.value]
  if (sort.value === 'price_asc') list.sort((a, b) => a.price - b.price)
  else if (sort.value === 'price_desc') list.sort((a, b) => b.price - a.price)
  else list.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
  return list
})

const stats = computed(() => {
  const all = store.items
  const byCat = {}
  for (const it of all) {
    byCat[it.category] = (byCat[it.category] || 0) + 1
  }
  return { total: all.length, byCat }
})

function formatTime(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 86400000 * 2) return '昨天'
  return d.toLocaleDateString('zh-CN')
}

const columns = computed(() => [
  {
    key: 'cover',
    dataKey: 'cover',
    title: '预览',
    width: 104,
    cellRenderer: ({ cellData }) =>
      h(ElImage, {
        src: cellData,
        style: { width: '72px', height: '54px', borderRadius: '4px' },
        previewSrcList: [cellData],
        fit: 'cover',
        previewTeleported: true,
      }),
  },
  { key: 'title', dataKey: 'title', title: '标题', width: 220, flexGrow: 1 },
  {
    key: 'seller',
    dataKey: 'seller',
    title: '卖家',
    width: 88,
  },
  {
    key: 'zone',
    dataKey: 'zone',
    title: '校区',
    width: 100,
    cellRenderer: ({ cellData }) => h(ElTag, { size: 'small', type: 'success' }, () => cellData),
  },
  {
    key: 'category',
    dataKey: 'category',
    title: '分类',
    width: 80,
    cellRenderer: ({ cellData }) => h(ElTag, { size: 'small' }, () => cellData),
  },
  {
    key: 'price',
    dataKey: 'price',
    title: '价格',
    width: 88,
    cellRenderer: ({ rowData }) => h('span', { style: { color: 'var(--el-color-danger)', fontWeight: '600' } }, `¥${rowData.price}`),
  },
  {
    key: 'time',
    dataKey: 'postedAt',
    title: '发布',
    width: 100,
    cellRenderer: ({ cellData }) => h('span', { style: { fontSize: '12px', color: 'var(--el-text-color-secondary)' } }, formatTime(cellData)),
  },
  {
    key: 'op',
    title: '操作',
    width: 100,
    align: 'center',
    cellRenderer: ({ rowData }) =>
      h(
        ElLink,
        {
          type: 'primary',
          underline: 'never',
          onClick: () => router.push({ name: 'detail', params: { id: rowData.id } }),
        },
        () => '详情',
      ),
  },
])

const tableHeight = 480

const gridScrollRef = ref(null)
const gridVirtual = useGridVirtualizer(gridScrollRef, sortedList, { rowHeight: 224, overscan: 1 })
</script>

<template>
  <div class="list-page">
    <el-page-header class="page-head">
      <template #content>
        <div class="head-block">
          <span>表格虚拟滚动 + 卡片网格窗口化 · 筛选与排序写入 URL</span>
          <el-tag size="small" type="info" effect="plain">ElTableV2</el-tag>
          <el-tag size="small" type="success" effect="plain">卡片虚拟网格</el-tag>
        </div>
      </template>
    </el-page-header>

    <el-skeleton v-if="!listReady" animated :rows="10" class="list-skeleton" />

    <template v-else>
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="在售宝贝" :value="stats.total" />
        </el-card>
      </el-col>
      <el-col v-for="(n, c) in stats.byCat" :key="c" :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic :title="String(c)" :value="n" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="filter-card">
      <el-space wrap :size="12" alignment="center">
        <el-input
          v-model="keyword"
          clearable
          placeholder="搜索标题"
          style="width: 200px"
          @keyup.enter="runSearch"
        />
        <el-button type="primary" @click="runSearch">搜索</el-button>
        <el-select v-model="category" clearable placeholder="分类" style="width: 120px">
          <el-option label="教材" value="教材" />
          <el-option label="数码" value="数码" />
          <el-option label="日用" value="日用" />
          <el-option label="服饰" value="服饰" />
        </el-select>
        <el-select v-model="zone" clearable placeholder="交易片区" style="width: 130px">
          <el-option v-for="z in store.zones" :key="z" :label="z" :value="z" />
        </el-select>
        <el-select v-model="sort" placeholder="排序" style="width: 140px">
          <el-option label="最新发布" value="time" />
          <el-option label="价格从低到高" value="price_asc" />
          <el-option label="价格从高到低" value="price_desc" />
        </el-select>
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="table">表格</el-radio-button>
          <el-radio-button value="grid">卡片</el-radio-button>
        </el-radio-group>
        <el-text type="info" size="small">条件在地址栏，可分享书签</el-text>
      </el-space>
    </el-card>

    <el-card shadow="never" class="hint-card">
      <div class="hint-block">
        <span class="hint-label">搜索历史</span>
        <el-space wrap>
          <template v-if="history.searchHistory.length">
            <el-tag
              v-for="h in history.searchHistory"
              :key="h"
              closable
              @close="history.removeSearchOne(h)"
              @click="pickHistory(h)"
            >
              {{ h }}
            </el-tag>
            <el-button text type="danger" size="small" @click="history.clearSearchHistory">清空</el-button>
          </template>
          <el-text v-else type="info" size="small">输入关键词后点搜索或回车记录</el-text>
        </el-space>
      </div>
      <div class="hint-block">
        <span class="hint-label">热门词</span>
        <el-space wrap>
          <el-tag
            v-for="k in hotKeywords"
            :key="k"
            effect="plain"
            class="hot-tag"
            @click="pickHot(k)"
          >
            {{ k }}
          </el-tag>
        </el-space>
      </div>
    </el-card>

    <el-card v-show="viewMode === 'table'" shadow="never" class="table-card">
      <div class="table-wrap">
        <el-auto-resizer>
          <template #default="{ height, width }">
            <el-table-v2
              :columns="columns"
              :data="sortedList"
              :width="width"
              :height="Math.min(height, tableHeight)"
              fixed
              row-key="id"
            />
          </template>
        </el-auto-resizer>
      </div>
      <el-text v-if="sortedList.length === 0" class="empty-tip" type="warning">没有匹配的商品</el-text>
    </el-card>

    <div v-show="viewMode === 'grid'" class="grid-section">
      <el-empty v-if="sortedList.length === 0" description="没有匹配的商品" />
      <div v-else ref="gridScrollRef" class="grid-scroll" aria-label="商品卡片列表">
        <div
          class="virtual-grid-spacer"
          :style="{ height: `${gridVirtual.totalHeight}px`, position: 'relative' }"
        >
          <div
            class="virtual-grid-window"
            :style="{ top: `${gridVirtual.offsetY}px` }"
          >
            <div
              v-for="row in gridVirtual.visibleRows"
              :key="row.rowIndex"
              class="virtual-grid-row"
              :style="{
                height: `${gridVirtual.rowHeight}px`,
                display: 'grid',
                gridTemplateColumns: `repeat(${gridVirtual.cols}, minmax(0, 1fr))`,
                gap: '16px',
                boxSizing: 'border-box',
                alignContent: 'start',
              }"
            >
              <el-card
                v-for="it in row.items"
                :key="it.id"
                shadow="hover"
                class="goods-card"
                @click="router.push({ name: 'detail', params: { id: it.id } })"
              >
                <el-image :src="it.cover" fit="cover" class="goods-cover" lazy />
                <div class="goods-title">{{ it.title }}</div>
                <div class="goods-meta">
                  <span class="goods-price">¥{{ it.price }}</span>
                  <el-tag size="small">{{ it.category }}</el-tag>
                </div>
                <div class="goods-sub">{{ it.zone }} · {{ formatTime(it.postedAt) }}</div>
              </el-card>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.list-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head {
  padding: 0 4px;
}

.head-block {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.stat-row {
  width: 100%;
}

.stat-card {
  border-radius: 10px;
  margin-bottom: 0;
}

.stat-card :deep(.el-card__body) {
  padding: 16px;
}

.filter-card {
  border-radius: 10px;
}

.table-card {
  border-radius: 10px;
}

.table-wrap {
  height: 500px;
}

.empty-tip {
  display: block;
  margin-top: 12px;
}

.grid-section {
  min-height: 200px;
}

.grid-scroll {
  max-height: min(640px, calc(100vh - 280px));
  overflow: auto;
  overscroll-behavior: contain;
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  padding: 12px;
  box-sizing: border-box;
}

.virtual-grid-window {
  position: absolute;
  left: 0;
  right: 0;
}

.virtual-grid-spacer {
  min-height: 0;
}

.virtual-grid-row {
  padding-bottom: 0;
}

.goods-card {
  border-radius: 10px;
  margin-bottom: 0;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.goods-card:hover {
  transform: translateY(-2px);
}

.goods-cover {
  width: 100%;
  height: 140px;
  border-radius: 8px;
}

.goods-title {
  margin-top: 10px;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.goods-price {
  color: var(--el-color-danger);
  font-weight: 700;
  font-size: 16px;
}

.goods-sub {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.list-skeleton {
  padding: 8px 0;
}

.hint-card {
  border-radius: 10px;
}

.hint-block {
  margin-bottom: 12px;
}

.hint-block:last-child {
  margin-bottom: 0;
}

.hint-label {
  display: block;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.hot-tag {
  cursor: pointer;
}
</style>
