<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useHistoryStore } from '@/stores/history'

const route = useRoute()
const router = useRouter()
const store = useProductStore()
const history = useHistoryStore()

const item = computed(() => store.getById(route.params.id))
const gallery = computed(() => {
  const it = item.value
  if (!it) return []
  if (Array.isArray(it.images) && it.images.length) return it.images
  return [it.cover]
})
const related = computed(() => (item.value ? store.getRelated(item.value.id, 4) : []))
const viewCount = computed(() => (item.value ? store.displayViews(item.value.id) : 0))

onMounted(() => {
  const id = route.params.id
  if (id) store.recordView(id)
  const it = store.getById(id)
  if (it) {
    history.addRecentView({ id: it.id, title: it.title, cover: it.cover })
  }
})

function onFavorite() {
  if (!item.value) return
  store.toggleFavorite(item.value.id)
}

function formatFullTime(iso) {
  return new Date(iso).toLocaleString('zh-CN')
}
</script>

<template>
  <div v-if="item" class="detail-page">
    <el-page-header @back="router.back()">
      <template #content>
        <span>商品详情</span>
        <el-tag v-if="item.isMine" size="small" type="warning" style="margin-left: 10px">我发布的</el-tag>
      </template>
    </el-page-header>

    <el-card shadow="never" class="detail-card">
      <el-row :gutter="24">
        <el-col :xs="24" :md="11">
          <el-carousel height="280px" indicator-position="outside" :interval="5000">
            <el-carousel-item v-for="(img, i) in gallery" :key="i">
              <el-image :src="img" fit="cover" class="carousel-img" :preview-src-list="gallery" :initial-index="i" preview-teleported />
            </el-carousel-item>
          </el-carousel>
        </el-col>
        <el-col :xs="24" :md="13">
          <h2 class="title">{{ item.title }}</h2>
          <div class="tags">
            <el-tag>{{ item.category }}</el-tag>
            <el-tag type="success">{{ item.zone }}</el-tag>
            <el-tag type="info">{{ item.condition }}</el-tag>
            <el-tag v-if="item.status" type="warning">{{ item.status }}</el-tag>
          </div>
          <div class="price-row">
            <span class="price">¥{{ item.price }}</span>
            <el-text size="small" type="info">浏览 {{ viewCount }}</el-text>
          </div>
          <el-descriptions :column="1" size="small" border class="desc-block">
            <el-descriptions-item label="卖家">{{ item.seller }}</el-descriptions-item>
            <el-descriptions-item label="发布时间">{{ formatFullTime(item.postedAt) }}</el-descriptions-item>
            <el-descriptions-item label="建议面交">{{ item.zone }} 附近，双方协商具体时间</el-descriptions-item>
          </el-descriptions>
          <p class="desc">{{ item.desc }}</p>
          <el-space wrap>
            <el-button type="primary" size="large" @click="onFavorite">
              {{ store.isFavorite(item.id) ? '已收藏' : '收藏' }}
            </el-button>
            <el-button size="large" @click="router.push({ name: 'list' })">返回列表</el-button>
            <el-button v-if="item.isMine" type="danger" plain size="large" disabled>删除（演示未接接口）</el-button>
          </el-space>
        </el-col>
      </el-row>
    </el-card>

    <el-card v-if="related.length" shadow="never" class="related-card">
      <template #header>
        <span>猜你喜欢</span>
        <el-text type="info" size="small" style="margin-left: 8px">同分类推荐</el-text>
      </template>
      <el-row :gutter="12">
        <el-col v-for="r in related" :key="r.id" :xs="12" :sm="6">
          <div class="related-item" @click="router.push({ name: 'detail', params: { id: r.id } })">
            <el-image :src="r.cover" fit="cover" class="related-cover" lazy />
            <div class="related-title">{{ r.title }}</div>
            <div class="related-price">¥{{ r.price }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
  <el-result v-else icon="warning" title="未找到该商品" sub-title="请从列表重新进入">
    <template #extra>
      <el-button type="primary" @click="router.push({ name: 'list' })">回首页</el-button>
    </template>
  </el-result>
</template>

<style scoped lang="scss">
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-card,
.related-card {
  border-radius: 10px;
}

.carousel-img {
  width: 100%;
  height: 280px;
  border-radius: 8px;
}

.title {
  margin: 0 0 12px;
  font-size: 22px;
  line-height: 1.3;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 12px;
}

.price {
  font-size: 32px;
  color: var(--el-color-danger);
  font-weight: 700;
}

.desc-block {
  margin-bottom: 12px;
}

.desc {
  color: var(--el-text-color-regular);
  line-height: 1.7;
  margin: 0 0 20px;
}

.related-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  padding-bottom: 8px;
  transition: box-shadow 0.15s ease;
}

.related-item:hover {
  box-shadow: var(--el-box-shadow-light);
}

.related-cover {
  width: 100%;
  height: 100px;
}

.related-title {
  font-size: 13px;
  padding: 8px 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
}

.related-price {
  padding: 4px 8px 0;
  color: var(--el-color-danger);
  font-weight: 600;
}
</style>
