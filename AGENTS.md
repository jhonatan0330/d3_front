# AGENTS.md

Guidance for AI agents and developers working in this repository.

## Project Overview

- **Name**: d3Front ("Asistant project IA")
- **Type**: Angular SPA (admin/business app) built on the **FuseAdmin** template
- **Current stack**: Angular **22.1.0**, TypeScript 6.0.3, Tailwind CSS 3.4.7, RxJS 7.8.2, SCSS
- **Target**: Angular **22** (see `MIGRATION_PLAN.md` for the migration roadmap — it is the source of truth for the upgrade)
- **Build system**: Standalone components, bootstrap via `bootstrapApplication` in `src/main.ts` (**zoneless**, `provideZonelessChangeDetection()`; zone.js eliminado en Fase 5.4).

## Commands

```bash
npm start            # ng serve
npm run build        # ng build --build-optimizer (production)
npm run build:stats  # ng build --stats-json (bundle analysis)
npm run watch        # ng build --watch --configuration development
npm run analyze      # webpack-bundle-analyzer on dist/fuse/stats.json
npm run lint         # ng lint (ESLint, @angular-eslint) -- actualmente roto, ver MIGRATION_PLAN 0.1a
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
- `src/app/app.routing.ts` — all routes. Admin section guarded by `AuthGuard`; lazy-loaded modules: `authorization` (Profile), `cruds`, `tasks`, `neuron`, `massive`, `accounting`, `recover-password`, `new-password`.
- `src/@fuse/` — FuseAdmin template (keep as-is during migration). Contains `FuseModule`, servicios (config, loading, media-watcher, platform), y los style entry points (`tailwind.scss`, `themes.scss`, `main.scss`). La navegación de Fuse fue reemplazada: **todos los layouts usan `mat-sidenav` + `simple-nav`** (`src/app/layout/common/simple-nav/`); de `@fuse/components/navigation` solo queda `navigation.types.ts` (tipo `FuseNavigationItem`).
- `src/app/modules/full/neuron/` — **critical, complex** dynamic-forms engine (~16 dynamic control types under `form/controls/`). Treat as high-risk; migrate last and with care.
- Other domains: `accounting`, `authentication`, `authorization`, `configuration-forms`, `cruds`, `document-transition`, `layout`, `massive`, `notification`, `persons`, `shared`, `tasks`.

### Conventions
- `baseUrl: ./src` in `tsconfig.json`; use path-less imports from `src`, e.g. `import ... from 'app/...'`, `from 'environments/...'`.
- Components use SCSS (`inlineStyleLanguage: scss`), `ViewEncapsulation.None` + `ChangeDetectionStrategy.OnPush` where the template sets it.
- ESLint: `@angular-eslint` ng-cli-compat rules, **kebab-case** component/directive selectors with **empty prefix**. Files sometimes use `// @formatter:off` / `/* eslint-disable */` blocks — preserve them.
- Do NOT add comments to code unless asked.

## Testing

- **Vitest** (montado en Fase 5.5, runner primario): config en `vitest.config.ts` (`@analogjs/vite-plugin-angular` + aliases `@fuse`/`app`/`environments` para resolver el `baseUrl`), setup en `src/test-setup.ts` (**zoneless**: `setupTestBed({ zoneless: true })` de `@analogjs/vitest-angular/setup-testbed`), tipos en `tsconfig.spec.json`.
- Comandos: `npm test` (una pasada) y `npm run test:watch`.
- Primeras suites: `src/app/shared/plantilla-helper.spec.ts` y `src/app/shared/local-image.spec.ts` (18 tests). Los specs quedan excluidos del build de la app.
- Verificación principal tras editar código: `npm run build` (y `npx tsc -p tsconfig.app.json --noEmit`).

## Migration Status & Constraints

- Project is on Angular 17.3.12 and being upgraded one major at a time to 22 (17→18→19→20→21→22). Follow `MIGRATION_PLAN.md` phases; do not skip majors.
- **Separate version upgrade from modernization** (signals, standalone, zoneless). Modernization is Phase 5, after 22 is working.
- Known deprecated APIs currently in use (fix only as the plan directs):
  - `throwError(error)` (lazy arg) in `login.service.ts` and `shared/error.interceptor.ts`
  - `ComponentFactoryResolver` in `cruds2.component.ts`, `neuron/form/form.component.ts`, `neuron/form/controls/product/product.component.ts`
- Third-party risk packages: `@magloft/material-carousel` (abandoned), `ngx-editor` (unmaintained, v19 beta is latest), `ng-apexcharts`/`apexcharts` (needs major bump). Do not bump these outside the plan.
- Recently removed from the codebase (do not recreate unless asked): the `gps` module and several `@fuse` sub-features (drawer, fullscreen, animations, `scroll-reset` directive, `find-by-key` pipe, navigation components, `scrollbar` directive, `utils` service).
