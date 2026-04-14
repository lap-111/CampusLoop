<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <el-result icon="error" title="404" sub-title="页面不存在或已移动">
    <template #extra>
      <el-button type="primary" @click="router.push({ name: 'list' })">回首页</el-button>
    </template>
  </el-result>
</template>
