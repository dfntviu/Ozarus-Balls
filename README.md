# Ozarus & Balls

Sitio fan de Dragon Ball migrado de HTML/CSS/JS nativo a **React 19 + TypeScript + Vite**.
Catálogo de personajes por saga, con trivia y sopa de letras.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Typecheck estricto (`tsc -b`) + build de producción |
| `npm run check:contrast` | Valida contraste WCAG AA de todos los pares de color de los temas y sagas |
| `npm run data` | Regenera `src/data/characters/*.json` desde las capas de `data-raw/` |
| `npm run extract` | Extrae personajes del sitio HTML original (`../Ozarus-Y.Balls`). Requiere `npx playwright install chromium` |

Requiere Node ≥ 22.18 (ejecuta los scripts `.ts` sin compilar).

## Decisiones de arquitectura

**MVC en clave de React, no SSV ni Hexagonal.** El único estado compartido es el tema; no hay backend.
Modelo = JSON tipados + selectores puros (`src/data`), controlador = hooks delgados, vista = componentes que solo pintan.
Subir a SSV o Hexagonal sería andamiaje sin amenaza que lo justifique.

**Una sola colección de personajes.** Cada registro es una *aparición* en una saga/arco (Vegeta es villano en
Saiyajins y aliado en Freezer). Las páginas son filtros: `bySaga`, `byRole`, `byFaction`, `featured`.

**Datos en capas, generados y validados.**
`data-raw/<saga>.source.json` (escrito a mano) + `.legacy.json` (extraído del HTML) + `.editorial.json` (rol, raza,
tier, correcciones) → `scripts/normalize-saga.ts` → `src/data/characters/<saga>.json`.
El script se niega a escribir un JSON inválido y genera `data-raw/<saga>.review.md` con todo lo que requiere revisión.

**Tier = poder relativo dentro del arco**, en escala logarítmica cuando hay cifras; editorial cuando no las hay.

**`featured` es derivado, no almacenado.** Se calcula de `tier` + `race` y devuelve
`{ warriors, deities, angels }`. Guardarlo en el personaje crearía dos fuentes de verdad.

**Tokens de diseño en tres capas.** Escalas → color semántico por tema (`[data-theme]`) → acento
(`--color-accent`) que cada saga redefine (`[data-saga]`). Los componentes solo leen tokens semánticos.
El tema se aplica con un script inline antes de que React monte (sin parpadeo) y respeta `prefers-color-scheme`
hasta que el usuario elige.

## Estructura

```
src/
  types/character.ts      contrato de datos; enums como arrays `as const` (fuente única para tipos y validación)
  data/                   JSON generados, registro de sagas, facciones y selectores
  theme/                  tokens.css, sagas.css, base.css, ThemeProvider
  layout/                 Layout, Navbar (hamburguesa accesible), ThemeSwitcher
  pages/                  Home, SagaPage, placeholders de fases siguientes
scripts/                  extracción, normalización y verificación de contraste
data-raw/                 capas fuente y revisiones editoriales
```

---
Proyecto fan sin fines de lucro, sin afiliación con Toei Animation, Bird Studio ni Shueisha.
