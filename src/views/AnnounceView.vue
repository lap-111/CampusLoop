<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnnounceStore } from '@/stores/announce'
import { fetchHealthCheck } from '@/api/campusApi'
import { ElMessage } from 'element-plus'

const router = useRouter()
const announce = useAnnounceStore()

onMounted(() => {
  if (!announce.loaded) announce.load()
})

async function tryBrokenApi() {
  await fetchHealthCheck()
  ElMessage.info('已触发 /api/health 请求（无后端时会走错误拦截）')
}
</script>

<template>
  <div class="announce-page">
    <el-page-header content="校园公告" />

    <el-card shadow="never" class="card">
      <el-space direction="vertical" alignment="stretch" style="width: 100%">
        <el-alert
          title="公告列表由 fetchAnnouncements Mock 延迟返回，演示请求层与加载态"
          type="info"
          :closable="false"
          show-icon
        />
        <div>
          <el-button type="primary" link @click="tryBrokenApi">演示 axios 错误拦截</el-button>
          <el-button v-if="announce.unreadCount" type="primary" link @click="announce.markAllRead">
            全部标为已读
          </el-button>
        </div>
      </el-space>
    </el-card>

    <el-skeleton v-if="announce.loading" :rows="4" animated />

    <el-card v-else shadow="never" class="card">
      <el-timeline>
        <el-timeline-item
          v-for="a in announce.list"
          :key="a.id"
          :timestamp="new Date(a.date).toLocaleString('zh-CN')"
          placement="top"
          :type="a.read ? 'info' : 'primary'"
          :hollow="a.read"
        >
          <div class="item-head">
            <strong>{{ a.title }}</strong>
            <el-tag v-if="!a.read" size="small" type="danger" effect="plain">未读</el-tag>
          </div>
          <p class="summary">{{ a.summary }}</p>
          <el-button v-if="!a.read" size="small" text type="primary" @click="announce.markRead(a.id)">
            标为已读
          </el-button>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <el-button class="back" @click="router.push({ name: 'list' })">回首页</el-button>
  </div>
</template>

<style scoped lang="scss">
.announce-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  border-radius: 10px;
}

.item-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.summary {
  margin: 0 0 8px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  font-size: 14px;
}

.back {
  align-self: flex-start;
}
</style>
