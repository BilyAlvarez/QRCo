/* ─── APP ─── */

function switchSection(section) {
  document.querySelectorAll('.nav-top__item, .nav-bottom__item').forEach(btn => {
    const active = btn.dataset.section === section
    btn.classList.toggle('nav-top__item--active', active)
    btn.classList.toggle('nav-bottom__item--active', active)
  })

  document.querySelectorAll('.panel').forEach(p => {
    p.classList.toggle('panel--active', p.id === `panel${section.charAt(0).toUpperCase() + section.slice(1)}`)
  })

  const user = Storage.getUser()
  if (user) {
    user.activeSection = section
    Storage.setUser(user)
  }
}

function initTheme() {
  const user = Storage.getUser()
  const savedTheme = user?.theme || 'light'
  document.documentElement.setAttribute('data-theme', savedTheme)
  updateThemeIcon(savedTheme)
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme')
  const next = current === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', next)
  updateThemeIcon(next)
  const user = Storage.getUser()
  if (user) {
    user.theme = next
    Storage.setUser(user)
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon')
  if (theme === 'dark') {
    icon.innerHTML = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>'
  } else {
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
  }
}

function init() {
  initTheme()

  const user = Storage.getUser()
  if (user) {
    i18n.setLang(user.lang || 'ES')
    i18n.translateAll()
    document.getElementById('langLabel').textContent = i18n.get('toolbar.lang')

    if (user.name) {
      document.getElementById('credName').value = user.name
    }

    const section = user.activeSection || 'qr'
    switchSection(section)
  } else {
    i18n.translateAll()
  }

  document.querySelectorAll('.nav-top__item, .nav-bottom__item').forEach(btn => {
    btn.addEventListener('click', () => {
      switchSection(btn.dataset.section)
    })
  })

  document.getElementById('btnLang').addEventListener('click', () => {
    i18n.toggle()
    document.getElementById('langLabel').textContent = i18n.get('toolbar.lang')
  })

  document.getElementById('btnTheme').addEventListener('click', toggleTheme)

  document.querySelectorAll('.modal__backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', e => {
      e.target.closest('.modal').style.display = 'none'
    })
  })

  Onboarding.init()
  QRModule.init()
  CredentialsModule.init()
  CarnetModule.init()
  History.init()
}

document.addEventListener('DOMContentLoaded', init)
