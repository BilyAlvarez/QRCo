/* ─── CARNET (PHYSICAL CARD) ─── */

const CarnetModule = {
  _photoDataURL: null,
  _orientation: 'horizontal',

  init() {

    document.getElementById('carnetPhoto').addEventListener('change', e => {
      const file = e.target.files[0]
      if (!file) { this._photoDataURL = null; return }
      const reader = new FileReader()
      reader.onload = ev => {
        this._photoDataURL = ev.target.result
        document.getElementById('carnetPhotoPreview').innerHTML =
          `<img src="${ev.target.result}" alt="Preview" />`
      }
      reader.readAsDataURL(file)
    })

    document.querySelectorAll('.carnet-form__orient-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.carnet-form__orient-btn').forEach(b =>
          b.classList.remove('carnet-form__orient-btn--active'))
        btn.classList.add('carnet-form__orient-btn--active')
        this._orientation = btn.dataset.orient
      })
    })

    document.getElementById('btnGenCarnet').addEventListener('click', () => this.generate())
    document.getElementById('carnetExportPng').addEventListener('click', () => this.exportPng())
    document.getElementById('carnetExportPdf').addEventListener('click', () => this.exportPdf())
    document.getElementById('carnetFlipCard').addEventListener('click', () => this.flipCard())
  },

  generate() {
    const errorEl = document.getElementById('carnetError')
    const name = document.getElementById('carnetName').value.trim()
    const username = document.getElementById('carnetUsername').value.trim()
    const org = document.getElementById('carnetOrg').value.trim()

    if (!name) {
      errorEl.textContent = 'El nombre es obligatorio'
      document.getElementById('carnetName').focus()
      return
    }
    if (!org) {
      errorEl.textContent = i18n.get('carnet.orgRequired')
      document.getElementById('carnetOrg').focus()
      return
    }
    errorEl.textContent = ''

    const accent = document.getElementById('carnetAccent').value
    const level = document.getElementById('carnetLevel').value
    const text = document.getElementById('carnetText').value.trim()
    const orientation = this._orientation

    const card = document.getElementById('carnetCard')
    card.classList.toggle('cred-card--vertical', orientation === 'vertical')

    card.querySelector('.cred-card__front').style.borderTop = `4px solid ${accent}`

    const header = document.getElementById('carnetCardHeader')
    const initial = name ? name.charAt(0).toUpperCase() : '?'
    header.style.background = level === 'full' ? `linear-gradient(135deg, ${accent}, ${accent}dd)` : 'transparent'

    const initialEl = document.getElementById('carnetInitial')
    initialEl.textContent = initial
    initialEl.style.display = 'flex'
    initialEl.style.background = accent
    initialEl.style.color = 'white'

    document.getElementById('carnetCardOrg').textContent = org
    document.getElementById('carnetCardName').textContent = name

    const idEl = document.getElementById('carnetCardId')
    if (username) {
      idEl.textContent = username
      idEl.style.display = 'block'
    } else {
      idEl.style.display = 'none'
    }

    const avatarEl = document.getElementById('carnetCardAvatar')
    if (this._photoDataURL) {
      avatarEl.innerHTML = `<img src="${this._photoDataURL}" alt="Photo" />`
      avatarEl.classList.remove('cred-card__avatar--initial')
    } else {
      avatarEl.innerHTML = `<span class="cred-card__avatar--initial" style="background:${accent}">${initial}</span>`
      avatarEl.classList.add('cred-card__avatar--initial')
    }
    avatarEl.style.display = 'block'

    document.getElementById('carnetCardType').style.background = `${accent}18`
    document.getElementById('carnetCardType').style.color = accent

    const backEl = document.getElementById('carnetCardBack')
    if (level === 'full') {
      backEl.style.display = 'flex'
      document.getElementById('carnetCardText').textContent = text || ''
      const qrEl = document.getElementById('carnetCardQr')
      qrEl.innerHTML = ''
      try {
        const qr = qrcode(0, 'M')
        qr.addData(JSON.stringify({ name, username, org }))
        qr.make()
        const cvs = document.createElement('canvas')
        cvs.width = 60
        cvs.height = 60
        const ctx = cvs.getContext('2d')
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, 60, 60)
        const cell = 60 / qr.getModuleCount()
        ctx.fillStyle = '#000'
        for (let r = 0; r < qr.getModuleCount(); r++) {
          for (let c = 0; c < qr.getModuleCount(); c++) {
            if (qr.isDark(r, c)) ctx.fillRect(c * cell, r * cell, cell, cell)
          }
        }
        qrEl.appendChild(cvs)
      } catch {}
      document.getElementById('carnetFlipCard').style.display = 'inline-flex'
      card.style.boxShadow = `0 8px 24px ${accent}33`
    } else {
      backEl.style.display = 'none'
      document.getElementById('carnetFlipCard').style.display = 'none'
      card.style.boxShadow = ''
    }

    document.getElementById('carnetResult').style.display = 'block'
    this.saveToHistory(name, username, org, accent, level, text, orientation)
  },

  flipCard() {
    const front = document.querySelector('#carnetCard .cred-card__front')
    const back = document.getElementById('carnetCardBack')
    const btn = document.getElementById('carnetFlipCard')

    if (front.style.display === 'none') {
      front.style.display = 'block'
      back.style.display = 'flex'
      btn.textContent = i18n.get('cred.flip')
    } else {
      front.style.display = 'none'
      back.style.display = 'flex'
      btn.textContent = i18n.get('cred.flipFront')
    }
  },

  saveToHistory(name, username, org, accent, level, text, orientation) {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: Date.now(),
      name,
      username,
      org,
      accent,
      level,
      text,
      orientation: orientation || 'horizontal'
    }
    Storage.pushEntry('carnet_history', entry)
  },

  getFields() {
    return {
      name: document.getElementById('carnetName').value.trim(),
      username: document.getElementById('carnetUsername').value.trim(),
      org: document.getElementById('carnetOrg').value.trim(),
      accent: document.getElementById('carnetAccent').value,
      level: document.getElementById('carnetLevel').value,
      text: document.getElementById('carnetText').value.trim(),
      orientation: this._orientation
    }
  },

  getInitial(name) {
    return name ? name.charAt(0).toUpperCase() : '?'
  },

  async exportPng() {
    const fields = this.getFields()
    if (!fields.name || !fields.org) return

    const accent = fields.accent || '#6366f1'
    const initial = this.getInitial(fields.name)
    const isVertical = fields.orientation === 'vertical'

    // 86x54mm ratio → 2x: 680x428 horizontal, 428x680 vertical
    const w = isVertical ? 428 : 680
    const h = isVertical ? 680 : 428

    try {
      const cvs = document.createElement('canvas')
      cvs.width = w
      cvs.height = h
      const ctx = cvs.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, w, h)

      if (isVertical) {
        ctx.fillStyle = accent
        ctx.fillRect(0, 0, w, 6)

        ctx.fillStyle = accent
        ctx.beginPath()
        ctx.arc(w / 2, 52, 28, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'white'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(initial, w / 2, 57)
        ctx.textAlign = 'left'

        ctx.fillStyle = '#94a3b8'
        ctx.font = '8px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(i18n.get('cred.orgLabel'), w / 2, 90)
        ctx.fillStyle = '#333'
        ctx.font = 'bold 12px sans-serif'
        ctx.fillText(fields.org, w / 2, 106)
        ctx.textAlign = 'left'

        if (this._photoDataURL) {
          try {
            const img = new Image()
            img.src = this._photoDataURL
            await new Promise(resolve => { img.onload = resolve })
            ctx.save()
            ctx.beginPath()
            ctx.arc(w / 2, 170, 32, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(img, w / 2 - 32, 138, 64, 64)
            ctx.restore()
          } catch {}
        }

        ctx.textAlign = 'center'
        ctx.fillStyle = '#0f172a'
        ctx.font = 'bold 16px sans-serif'
        ctx.fillText(fields.name, w / 2, 230)
        ctx.fillStyle = '#64748b'
        ctx.font = '12px sans-serif'
        ctx.fillText(fields.username, w / 2, 250)
        ctx.textAlign = 'left'

        ctx.fillStyle = accent + '30'
        ctx.beginPath()
        ctx.roundRect(w / 2 - 48, h - 50, 96, 24, 12)
        ctx.fill()
        ctx.fillStyle = accent
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('CARNET', w / 2, h - 33)
        ctx.textAlign = 'left'
      } else {
        ctx.fillStyle = accent
        ctx.fillRect(0, 0, w, 8)

        ctx.fillStyle = accent
        ctx.beginPath()
        ctx.arc(56, 56, 32, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'white'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(initial, 56, 62)
        ctx.textAlign = 'left'

        ctx.fillStyle = '#94a3b8'
        ctx.font = '8px sans-serif'
        ctx.fillText(i18n.get('cred.orgLabel'), 120, 30)

        ctx.fillStyle = '#333'
        ctx.font = 'bold 12px sans-serif'
        ctx.fillText(fields.org, 120, 48)

        if (this._photoDataURL) {
          try {
            const img = new Image()
            img.src = this._photoDataURL
            await new Promise(resolve => { img.onload = resolve })
            ctx.save()
            ctx.beginPath()
            ctx.arc(72, 160, 40, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(img, 32, 120, 80, 80)
            ctx.restore()
          } catch {}
        }

        ctx.fillStyle = '#0f172a'
        ctx.font = 'bold 18px sans-serif'
        ctx.fillText(fields.name, 144, 150)

        ctx.fillStyle = '#64748b'
        ctx.font = '13px sans-serif'
        ctx.fillText(fields.username, 144, 172)

        ctx.fillStyle = accent + '30'
        ctx.beginPath()
        ctx.roundRect(32, h - 60, 120, 24, 12)
        ctx.fill()
        ctx.fillStyle = accent
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('CARNET', 92, h - 43)
        ctx.textAlign = 'left'
      }

      const link = document.createElement('a')
      link.download = `carnet-${fields.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`
      link.href = cvs.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('Export error:', e)
      alert('Error al exportar PNG')
    }
  },

  exportPdf() {
    const fields = this.getFields()
    if (!fields.name || !fields.org) return

    const isVertical = fields.orientation === 'vertical'

    try {
      const { jsPDF } = window.jspdf
      const doc = new jsPDF({
        orientation: isVertical ? 'portrait' : 'landscape',
        unit: 'mm',
        format: isVertical ? [54, 86] : [86, 54]
      })

      const accent = fields.accent || '#6366f1'
      const initial = this.getInitial(fields.name)

      if (isVertical) {
        const cx = 27
        doc.setFillColor(accent)
        doc.rect(0, 0, 54, 2, 'F')

        doc.setFillColor(accent)
        doc.circle(cx, 10, 5, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(7)
        doc.text(initial, cx, 12.5, { align: 'center' })

        doc.setFontSize(6)
        doc.setTextColor(150, 150, 150)
        doc.text(i18n.get('cred.orgLabel'), cx, 20, { align: 'center' })

        doc.setFontSize(8)
        doc.setTextColor(50, 50, 50)
        doc.setFont(undefined, 'bold')
        doc.text(fields.org, cx, 26, { align: 'center' })
        doc.setFont(undefined, 'normal')

        doc.setTextColor(10, 10, 10)
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text(fields.name, cx, 45, { align: 'center' })
        doc.setFont(undefined, 'normal')

        doc.setFontSize(7)
        doc.setTextColor(100, 100, 100)
        doc.text(fields.username || '', cx, 51, { align: 'center' })

        doc.setFontSize(5)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(accent)
        doc.text('CARNET', cx, 80, { align: 'center' })
        doc.setFont(undefined, 'normal')
      } else {
        doc.setFillColor(accent)
        doc.rect(0, 0, 86, 2, 'F')

        doc.setFontSize(6)
        doc.setTextColor(150, 150, 150)
        doc.text(i18n.get('cred.orgLabel'), 10, 7)

        doc.setFontSize(8)
        doc.setTextColor(50, 50, 50)
        doc.setFont(undefined, 'bold')
        doc.text(fields.org, 10, 12)
        doc.setFont(undefined, 'normal')

        doc.setFillColor(accent)
        doc.circle(8, 24, 5, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(7)
        doc.text(initial, 8, 26.5, { align: 'center' })

        doc.setTextColor(10, 10, 10)
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text(fields.name, 17, 22)
        doc.setFont(undefined, 'normal')

        doc.setFontSize(7)
        doc.setTextColor(100, 100, 100)
        doc.text(fields.username || '', 17, 28)

        doc.setFontSize(5)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(accent)
        doc.text('CARNET', 8, 48)
        doc.setFont(undefined, 'normal')
      }

      doc.save(`carnet-${fields.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`)
    } catch (e) {
      console.error('Export PDF error:', e)
      alert('Error al exportar PDF')
    }
  }
}
