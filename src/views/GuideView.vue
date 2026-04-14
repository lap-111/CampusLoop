<script setup>
const tips = [
  {
    title: '当面交易',
    body: '优先选择校内公共场所完成交接，避免单独前往偏僻地点。现金或校内常用转账方式均可，付款前务必验货。',
  },
  {
    title: '信息真实',
    body: '如实描述成色与瑕疵，附带清晰照片。若价格可议，可在补充说明里写明「可小刀」避免反复沟通。',
  },
  {
    title: '防骗提醒',
    body: '拒绝提前支付「定金」给陌生人、拒绝点击不明链接。教材类交易可核对封面版次与 ISBN。',
  },
  {
    title: '本演示说明',
    body: 'CampusLoop 为前端练习项目：无真实后端，发布与收藏数据保存在浏览器 localStorage，换设备或清除站点数据后会丢失。',
  },
]
</script>

<template>
  <div class="guide-page">
    <el-page-header content="校园二手交易指南" />
    <el-card shadow="never" class="card">
      <el-collapse>
        <el-collapse-item v-for="(t, i) in tips" :key="i" :title="t.title" :name="i">
          <p class="body">{{ t.body }}</p>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.guide-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  border-radius: 10px;
}

.body {
  margin: 0;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}
</style>