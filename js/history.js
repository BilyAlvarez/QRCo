/* ─── HISTORY ─── */

const History = {
  modal: null,
  currentTab: 'qr',

  init() {
    this.modal = document.getElementById('historyModal')

    document.getElementById('btnHistory').addEventListener('click', () => this.open())
    document.getElementById('historyClose').addEventListener('click', () => this.close())
    document.getElementById('historyModal').addEventListener('click', e => {
      if (e.target.classList.contains('modal__backdrop')) this.close()
    })
    document.getElementById('historyClear').addEventListener('click', () => this.clearAll())
    document.querySelectorAll('[data-history-tab]').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.historyTab))
    })
  },

  open() {
    this.modal.style.display = 'flex'
    this.render()
  },

  close() {
    this.modal.style.display = 'none'
  },

  switchTab(tab) {
    this.currentTab = tab
    document.querySelectorAll('[data-history-tab]').forEach(btn => {
      btn.classList.toggle('history-tabs__item--active', btn.dataset.historyTab === tab)
    })
    this.render()
  },

  render() {
    const list = document.getElementById('historyList')
    const keyMap = { qr: 'qr_history', cred: 'cred_history', carnet: 'carnet_history' }
    const key = keyMap[this.currentTab] || 'qr_history'
    const entries = Storage.get(key, [])

    if (entries.length === 0) {
      list.innerHTML = `<p class="history-list__empty" data-i18n="history.empty">${i18n.get('history.empty')}</p>`
      return
    }

    list.innerHTML = entries.toReversed().map(entry => {
      let title, meta
      if (this.currentTab === 'qr') {
        title = entry.url
        meta = `${new Date(entry.timestamp).toLocaleString()} — ${entry.params?.size || 256}px`
      } else if (this.currentTab === 'cred') {
        title = entry.name
        meta = `${new Date(entry.timestamp).toLocaleString()} — ${entry.username || ''}`
      } else {
        title = (entry.name || '') + ' — ' + (entry.org || '')
        meta = `${new Date(entry.timestamp).toLocaleString()} — ${entry.level || 'standard'}`
      }

      const thumb = entry.thumbnail_b64
        ? `<img src="${entry.thumbnail_b64}" alt="Thumbnail" />`
        : ''

      return `
        <div class="history-item" data-id="${entry.id}" data-tab="${this.currentTab}">
          <div class="history-item__thumb">${thumb}</div>
          <div class="history-item__info">
            <div class="history-item__title">${this.escapeHtml(title)}</div>
            <div class="history-item__meta">${meta}</div>
          </div>
          <button class="history-item__delete" data-delete="${entry.id}" title="Eliminar">&times;</button>
        </div>
      `
    }).join('')

    list.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.closest('.history-item__delete')) return
        this.reopen(item.dataset.id)
      })
    })

    list.querySelectorAll('.history-item__delete').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation()
        this.removeEntry(btn.dataset.delete)
      })
    })
  },

  reopen(id) {
    const keyMap = { qr: 'qr_history', cred: 'cred_history', carnet: 'carnet_history' }
    const key = keyMap[this.currentTab] || 'qr_history'
    const entries = Storage.get(key, [])
    const entry = entries.find(e => e.id === id)
    if (!entry) return

    this.close()

    if (this.currentTab === 'qr') {
      document.getElementById('qrInput').value = entry.url
      if (entry.params) {
        document.getElementById('qrErrorLevel').value = entry.params.errorLevel || 'M'
        document.getElementById('qrSize').value = entry.params.size || '256'
        document.getElementById('qrMargin').value = entry.params.margin || '2'
        document.getElementById('qrFgColor').value = entry.params.fgColor || '#000000'
        document.getElementById('qrBgColor').value = entry.params.bgColor || '#ffffff'
      }
      switchSection('qr')
      setTimeout(() => document.getElementById('btnGenerateQr').click(), 100)
    } else if (this.currentTab === 'cred') {
      document.getElementById('credName').value = entry.name || ''
      document.getElementById('credUsername').value = entry.username || ''
      document.getElementById('credPassword').value = entry.password || ''
      switchSection('credenciales')
    } else {
      document.getElementById('carnetName').value = entry.name || ''
      document.getElementById('carnetUsername').value = entry.username || ''
      document.getElementById('carnetOrg').value = entry.org || ''
      document.getElementById('carnetAccent').value = entry.accent || '#6366f1'
      document.getElementById('carnetLevel').value = entry.level || 'standard'
      document.getElementById('carnetText').value = entry.text || ''
      if (entry.orientation) {
        CarnetModule._orientation = entry.orientation
        document.querySelectorAll('.carnet-form__orient-btn').forEach(b =>
          b.classList.toggle('carnet-form__orient-btn--active', b.dataset.orient === entry.orientation))
      }
      switchSection('carnet')
      setTimeout(() => document.getElementById('btnGenCarnet').click(), 100)
    }
  },

  removeEntry(id) {
    const keyMap = { qr: 'qr_history', cred: 'cred_history', carnet: 'carnet_history' }
    const key = keyMap[this.currentTab] || 'qr_history'
    Storage.removeEntry(key, id)
    this.render()
  },

  clearAll() {
    if (!confirm(i18n.get('history.confirmClear'))) return
    const keyMap = { qr: 'qr_history', cred: 'cred_history', carnet: 'carnet_history' }
    const key = keyMap[this.currentTab] || 'qr_history'
    Storage.clear(key)
    this.render()
  },

  escapeHtml(str) {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }
}
