import http from './http'

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchAnnouncements() {
  await delay(450)
  return {
    list: [
      {
        id: 'a1',
        title: '关于加强线下交易安全的倡议',
        summary: '建议在校内公共场所完成交接，谨防各类诈骗。',
        date: new Date().toISOString(),
        read: false,
      },
      {
        id: 'a2',
        title: '教材流转周（演示活动文案）',
        summary: '无真实活动，仅作前端展示占位。',
        date: new Date(Date.now() - 86400000).toISOString(),
        read: false,
      },
      {
        id: 'a3',
        title: '数据存储说明',
        summary: '发布、收藏等数据保存在本机浏览器 localStorage。',
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
        read: true,
      },
    ],
  }
}

export async function fetchHotKeywords() {
  await delay(280)
  return {
    keywords: ['教材', '台灯', '耳机', 'iPad', '数据结构', '高数', '充电器'],
  }
}

export function fetchHealthCheck() {
  return http.get('/health', { silent: false }).catch(() => null)
}