import { reactive } from 'vue'

type Toast = { id: number; type: 'success' | 'error' | 'info'; message: string; timeout?: number }

const state = reactive({ list: [] as Toast[], nextId: 1 })

export function useToast() {
  function add(type: Toast['type'], message: string, timeout = 3000) {
    const id = state.nextId++
    state.list.push({ id, type, message, timeout })
    if (timeout) setTimeout(() => remove(id), timeout)
  }
  function remove(id: number) {
    const idx = state.list.findIndex(t => t.id === id)
    if (idx >= 0) state.list.splice(idx, 1)
  }
  return {
    list: state.list,
    success: (m: string) => add('success', m),
    error: (m: string) => add('error', m),
    info: (m: string) => add('info', m),
    remove,
  }
}

