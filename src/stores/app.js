import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const LS_THEME = 'cl-theme'

function loadTheme() {
  try {
    return localStorage.getItem(LS_THEME) === 'dark'
  } catch {
    return false
  }
}

function saveTheme(dark) {
  try {
    localStorage.setItem(LS_THEME, dark ? 'dark' : 'light')
  } catch {
    /* ignore */
  }
}

function applyDom(dark) {
  document.documentElement.classList.toggle('dark', dark)
}

export const useAppStore = defineStore('app', () => {
  const darkMode = ref(loadTheme())
  const nickname = ref('访客同学')

  applyDom(darkMode.value)

  watch(darkMode, (v) => {
    saveTheme(v)
    applyDom(v)
  })

  function toggleDark() {
    darkMode.value = !darkMode.value
  }

  function setNickname(name) {
    nickname.value = name?.trim() || '访客同学'
  }

  return { darkMode, nickname, toggleDark, setNickname }
})
