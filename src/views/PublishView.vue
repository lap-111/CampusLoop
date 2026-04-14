<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProductStore } from '@/stores/product'

const router = useRouter()
const store = useProductStore()

const formRef = ref()
const form = reactive({
  title: '',
  price: null,
  category: '',
  zone: '',
  condition: '几乎全新',
  remark: '',
  photos: [],
})

const rules = {
  title: [{ required: true, message: '请填写标题', trigger: 'blur' }],
  price: [{ required: true, message: '请填写价格', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  zone: [{ required: true, message: '请选择交易片区', trigger: 'change' }],
}

let draftTimer = null
function scheduleDraftSave() {
  clearTimeout(draftTimer)
  draftTimer = setTimeout(() => {
    store.savePublishDraft({ ...form })
  }, 400)
}

watch(
  () => ({ ...form }),
  () => scheduleDraftSave(),
  { deep: true },
)

onMounted(() => {
  const d = store.loadPublishDraft()
  if (d && typeof d === 'object') {
    Object.assign(form, {
      title: d.title ?? '',
      price: d.price ?? null,
      category: d.category ?? '',
      zone: d.zone ?? '',
      condition: d.condition ?? '几乎全新',
      remark: d.remark ?? '',
      photos: Array.isArray(d.photos) ? d.photos : [],
    })
    ElMessage.info('已恢复上次未提交的草稿')
  }
})

function onSubmit() {
  formRef.value?.validate((ok) => {
    if (!ok) return
    const id = store.publishListing({ ...form })
    store.clearPublishDraft()
    Object.assign(form, {
      title: '',
      price: null,
      category: '',
      zone: '',
      condition: '几乎全新',
      remark: '',
      photos: [],
    })
    ElMessage.success('发布成功（已写入本地，可在「我的」查看）')
    router.push({ name: 'detail', params: { id } })
  })
}

function beforePhotoUpload(file) {
  const ok = file.type?.startsWith('image/')
  if (!ok) ElMessage.warning('请上传图片文件')
  return ok
}

function onPhotoChange(uploadFile) {
  const raw = uploadFile.raw
  if (!raw || !beforePhotoUpload(raw)) return
  if (form.photos.length >= 3) {
    ElMessage.warning('最多 3 张图片')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    if (form.photos.length < 3) form.photos.push(reader.result)
  }
  reader.readAsDataURL(raw)
}

function removePhoto(i) {
  form.photos.splice(i, 1)
}

function clearDraft() {
  ElMessageBox.confirm('确定清空草稿？', '提示', { type: 'warning' })
    .then(() => {
      store.clearPublishDraft()
      Object.assign(form, {
        title: '',
        price: null,
        category: '',
        zone: '',
        condition: '几乎全新',
        remark: '',
        photos: [],
      })
      ElMessage.success('草稿已清空')
    })
    .catch(() => {})
}
</script>

<template>
  <div class="publish-page">
    <el-page-header content="发布闲置">
      <template #extra>
        <el-button text type="primary" @click="clearDraft">清空草稿</el-button>
      </template>
    </el-page-header>

    <el-alert
      title="草稿会自动保存到浏览器 localStorage，关闭页面前可继续编辑"
      type="success"
      :closable="false"
      show-icon
      class="tip-alert"
    />

    <el-card shadow="never" class="card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px" class="form">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="40" show-word-limit placeholder="例如：大三数据结构教材" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :max="99999" :step="1" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择" style="width: 100%">
            <el-option label="教材" value="教材" />
            <el-option label="数码" value="数码" />
            <el-option label="日用" value="日用" />
            <el-option label="服饰" value="服饰" />
          </el-select>
        </el-form-item>
        <el-form-item label="交易片区" prop="zone">
          <el-select v-model="form.zone" placeholder="请选择碰头区域" style="width: 100%">
            <el-option v-for="z in store.zones" :key="z" :label="z" :value="z" />
          </el-select>
        </el-form-item>
        <el-form-item label="成色" prop="condition">
          <el-radio-group v-model="form.condition">
            <el-radio value="几乎全新">几乎全新</el-radio>
            <el-radio value="轻微使用痕迹">轻微使用痕迹</el-radio>
            <el-radio value="功能正常">功能正常</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="补充说明" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="5" placeholder="成色细节、配件是否齐全、能否小刀等" />
        </el-form-item>
        <el-form-item label="商品图">
          <div class="photo-row">
            <div v-for="(url, i) in form.photos" :key="i" class="photo-tile">
              <el-image :src="url" fit="cover" class="photo-img" :preview-src-list="form.photos" :initial-index="i" />
              <el-button class="photo-del" type="danger" size="small" circle @click="removePhoto(i)">×</el-button>
            </div>
            <el-upload
              v-if="form.photos.length < 3"
              class="photo-uploader"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              :on-change="onPhotoChange"
            >
              <el-button type="default">上传（最多3张）</el-button>
            </el-upload>
          </div>
          <el-text type="info" size="small">本地 Base64 预览，演示用；草稿会一并保存</el-text>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">发布</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.publish-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-alert {
  border-radius: 10px;
}

.card {
  border-radius: 10px;
}

.form {
  max-width: 600px;
}

.photo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}

.photo-tile {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
}

.photo-img {
  width: 100px;
  height: 100px;
}

.photo-del {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 24px;
  padding: 0;
}
</style>
