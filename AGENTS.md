# AGENTS.md

Guidance for AI agents and developers working in this repository.

## Project Overview

- **Name**: d3Front ("Asistant project IA")
- **Type**: Angular SPA (admin/business app) built on the **FuseAdmin** template
- **Current stack**: Angular **22.1.0**, TypeScript 6.0.3, Tailwind CSS 3.4.7, RxJS 7.8.2, SCSS
- **Target**: Angular **22** (already at 22.1.0; see `PlanMejoras.md` for the post-migration improvement plan — the source of truth for ongoing work).
- **Build system**: Standalone components, bootstrap via `bootstrapApplication` in `src/main.ts` (**zoneless**, `provideZonelessChangeDetection()`; zone.js eliminado en Fase 5.4).

## Commands

```bash
npm start            # ng serve
npm run build        # ng build --build-optimizer (production)
npm run build:stats  # ng build --stats-json (bundle analysis)
npm run watch        # ng build --watch --configuration development
npm run analyze      # webpack-bundle-analyzer on dist/fuse/stats.json
npm run lint         # ng lint (ESLint, works; currently 165 warnings / 0 errors, mostly `any` and `no-console` in `warn` level)
npm test             # vitest run (Vitest, ver Testing abajo)
npm run test:watch   # vitest (modo watch)
```

Type-check without emitting: `npx tsc -p tsconfig.app.json --noEmit`

> After generating or editing code, run `npm run build` to verify it compiles.

## Workflow: commits por paso

- **Cada paso/ítem de trabajo se resuelve y verifica en un commit independiente** (a `main`). No acumular varios pasos sin commitear.
- Al terminar un paso (código verificado con `npm run build` / `npx tsc --noEmit`), hacer commit inmediato con mensaje corto y descriptivo que referencie el ítem del plan si aplica (ej. `fix(P1-1): ...`).
- Un commit debe contener solo lo relacionado con ese paso; no mezclar cambios ajenos.
- **No commitear si el usuario no lo ha pedido** — esta regla aplica cuando el trabajo está organizado en pasos/ítems y el usuario espera un commit por cada uno.

## Architecture

### Module layout
- `src/main.ts` — entry, `bootstrapApplication` con `provideZonelessChangeDetection()` (zoneless).
- `src/app/app.routing.ts` — all routes. Admin section guarded by `AuthGuard`; lazy-loaded modules: `authorization` (Profile), `cruds`, `tasks`, `massive`, `accounting`, `recover-password`, `new-password`. (`persons` currently eager — see PlanMejoras.md limpieza).
- `src/@fuse/` — FuseAdmin template (keep as-is during migration). Contains `FuseModule`, servicios (config, loading, media-watcher, platform), y los style entry points (`tailwind.scss`, `themes.scss`, `main.scss`). La navegación de Fuse fue reemplazada: **todos los layouts usan `mat-sidenav` + `simple-nav`** (`src/app/layout/common/simple-nav/`); de `@fuse/components/navigation` solo queda `navigation.types.ts` (tipo `FuseNavigationItem`).
- `src/app/modules/full/neuron/` — **critical, complex** dynamic-forms engine (18 dynamic control types under `form/controls/`: archivo, base, binario, configuracion, croquis, detalle, disponibilidad, fecha, gps, gps-map, informative, numero, proceso, product, producto-lista, seccion, texto, vinculo). Treat as high-risk; migrate last and with care.
- Other domains: `accounting`, `authentication`, `authorization`, `configuration-forms`, `cruds`, `document-transition`, `layout`, `massive`, `notification`, `persons`, `shared`, `tasks`.

### Conventions
- `baseUrl: ./src` in `tsconfig.json`; use path-less imports from `src`, e.g. `import ... from 'app/...'`, `from 'environments/...'`.
- Components use SCSS (`inlineStyleLanguage: scss`), `ViewEncapsulation.None` + `ChangeDetectionStrategy.OnPush` where the template sets it.
- ESLint: `@angular-eslint` ng-cli-compat rules, **kebab-case** component/directive selectors with **empty prefix**. Files sometimes use `// @formatter:off` / `/* eslint-disable */` blocks — preserve them.
- Do NOT add comments to code unless asked.

## Testing

- **Vitest** (configured in Fase 5.5, primary runner): config en `vitest.config.ts` (`@analogjs/vite-plugin-angular` + aliases `app`/`environments`/`config` para resolver el `baseUrl`), setup en `src/test-setup.ts` (**zoneless**: `setupTestBed({ zoneless: true })` de `@analogjs/vitest-angular/setup-testbed`), tipos en `tsconfig.spec.json`.
- Comandos: `npm test` (una pasada) y `npm run test:watch`.
- 5 suites / 66 tests pass: `login.service.spec.ts`, `tasks.service.spec.ts`, `template.service.spec.ts`, `plantilla-helper.spec.ts`, `local-image.spec.ts`. Los specs quedan excluidos del build de la app. **Coverage tooling not yet installed** (`@vitest/coverage-v8` pending — see P5-1 in PlanMejoras.md).
- Typecheck: `npx tsc -p tsconfig.app.json --noEmit` — **0 errors** (baseline ✅).

## Migration Status & Constraints

- Project is on Angular **22.1.0** (upgrade 17→18→19→20→21→22 — complete). Follow `PlanMejoras.md` phases for ongoing improvements; do not skip majors when introducing new migration steps.
- **Separate version upgrade from modernization** (signals, standalone, zoneless). Modernization is Phase 5, after 22 is working. ✅ Modernization already in progress (zoneless active, signals adopted, `takeUntilDestroyed` in use).
- Deprecated APIs — all resolved:
  - `throwError(error)` (lazy arg) → `throwError(() => error)` in `login.service.ts:103` and `shared/error.interceptor.ts:45`.
  - `ComponentFactoryResolver` → removed entirely (no occurrences in codebase).
- Third-party risk packages: `ngx-editor` (unmaintained, `@bobbyquantum/ngx-editor@^22.0.1` is latest), `ng-apexcharts`/`apexcharts` (needs major bump). `@magloft/material-carousel` — **already removed** from `package.json`. Do not bump risk packages outside the plan.
- The `gps` control (`neuron/form/controls/gps/`) — **still active**, 2 files. Not removed (correction: do not remove unless asked, it's live code).
- Recently removed from the codebase (do not recreate unless asked): several `@fuse` sub-features (drawer, fullscreen, animations, `scroll-reset` directive, `find-by-key` pipe, navigation components, `scrollbar` directive, `utils` service).

## Material Minimization Strategy

**Goal**: Reduce Angular Material dependencies to the minimum necessary. Replace Material components with Tailwind CSS equivalents where feasible.

### Current Approach

Components are being migrated from Material to Tailwind CSS. The strategy is to keep Material only for complex components that have no simple Tailwind equivalent (e.g., `MatDialog`, `MatMenu`, `MatTooltip`, `MatDatepicker`).

### Replacement Patterns

#### Buttons → Tailwind (completed)
- `mat-icon-button` → `.btn-icon` / `.btn-icon-primary` / `.btn-icon-accent`
- `mat-flat-button` → `.btn-flat` / `.btn-flat-primary` / `.btn-flat-accent`
- `mat-raise-button` → `.btn-raised`
- Global classes defined in `src/styles/styles.scss`
- `<mat-icon>` kept as thin wrapper for SVG sprite rendering

#### Drawer → Tailwind (completed)
- `mat-drawer-container` / `mat-drawer` / `mat-drawer-content` → custom `<div>` + `<aside>` + `<main>` with Tailwind
- Responsive behavior replicated with `md:` breakpoint and `translate-x` transitions
- Backdrop for overlay mode using conditional `fixed inset-0 bg-black/50`
- Signals `drawerMode` and `drawerOpened` control behavior

#### Progress Bar → Tailwind (completed)
- `mat-progress-bar[mode="indeterminate"]` → animated Tailwind div
- Pattern: `w-full h-1 bg-gray-200 rounded overflow-hidden` + inner div with `animate-pulse`
- No external dependencies, pure CSS animation

#### Menu → Tailwind (in progress)
- `MatMenu` / `MatMenuTrigger` / `MatMenuItem` → custom `<app-dropdown>` + `<app-dropdown-item>`
- Components in `src/app/shared/components/dropdown/`
- Uses `@HostListener('document:click')` for click-outside closing
- Signal-based state management (`isOpen`)
- Reusable across all components
- **Pendiente migrar**: `mat-menu` aún usado en `accounting.component.html`, `tasks/list`, `persons.component.html`, `form.component.html`, `cruds2.component.html`

### Components to Keep (for now)
- `MatDialog` — complex overlay, no simple Tailwind replacement
- `MatTooltip` — behavior directive, lightweight
- `MatDatepicker` — complex component with localization
- `MatFormField` / `MatInput` — form field animations and labels
- `MatTable` — structured table with selection (evaluate later)

### Global Tailwind Button Classes
Defined in `src/styles/styles.scss`:
```scss
.btn-icon          /* circular icon button */
.btn-icon-primary  /* circular with primary color */
.btn-icon-accent   /* circular with accent color */
.btn-flat          /* flat filled button */
.btn-flat-primary  /* flat with primary bg */
.btn-flat-accent   /* flat with accent bg */
.btn-raised        /* elevated button with border */
```
