# Fonts Studio Pro - El Motor de Tipografías 🖋️

Este es el desarrollo del **"Backend del Navegador"** diseñado exclusivamente para transformar archivos de fuentes en stickers de texto de alta calidad.

## 🚀 Funcionalidad Core

1.  **Persistencia Local (IndexedDB):** Almacenamos archivos binarios (`ArrayBuffer`) para que las fuentes vivan en el navegador sin depender de un servidor.
2.  **Registro Dinámico (FontFace API):** Inyectamos fuentes en el documento de forma asíncrona para su uso inmediato.
3.  **Motor de Stickers (Canvas Engine):** Generamos imágenes PNG transparentes midiendo el texto dinámicamente.

## 🛠️ Tecnologías a utilizar
- **TypeScript:** Para una gestión de tipos robusta.
- **IDB Library:** Wrapper ligero para IndexedDB.
- **Canvas API:** Para el procesamiento visual.

---
*Este documento es el punto de partida para la implementación técnica paso a paso.*
