# QRCo

Generador de códigos QR y carnets personalizados. SPA vanilla (HTML + CSS + JS).

## Demo

[https://bilyalvarez.github.io/QRCo](https://bilyalvarez.github.io/QRCo)

## Funcionalidades

- **QR Generator** — Genera códigos QR desde URL/texto con opciones de color, tamaño, margen, corrección de errores y logo central. Exporta PNG y copia al portapapeles.
- **Credenciales** — Genera usuario y contraseña aleatorios a partir del nombre. Configura longitud y tipos de caracteres. Guarda y administra credenciales en localStorage.
- **Carnet** — Crea tarjetas de identificación físicas con datos propios (nombre, usuario, empresa). Elige orientación horizontal o vertical (86×54mm), foto, color de acento y nivel de diseño. Exporta a PNG y PDF (tamaño real CR80).

## Stack

- HTML5 + CSS3 (BEM) + JavaScript vanilla
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (Kazuhiko Arase)
- [jsPDF](https://github.com/parallax/jsPDF) (vía CDN)
- Temas claro/oscuro · i18n ES/EN · localStorage

## Deploy local

```bash
npx serve .
# o abrir index.html directamente
```

## Deploy automático

Al hacer push a `main`, GitHub Actions despliega automáticamente a GitHub Pages.

## Créditos

Desarrollado por BMAS-DEV
