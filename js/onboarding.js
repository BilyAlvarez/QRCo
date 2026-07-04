/* ─── ONBOARDING ─── */

const Onboarding = {
  modal: null,

  init() {
    this.modal = document.getElementById('onboardingModal')
    const user = Storage.getUser()

    if (!user) {
      this.show()
    }

    document.getElementById('onSubmit').addEventListener('click', () => this.save())
    document.getElementById('onName').addEventListener('keydown', e => {
      if (e.key === 'Enter') this.save()
    })
  },

  show() {
    this.modal.style.display = 'flex'
    document.getElementById('onName').focus()
  },

  hide() {
    this.modal.style.display = 'none'
  },

  save() {
    const name = document.getElementById('onName').value.trim()

    if (!name) {
      document.getElementById('onName').focus()
      return
    }

    const user = {
      name,
      lang: i18n._lang,
      theme: document.documentElement.getAttribute('data-theme'),
      activeSection: 'qr'
    }

    Storage.setUser(user)
    this.hide()

    if (document.getElementById('credName').value === '') {
      document.getElementById('credName').value = name
    }
  }
}
