<script setup>
import { computed, onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useAppStore } from '@/stores/app'
import { useAnnounceStore } from '@/stores/announce'

const route = useRoute()
const router = useRouter()
const app = useAppStore()
const announce = useAnnounceStore()

onMounted(() => {
  announce.load()
})

const activeMenu = computed(() => {
  if (route.path.startsWith('/item')) return '/'
  if (route.path === '/guide') return '/guide'
  if (route.path === '/announce') return '/announce'
  return route.path === '' ? '/' : route.path
})

function goAnnounce() {
  router.push({ name: 'announce' })
}
</script>

<template>
  <el-config-provider :locale="zhCn" namespace="el">
    <div class="app-shell">
      <el-header class="app-header" height="56px">
        <router-link to="/" class="brand-link">
          <div class="brand">CampusLoop</div>
          <span class="brand-sub">校园闲置</span>
        </router-link>
        <el-menu
          :key="activeMenu"
          class="app-menu"
          mode="horizontal"
          :ellipsis="false"
          :router="true"
          :default-active="activeMenu"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/publish">发布</el-menu-item>
          <el-menu-item index="/profile">我的</el-menu-item>
          <el-menu-item index="/guide">交易指南</el-menu-item>
        </el-menu>
        <div class="header-actions">
          <el-badge :value="announce.unreadCount" :hidden="announce.unreadCount === 0" class="bell-badge">
            <el-button circle size="small" title="校园公告" @click="goAnnounce">
              <span class="bell-icon" aria-hidden="true">🔔</span>
            </el-button>
          </el-badge>
          <span class="hi">{{ app.nickname }}</span>
          <el-switch
            v-model="app.darkMode"
            inline-prompt
            active-text="暗"
            inactive-text="亮"
            size="small"
          />
        </div>
      </el-header>
      <el-main class="app-main">
        <router-view v-slot="{ Component, route: r }">
          <keep-alive>
            <component
              :is="Component"
              v-if="r.meta.keepAlive"
              :key="r.fullPath"
            />
          </keep-alive>
          <component
            :is="Component"
            v-if="!r.meta.keepAlive"
            :key="r.fullPath"
          />
        </router-view>
      </el-main>
      <el-footer class="app-footer" height="auto">
        <div class="footer-inner">
          <span>CampusLoop · 纯前端演示项目</span>
          <el-divider direction="vertical" />
          <span>数据为 Mock + localStorage，刷新后部分状态会保留</span>
        </div>
      </el-footer>
    </div>
  </el-config-provider>
</template>

<style scoped lang="scss">
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--cl-bg, #f5f7fa);
}

.app-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 16px 0 20px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.brand-link {
  display: flex;
  align-items: baseline;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
}

.brand {
  font-weight: 700;
  font-size: 18px;
  color: var(--el-color-primary);
  white-space: nowrap;
}

.brand-sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.app-menu {
  flex: 1;
  border-bottom: none !important;
  min-width: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.bell-badge :deep(.el-badge__content) {
  transform: translateY(-2px) translateX(4px);
}

.bell-icon {
  font-size: 16px;
  line-height: 1;
}

.hi {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-main {
  flex: 1;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  padding-bottom: 24px;
}

.app-footer {
  padding: 12px 16px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
  line-height: 1.6;
}
</style>
