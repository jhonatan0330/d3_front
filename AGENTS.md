# AGENTS.md

Guidance for AI agents and developers working in this repository.

## Project Overview

- **Name**: SW42 ("Asistant project IA")
- **Type**: Angular SPA (admin/business app) built on the **FuseAdmin** template
- **Current stack**: Angular **17.3.12**, TypeScript 5.4.5, Tailwind CSS 3.4.7, RxJS 7.8.0, SCSS
- **Target**: Angular **22** (see `MIGRATION_PLAN.md` for the migration roadmap — it is the source of truth for the upgrade)
- **Build system**: NgModule-based app (NOT standalone). Bootstrap via `platformBrowserDynamic().bootstrapModule(AppModule)` in `src/main.ts`.

## Commands

```bash
npm start            # ng serve
npm run build        # ng build --build-optimizer (production)
npm run build:stats  # ng build --stats-json (bundle analysis)
npm run watch        # ng build --watch --configuration development
npm run analyze      # webpack-bundle-analyzer on dist/fuse/stats.json
npm run lint         # ng lint (ESLint, @angular-eslint)
npm test             # ng test  -- currently BROKEN, see Testing below
```

Type-check without emitting: `npx tsc -p tsconfig.app.json --noEmit`

> After generating or editing code, run `npm run build` to verify it compiles.

## Architecture

### Module layout
- `src/main.ts` — entry, NgModule bootstrap (zone.js-based).
- `src/app/app.module.ts` — root module; provides interceptors via `HTTP_INTERCEPTORS`, uses `PreloadAllModules` (legacy, do not modernize during the version migration).
- `src/app/app.routing.ts` — all routes. Admin section guarded by `AuthGuard`; lazy-loaded modules: `authorization` (Profile), `cruds`, `tasks`, `neuron`, `massive`, `accounting`, `recover-password`, `new-password`.
- `src/@fuse/` — FuseAdmin template (keep as-is during migration). Contains `FuseModule`, navigation components, `scrollbar` directive, and services (config, loading, media-watcher, platform, utils). Style entry points live here (`tailwind.scss`, `themes.scss`, `main.scss`).
- `src/app/modules/full/neuron/` — **critical, complex** dynamic-forms engine (~16 dynamic control types under `form/controls/`). Treat as high-risk; migrate last and with care.
- Other domains: `accounting`, `authentication`, `authorization`, `configuration-forms`, `cruds`, `document-transition`, `layout`, `massive`, `notification`, `persons`, `shared`, `tasks`.

### Conventions
- `baseUrl: ./src` in `tsconfig.json`; use path-less imports from `src`, e.g. `import ... from 'app/...'`, `from 'environments/...'`.
- Components use SCSS (`inlineStyleLanguage: scss`), `ViewEncapsulation.None` + `ChangeDetectionStrategy.OnPush` where the template sets it.
- ESLint: `@angular-eslint` ng-cli-compat rules, **kebab-case** component/directive selectors with **empty prefix**. Files sometimes use `// @formatter:off` / `/* eslint-disable */` blocks — preserve them.
- Do NOT add comments to code unless asked.

## Testing

- **There are currently no unit tests**: zero `*.spec.ts` files and no `src/test.ts`.
- `angular.json` still wires the Karma builder (`src/test.ts` main file), so `npm test` **fails**. Do not assume tests exist or will pass; use `npm run build` as the primary verification.

## Migration Status & Constraints

- Project is on Angular 17.3.12 and being upgraded one major at a time to 22 (17→18→19→20→21→22). Follow `MIGRATION_PLAN.md` phases; do not skip majors.
- **Separate version upgrade from modernization** (signals, standalone, zoneless). Modernization is Phase 5, after 22 is working.
- Known deprecated APIs currently in use (fix only as the plan directs):
  - `throwError(error)` (lazy arg) in `login.service.ts` and `shared/error.interceptor.ts`
  - `ComponentFactoryResolver` in `cruds2.component.ts`, `neuron/form/form.component.ts`, `neuron/form/controls/product/product.component.ts`
  - `HTTP_INTERCEPTORS` in `app.module.ts` and `@fuse/services/loading/loading.module.ts`
  - `Router.isActive(link, boolean)` in `@fuse` navigation components
- Third-party risk packages: `@magloft/material-carousel` (abandoned), `ngx-editor` (unmaintained, v19 beta is latest), `ng-apexcharts`/`apexcharts` (needs major bump). Do not bump these outside the plan.
- Recently removed from the codebase (do not recreate unless asked): the `gps` module and several `@fuse` sub-features (drawer, fullscreen, animations, `scroll-reset` directive, `find-by-key` pipe).
