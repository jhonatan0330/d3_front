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
- `src/app/configuration/` — **Formularios de Administración** migrados de Flex a `/api/config/` (ver `PLAN_MIGRACION_CONFIGURACION.md`). 12 módulos bajo `configuration-forms/` (web-services, messages, message-templates, document-templates, auto-tasks, processes, organizations, consecutives, servers, property-values, properties) + base compartida en `shared/`. Accedidos vía ruta lazy `/config` cuyo contenedor es `ConfigComponent` (`configuration-forms/config.component.ts`, selector `app-config`) con navegación por pestañas.
- `src/app/document/` — **critical, complex** dynamic-forms engine (18 dynamic control types under `form/controls/`: archivo, base, binario, configuracion, croquis, detalle, disponibilidad, fecha, gps, gps-map, informative, numero, proceso, product, producto-lista, seccion, texto, vinculo). Treat as high-risk; migrate last and with care.
- Other domains: `accounting`, `authentication`, `authorization`, `configuration-forms`, `cruds`, `document-transition`, `layout`, `massive`, `notification`, `persons`, `shared`, `tasks`.

### Conventions
- `baseUrl: ./src` in `tsconfig.json`; use path-less imports from `src`, e.g. `import ... from 'app/...'`, `from 'environments/...'`.
- Components use SCSS (`inlineStyleLanguage: scss`), `ViewEncapsulation.None` + `ChangeDetectionStrategy.OnPush` where the template sets it.
- ESLint: `@angular-eslint` ng-cli-compat rules, **kebab-case** component/directive selectors with **empty prefix**. Files sometimes use `// @formatter:off` / `/* eslint-disable */` blocks — preserve them.
- Do NOT add comments to code unless asked.

## Testing

- **No se ejecutan tests en CI.** Ver `sdd/specs/architecture.md` §13 (Estrategia de testing y CI) — ARCH-012.
- Verificación estándar: `npm run build` + `npx tsc -p tsconfig.app.json --noEmit`.
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
- `flex.service.ts` (en `src/app/configuration/`) — **código muerto**: ya no es importado por ningún componente y aún apunta a endpoints `/flex/`. Debe eliminarse al completar FASE 4.5 del `PLAN_MIGRACION_CONFIGURACION.md`.

## Configuration Forms Migration (Flex → /api/config/)

Ver `PLAN_MIGRACION_CONFIGURACION.md` (fuente de verdad de esta migración). Estado resumido:

- **FASES 0-3 — COMPLETADAS**: base compartida en `configuration-forms/shared/` (PropertyService, PropertyField, PropertyModal, PropertyRelations, RelationForm, UserSelector, AttachmentViewer, DocumentTemplateService) + 12 módulos feature (web-services, messages, message-templates, document-templates, auto-tasks, processes, organizations, consecutives, servers, property-values, properties). `flex/` fue renombrado a `document-templates/` y sus componentes reemplazados por `document-template-*` (FlexComponent→DocumentTemplateListComponent, FieldComponent→DocumentTemplateFieldDetailComponent, AddFieldComponent→DocumentTemplateFieldFormComponent, AddPropertyComponent→shared/PropertyModalComponent).
- **FASE 4 — EN PROGRESO**:
  - 4.1 Rutas lazy bajo `/config` ya registradas en `app.routing.ts` ✅.
  - 4.2 Navegación: **no** se usó un grupo "Configuración" en el sidebar; se implementó como componente con pestañas `ConfigComponent` (`configuration-forms/config.component.ts`, selector `app-config`) que lista los 11 módulos. `navigation.service.ts` no fue modificado para esto.
  - 4.3 Testing E2E manual — **pendiente**.
  - 4.4 Borrar `FullControllerDTO.java` del backend — **pendiente** (depende del backend).
  - 4.5 Eliminar fuga de `/flex/` — **pendiente** (`flex.service.ts` sigue presente como código muerto).
- **Problemas conocidos FASE 4 (reportados en el plan, sin verificar)**: patrón `signal()`+`[(ngModel)]` en filtros de lista, `element` vs `row` en `*matRowDef`, imports Angular Material faltantes, rutas de imports de DTOs, e inconsistencia de tipos `PropiedadCampoDTO` (string vs number). Build y typecheck reportan 0 errores en cada fase, por lo que podrían estar resueltos.

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
- **`mat-spinner` / `MatProgressSpinnerModule` fully removed** from the codebase (0 occurrences); all loading indicators use the Tailwind bar pattern above.

#### Menu → Tailwind (completed)
- `MatMenu` / `MatMenuTrigger` / `MatMenuItem` → custom `<app-dropdown>` + `<app-dropdown-item>`
- Components in `src/app/shared/components/dropdown/`
- Uses `@HostListener('document:click')` for click-outside closing
- Signal-based state management (`isOpen`)
- Reusable across all components (`accounting`, `tasks`, `cruds`, `layout/user`, `dashboard`, `neuron/form`). The `mat-menu` usages previously listed as pending are gone; only a commented-out block remains in `neuron/form/controls/proceso/proceso.component.html`.

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

## Architecture Rules (Configuration Forms Migration)

### 1. Angular Material Minimization
**Goal**: Reduce Angular Material to absolute minimum. Replace with Tailwind CSS equivalents.

**Allowed Material Components** (no simple Tailwind equivalent):
- `MatDialog` — complex overlay
- `MatTooltip` — lightweight behavior directive  
- `MatDatepicker` — complex with localization
- `MatFormField` / `MatInput` — form field animations and labels
- `MatTable` — structured table with selection

**Banned/Replace Material Components**:
| Material Component | Replacement |
|--------------------|-------------|
| `mat-select` / `MatSelectModule` | `<app-dropdown>` + `<app-dropdown-item>` from `src/app/shared/components/dropdown/` |
| `mat-spinner` / `MatProgressSpinnerModule` | Custom Tailwind loading: `@if (isLoading()) { <div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div> }` |
| `mat-menu` / `MatMenuModule` | `<app-dropdown>` + `<app-dropdown-item>` |
| `mat-paginator` / `MatPaginatorModule` | Custom pagination (or keep temporarily) |
| `mat-icon-button` / `mat-flat-button` / `mat-raised-button` | Tailwind `.btn-icon`, `.btn-flat`, `.btn-raised` classes |

> **Desviación conocida (configuration-forms)**: Los módulos de `src/app/configuration/` (FASES 0-3 del `PLAN_MIGRACION_CONFIGURACION.md`) **NO aplicaron** esta regla de minimización. Usan `MatTableModule`, `MatPaginatorModule`, `MatSelectModule`, `MatDatepickerModule`, `MatFormFieldModule`, `MatDialogModule` y `MatTooltipModule` como patrón estándar (tablas con paginación, filtros con `mat-select`, formularios con `mat-form-field`). `app-dropdown` se usa en el resto de la app, pero no en esos módulos. La sustitución de `mat-select`→`app-dropdown` y `mat-paginator`→paginación propia queda **pendiente** para los componentes de `configuration-forms`.

### 2. Standalone Components Only
- **No NgModules** — all components must be standalone (`standalone: true`)
- Use `imports: []` array in `@Component` decorator
- Lazy loading via `loadComponent` / `loadChildren` with ES modules

### 3. Loading Indicator Pattern
```typescript
// Component
isLoading = signal(false);

// Template - NO mat-spinner
@if (isLoading()) {
  <div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
    <div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div>
  </div>
}
```

### 4. Select/Dropdown Pattern
Use `src/app/shared/components/dropdown/`:
```html
<app-dropdown>
  <button trigger class="...">
    <mat-icon>chevron_down</mat-icon>
  </button>
  @for (opt of options; track opt.value) {
    <app-dropdown-item (clicked)="select(opt)">
      {{ opt.label }}
    </app-dropdown-item>
  }
</app-dropdown>
```

### 5. Apply to All New Configuration Forms Components
All components under `src/app/configuration/` must follow these rules:
- Replace all `mat-spinner` → custom Tailwind loading bar (✅ ya hecho; `MatProgressSpinnerModule` eliminado del codebase)
- Replace all `mat-menu` → `app-dropdown` (✅ ya hecho en toda la app)
- **Pendiente** en `configuration-forms`: sustituir `mat-select` → `app-dropdown` y `mat-paginator` → paginación propia. Por ahora estos módulos conservan `MatSelectModule`, `MatTableModule`, `MatPaginatorModule`, `MatDatepickerModule`, `MatFormFieldModule`, `MatDialogModule`, `MatTooltipModule` como patrón estándar (ver desviación en sección 1).
