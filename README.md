# Zen Ludico

MVP mobile-first en Next.js para gamificar rutinas en pareja con XP, niveles, monedas, rachas, retos y tienda. Todo persiste en un solo JSON dentro de `LocalStorage`, sin backend ni autenticacion.

## Stack

- Next.js 14+ con App Router y TypeScript
- TailwindCSS + DaisyUI
- Framer Motion
- Zustand
- PWA instalable con `manifest`, `service worker` simple e iconos placeholder SVG

## Features

- Home con foco diario de hasta 5 tareas y CTA fijo a tienda
- XP, niveles y monedas para equipo y usuarios locales (`Ivan`, `Ella`)
- Conversion automatica de `100 XP = 1 moneda`
- Rachas individuales y de equipo sin penalizaciones
- Tareas `daily`, `recurring`, `oneTime` y `timed`
- Recompensas personales y compartidas con tickets pendientes
- Gating por fase:
  - Nivel 1-2: cooperativo
  - Nivel 3-4: panel individual completo + recompensas personales
  - Nivel 5+: duelos semanales ligeros
- Backup con export/import JSON y reset local
- PWA instalable

## Estructura

```text
app/
  (tabs)/
    home/
    rewards/
    challenges/
    profile/
components/
  AppShell.tsx
  BottomNav.tsx
  PhaseLock.tsx
  ProgressBar.tsx
  RewardCard.tsx
  TaskCard.tsx
  TicketList.tsx
lib/
  gamification.ts
  selectors.ts
  state.ts
  storage.ts
  store.ts
public/
  icons/
  sw.js
```

## Estado y persistencia

La app guarda un unico objeto en `LocalStorage` usando la key:

```text
zenludico_state_v1
```

Ese objeto contiene:

- `users[]`
- `team`
- `tasks[]`
- `rewards[]`
- `tickets[]`
- `settings`

## Ejecutar

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000/home`.

## Build

```bash
npm run build
npm run start
```

## Export / Import

1. Abre la tab `Perfil`.
2. En `Ajustes`, usa `Exportar backup JSON` para descargar el estado actual.
3. Para importar, selecciona un archivo JSON o pega el contenido en el textarea.
4. Pulsa `Restaurar backup`.

## Seed incluido

Tareas iniciales:

- Tender cama
- Recoger ropa suelta
- Escritorio limpio
- Cocina limpia
- 10 min orden con timer
- Ejercicio 20 min
- Agua 2L
- Barrer o aspirar cada 3 dias
- Bano ligero cada 3 dias
- Lavar ropa cada 7 dias
- Cambiar sabanas semanal
- Reto semanal `Sin comida fuera`

Recompensas iniciales:

- Cafe premium
- 20 min libres
- Noche de peli
- Mini cita zen
