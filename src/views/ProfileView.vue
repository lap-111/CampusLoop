<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProductStore } from '@/stores/product'
import { useAppStore } from '@/stores/app'
import { useHistoryStore } from '@/stores/history'

const router = useRouter()
const store = useProductStore()
const app = useAppStore()
const history = useHistoryStore()

const activeTab = ref('fav')
const nickInput = ref(app.nickname)

const favItems = computed(() =>
  store.favoriteIds.map((id) => store.getById(id)).filter(Boolean),
)

const mineItems = computed(() => store.myListings())

function saveNick() {
  app.setNickname(nickInput.value)
  ElMessage.success('昵称已更新（仅本地展示）')
}

function clearAllLocal() {
  ElMessageBox.confirm(
    '将清除收藏、浏览计数、我的发布与发布草稿，是否继续？',
    '危险操作',
    { type: 'warning' },
  )
    .then(() => {
      try {
        ;[
          'cl-favorites',
          'cl-published',
          'cl-extra-views',
          'cl-publish-draft',
          'cl-search-history',
          'cl-recent-views',
        ].forEach((k) => localStorage.removeItem(k))
      } catch {
        /* ignore */
      }
      location.reload()
    })
    .catch(() => {})
}
</script>

<template>
  <div class="profile-page">
    <el-page-header content="个人中心" />

    <el-card shadow="never" class="card">
      <template #header>
        <span>账号与外观</span>
      </template>
      <el-form label-width="88px" class="settings-form" @submit.prevent>
        <el-form-item label="昵称">
          <el-input v-model="nickInput" maxlength="12" show-word-limit style="max-width: 240px" />
          <el-button style="margin-left: 8px" @click="saveNick">保存</el-button>
        </el-form-item>
        <el-form-item label="主题">
          <el-switch v-model="app.darkMode" active-text="深色" inactive-text="浅色" />
        </el-form-item>
        <el-form-item label="数据">
          <el-button type="danger" plain @click="clearAllLocal">重置本地数据</el-button>
          <el-text type="info" size="small" style="margin-left: 12px">收藏、发布记录等均存于本机</el-text>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="我的收藏" name="fav">
          <el-empty v-if="favItems.length === 0" description="暂无收藏，在详情页点击「收藏」" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="it in favItems"
              :key="it.id"
              :timestamp="it.category"
              placement="top"
            >
              <el-link type="primary" @click="router.push({ name: 'detail', params: { id: it.id } })">
                {{ it.title }} · ¥{{ it.price }}
              </el-link>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
        <el-tab-pane label="我发布的" name="mine">
          <el-empty v-if="mineItems.length === 0" description="去「发布」页上架第一件宝贝吧" />
          <el-table v-else :data="mineItems" size="small" stripe style="width: 100%">
            <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
            <el-table-column prop="price" label="价格" width="90">
              <template #default="{ row }">¥{{ row.price }}</template>
            </el-table-column>
            <el-table-column prop="category" label="分类" width="88" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button link type="primary" @click="router.push({ name: 'detail', params: { id: row.id } })">
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="浏览足迹" name="footprint">
          <el-space direction="vertical" alignment="stretch" style="width: 100%">
            <div>
              <el-text tag="b">最近浏览</el-text>
              <el-button
                v-if="history.recentViews.length"
                text
                type="danger"
                size="small"
                style="margin-left: 12px"
                @click="history.clearRecentViews"
              >
                清空
              </el-button>
            </div>
            <el-empty v-if="!history.recentViews.length" description="进入商品详情后会自动记录" />
            <el-row v-else :gutter="12">
              <el-col v-for="r in history.recentViews" :key="r.id" :xs="12" :sm="8" :md="6">
                <div class="fp-card" @click="router.push({ name: 'detail', params: { id: r.id } })">
                  <el-image :src="r.cover" fit="cover" class="fp-cover" lazy />
                  <div class="fp-title">{{ r.title }}</div>
                </div>
              </el-col>
            </el-row>
            <el-divider />
            <div>
              <el-text tag="b">搜索历史</el-text>
              <el-button
                v-if="history.searchHistory.length"
                text
                type="danger"
                size="small"
                style="margin-left: 12px"
                @click="history.clearSearchHistory"
              >
                清空
              </el-button>
            </div>
            <el-space v-if="history.searchHistory.length" wrap>
              <el-tag
                v-for="h in history.searchHistory"
                :key="h"
                closable
                @close="history.removeSearchOne(h)"
                @click="router.push({ path: '/', query: { q: h } })"
              >
                {{ h }}
              </el-tag>
            </el-space>
            <el-empty v-else description="在首页搜索框回车或点搜索会记录" />
          </el-space>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  border-radius: 10px;
}

.settings-form {
  max-width: 560px;
}

.fp-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  margin-bottom: 8px;
}

.fp-cover {
  width: 100%;
  height: 80px;
}

.fp-title {
  font-size: 12px;
  padding: 6px 8px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
