/* ─── STORAGE ─── */

const MAX_HISTORY = 50

const Storage = {
  get(key, fallback = null) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : fallback
    } catch {
      return fallback
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.warn('Storage full, clearing oldest entries')
      if (key.endsWith('_history')) {
        const entries = this.get(key, [])
        while (entries.length > Math.floor(MAX_HISTORY / 2)) {
          entries.shift()
        }
        try {
          localStorage.setItem(key, JSON.stringify(entries))
        } catch {}
      }
    }
  },

  pushEntry(key, entry) {
    const entries = this.get(key, [])
    entries.push(entry)
    if (entries.length > MAX_HISTORY) {
      entries.splice(0, entries.length - MAX_HISTORY)
    }
    this.set(key, entries)
  },

  removeEntry(key, id) {
    let entries = this.get(key, [])
    entries = entries.filter(e => e.id !== id)
    this.set(key, entries)
  },

  clear(key) {
    localStorage.removeItem(key)
  },

  getUser() {
    return this.get('app_user', null)
  },

  setUser(data) {
    this.set('app_user', data)
  }
}
