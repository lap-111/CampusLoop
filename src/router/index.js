import { createRouter, createWebHistory } from 'vue-router'

const ListView = () => import('@/views/ListView.vue')
const DetailView = () => import('@/views/DetailView.vue')
const PublishView = () => import('@/views/PublishView.vue')
const ProfileView = () => import('@/views/ProfileView.vue')
const GuideView = () => import('@/views/GuideView.vue')
const AnnounceView = () => import('@/views/AnnounceView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, left: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'list',
      component: ListView,
      meta: { title: '闲置列表', keepAlive: true },
    },
    {
      path: '/item/:id',
      name: 'detail',
      component: DetailView,
      meta: { title: '商品详情' },
    },
    {
      path: '/publish',
      name: 'publish',
      component: PublishView,
      meta: { title: '发布闲置' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { title: '个人中心' },
    },
    {
      path: '/guide',
      name: 'guide',
      component: GuideView,
      meta: { title: '交易指南' },
    },
    {
      path: '/announce',
      name: 'announce',
      component: AnnounceView,
      meta: { title: '校园公告' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: { title: '页面不存在' },
    },
  ],
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} · CampusLoop`
  }
})

export default router
