/* ─── CREDENCIALES (USERNAME + PASSWORD) ─── */

const CredentialsModule = {
  init() {
    document.getElementById('btnGenUsername').addEventListener('click', () => this.genUsername())
    document.getElementById('btnGenPassword').addEventListener('click', () => this.genPassword())
    document.getElementById('btnCopyPassword').addEventListener('click', () => this.copyPassword())
    document.getElementById('btnSaveCred').addEventListener('click', () => this.save())
    document.getElementById('credPwdLength').addEventListener('input', function () {
      document.getElementById('credPwdLengthVal').textContent = this.value
    })
    this.renderSaved()
  },

  genUsername() {
    const name = document.getElementById('credName').value.trim()
    if (!name) {
      document.getElementById('credName').focus()
      return
    }
    const parts = name.toLowerCase().split(/\s+/)
    const base = parts.length > 1 ? parts[0] + parts[parts.length - 1] : parts[0]
    const suffix = Math.random().toString(36).slice(2, 6)
    document.getElementById('credUsername').value = base + suffix
  },

  getPwdComplexity() {
    const length = parseInt(document.getElementById('credPwdLength').value) || 16
    const useUpper = document.getElementById('credChkUpper').checked
    const useLower = document.getElementById('credChkLower').checked
    const useNumber = document.getElementById('credChkNumber').checked
    const useSymbol = document.getElementById('credChkSymbol').checked
    return { length, useUpper, useLower, useNumber, useSymbol }
  },

  genPassword() {
    const { length, useUpper, useLower, useNumber, useSymbol } = this.getPwdComplexity()
    const pools = []
    if (useUpper) pools.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    if (useLower) pools.push('abcdefghijklmnopqrstuvwxyz')
    if (useNumber) pools.push('0123456789')
    if (useSymbol) pools.push('!@#$%&*')
    if (pools.length === 0) pools.push('abcdefghijklmnopqrstuvwxyz')

    let pwd = ''
    for (let i = 0; i < length; i++) {
      const pool = pools[Math.floor(Math.random() * pools.length)]
      pwd += pool.charAt(Math.floor(Math.random() * pool.length))
    }
    document.getElementById('credPassword').value = pwd
  },

  copyPassword() {
    const pwd = document.getElementById('credPassword').value
    if (!pwd) return
    navigator.clipboard.writeText(pwd).then(() => {
      alert(i18n.get('cred.copiedPwd'))
    }).catch(() => {
      alert(i18n.get('qr.copyError'))
    })
  },

  getFields() {
    const name = document.getElementById('credName').value.trim()
    const username = document.getElementById('credUsername').value.trim()
    const password = document.getElementById('credPassword').value.trim()
    return { name, role: '', username, password }
  },

  save() {
    const fields = this.getFields()
    if (!fields.name) {
      document.getElementById('credName').focus()
      return
    }
    if (!fields.username) this.genUsername()
    if (!fields.password) this.genPassword()

    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: Date.now(),
      name: fields.name,
      username: document.getElementById('credUsername').value.trim(),
      password: document.getElementById('credPassword').value.trim()
    }
    Storage.pushEntry('cred_history', entry)
    this.renderSaved()
  },

  renderSaved() {
    const list = document.getElementById('credSavedList')
    const container = document.getElementById('credSaved')
    const entries = Storage.get('cred_history', [])

    if (entries.length === 0) {
      container.style.display = 'none'
      return
    }
    container.style.display = 'block'

    list.innerHTML = entries.toReversed().map(e => `
      <div class="cred-saved__item" data-id="${e.id}">
        <div class="cred-saved__info">
          <div class="cred-saved__name">${this.escapeHtml(e.name)}</div>
          <div class="cred-saved__meta">${this.escapeHtml(e.username)} &bull; ${new Date(e.timestamp).toLocaleString()}</div>
        </div>
        <button class="cred-saved__delete" data-delete="${e.id}" title="Eliminar">&times;</button>
      </div>
    `).join('')

    list.querySelectorAll('.cred-saved__delete').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation()
        Storage.removeEntry('cred_history', btn.dataset.delete)
        this.renderSaved()
      })
    })
  },

  escapeHtml(str) {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }
}
