/* ─── QR GENERATOR ─── */

const QRModule = {
  canvas: null,
  _logoImg: null,

  init() {
    this.canvas = document.getElementById('qrCanvas')

    document.getElementById('qrLogo').addEventListener('change', e => {
      const file = e.target.files[0]
      if (!file) { this._logoImg = null; return }
      const reader = new FileReader()
      reader.onload = ev => {
        const img = new Image()
        img.onload = () => { this._logoImg = img }
        img.src = ev.target.result
      }
      reader.readAsDataURL(file)
    })

    document.getElementById('btnGenerateQr').addEventListener('click', () => this.generate())
    document.getElementById('qrInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') this.generate()
    })

    document.getElementById('btnDownloadPng').addEventListener('click', () => this.download())
    document.getElementById('btnCopyClipboard').addEventListener('click', () => this.copyToClipboard())
  },

  getParams() {
    return {
      errorLevel: document.getElementById('qrErrorLevel').value,
      size: parseInt(document.getElementById('qrSize').value),
      margin: parseInt(document.getElementById('qrMargin').value),
      fgColor: document.getElementById('qrFgColor').value,
      bgColor: document.getElementById('qrBgColor').value,
    }
  },

  generate() {
    const input = document.getElementById('qrInput').value.trim()
    const errorEl = document.getElementById('qrError')

    if (!input) {
      errorEl.textContent = i18n.get('qr.errorEmpty')
      document.getElementById('qrInput').focus()
      return
    }

    errorEl.textContent = ''
    const params = this.getParams()

    this.canvas.width = params.size
    this.canvas.height = params.size

    const ctx = this.canvas.getContext('2d')

    const qr = qrcode(0, params.errorLevel)
    qr.addData(input)
    qr.make()

    const moduleCount = qr.getModuleCount()

    ctx.fillStyle = params.bgColor
    ctx.fillRect(0, 0, params.size, params.size)

    const actualCellSize = params.size / (moduleCount + params.margin * 2)

    ctx.fillStyle = params.fgColor
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(
            (col + params.margin) * actualCellSize,
            (row + params.margin) * actualCellSize,
            actualCellSize,
            actualCellSize
          )
        }
      }
    }

    if (this._logoImg) {
      const logoSize = params.size * 0.2
      const logoX = (params.size - logoSize) / 2
      const logoY = (params.size - logoSize) / 2

      ctx.fillStyle = params.bgColor
      ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8)
      ctx.drawImage(this._logoImg, logoX, logoY, logoSize, logoSize)
    }

    this.saveToHistory(input, params)
    document.getElementById('qrResult').style.display = 'block'
  },

  saveToHistory(input, params) {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: Date.now(),
      url: input,
      params,
      thumbnail_b64: this.canvas.toDataURL('image/png', 0.3)
    }
    Storage.pushEntry('qr_history', entry)
  },

  download() {
    const link = document.createElement('a')
    link.download = `qrcode-${Date.now()}.png`
    link.href = this.canvas.toDataURL('image/png')
    link.click()
  },

  async copyToClipboard() {
    try {
      const blob = await new Promise(resolve => this.canvas.toBlob(resolve, 'image/png'))
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      alert(i18n.get('qr.copied'))
    } catch {
      alert(i18n.get('qr.copyError'))
    }
  }
}
