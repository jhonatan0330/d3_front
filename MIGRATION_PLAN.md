# Plan de Migración: Angular 17.3 → Angular 22

## Contexto del Proyecto

| Métrica | Valor |
|---|---|
| Angular actual | 17.3.12 (EOL mayo 2025) |
| Angular objetivo | 22 (estable, junio 2026) |
| Componentes | ~75 |
| Servicios | ~21 |
| Módulos Ng | 32 |
| Rutas lazy | 8 |
| Módulo más complejo | Neuron (motor de forms dinámicos, 21 componentes, 1200+ líneas) |
| Template base | @fuse (107 archivos, 14 NgModules, 100% constructor injection) |

---

## Fase 0: Preparación (1 semana)

### 0.1 Auditoría pre-migración
- [ ] Crear rama `migration/angular-22` desde `main`
- [ ] Ejecutar `npm install` y `ng build` — asegurar que todo compila en Angular 17
- [ ] Crear un checkpoint (`git tag migration/angular-17`) al cierre de cada fase para poder hacer rollback
- [ ] Documentar bugs existentes (no corregir, solo registrar)

> **Nota**: `npm test` está roto — **no existen `*.spec.ts` ni `src/test.ts`** en el repo. La verificación es **solo `ng build`** + `npx tsc -p tsconfig.app.json --noEmit`.

### 0.1a Hallazgos de la auditoría (5/8/2026, solo registrar, no corregir)
- `npm run build` estaba roto: `--build-optimizer` no existe en CLI 17.3 (builder `application` esbuild). **Corregido**: script → `ng build`.
- `index.html` referencia `assets/styles/splash-screen.css` que **no existe** → warning de build (fallback a `C:\assets\styles\...`).
- Bundle inicial **3.53 MB** supera el budget de 3.00 MB (warning).
- Dependencias CommonJS que causan bailout de optimización: `lerc`/`geotiff`, `apexcharts`, `sweetalert2`, `file-saver`.
- **Node 24** no es soportado por Angular 17 (solo warning; se resuelve al llegar a Angular 20+).
- `npm run lint` ya estaba roto: no existe target `lint` en `angular.json` (aunque hay `.eslintrc.json`). No bloquea la migración.

### 0.2 Dependencias críticas a resolver ANTES de empezar

| Dependencia | Problema | Acción |
|---|---|---|
| `@magloft/material-carousel@14` | **Abandonado**, no funciona más allá de Angular 14 | **HECHO**: reemplazado por `swiper@11` (custom elements `<swiper-container>`) en el carrusel de portadas del perfil |
| `ngx-editor@17` | Abandonado (latest = `19.0.0-beta.1`) | **Plan**: mantener `ngx-editor@17` durante la migración (peers `>=17.1.0`, soporta 17→22) y **swap a `@bobbyquantum/ngx-editor@22` en Fase 4** (drop-in, misma API `Editor`/`NgxEditorModule`/`Toolbar`, requiere Angular 21+). Único consumidor: `tasks/details/details.component.ts`. `@tiptap/angular` NO existe en npm. |
| `ng-apexcharts@1.8` | Necesita salto a `@2.4` + `apexcharts@5.x` | Upgrade conjunto |
| `@zxing/ngx-scanner@17` | Upgrade directo a `@22` | Upgrade normal |

### 0.3 Decisión sobre @fuse
El template FuseAdmin (107 archivos, 14 NgModules) usa patrones anticuados:
- 100% constructor injection (no `inject()`)
- NgModules en todos lados
- `HTTP_INTERCEPTORS` deprecated
- `ComponentFactoryResolver` deprecated

**Opción A**: Mantener @fuse y adaptar (menos trabajo inicial, más deuda técnica)
**Opción B**: Reemplazar por otro admin template (más trabajo inicial, más limpio)

**Recomendación**: Opción A por ahora. Fuse funciona y reemplazarlo es un proyecto separado.

### 0.4 Entorno (estado actual)
- Node.js **24** ya instalado (requisito Angular 22: ≥20.11.1) — OK, sin cambios
- No existe `.browserslistrc` en el repo (CLI usa defaults) — crear solo si se requiere soporte específico
- No hay workflows CI en el repo — coordinar el requisito de Node con el CI externo

---

## Fase 1: Angular 17 → 18 (2 semanas)

### 1.1 Upgrade core
- [x] `ng update @angular/core@18 @angular/cli@18` (core 18.2.14, CLI 18.2.21) + `ng update @angular/material@18 @angular/cdk@18` (18.2.14)
- [x] **Bloqueante resuelto**: `node-xlsx` trae `xlsx` vía tarball CDN de SheetJS y npm 12 (`allow-remote=none`) lo bloquea → se añadió `xlsx@0.18.5` como dependencia directa + `overrides` en `package.json`
- [x] `esbuild@0.23.0` (usado por build-angular 18) agregado a `allowScripts` de `package.json`

**Breaking changes principales:**
- Node.js 16 dropped (requiere 18.13+)
- TypeScript 5.2+ required
- Angular Material migrado a MDC (ya estaba desde 15, verificar estilos)

### 1.2 Dependencias de terceros
- [x] `npm install @zxing/ngx-scanner@18`
- [x] `npm install ng-apexcharts@1.11 apexcharts@^3.49`
> `apexcharts@^4` NO matchea con `ng-apexcharts@1.11` (pide `^3.49.1`); el `^4`/`^5` va con `ng-apexcharts@2.x` en Fase 4.

### 1.3 Cambios manuales
- [x] Verificar que los estilos de Angular Material no se rompieron (MDC classes) — build OK
- [x] Fix `throwError(arg)` → `throwError(() => arg)` (lazy arg) en **ambos** lugares:
  - [x] `shared/error.interceptor.ts:53`
  - [x] `authentication/login.service.ts:114`
- [x] Migrar `ComponentFactoryResolver` → `ViewContainerRef.createComponent(Type)` **temprano** (de-risking del módulo crítico antes de que rompa en majors posteriores), en los **3** archivos:
  - [x] `cruds/cruds2.component.ts`
  - [x] `neuron/form/form.component.ts`
  - [x] `neuron/form/controls/product/product.component.ts`

### 1.4 Verificación
- [x] `ng build` exitoso + `npx tsc --noEmit` limpio (sin `npm test`: no hay suite de tests)
- [ ] Smoke test manual: login, forms dinámicos, mapas (controles GPS de Neuron), tareas — **pendiente del usuario** (requiere backend)

---

## Fase 2: Angular 18 → 19 (2 semanas)

### 2.1 Upgrade core
```bash
ng update @angular/core@19 @angular/cli@19
```

### 2.2 Breaking changes importantes
- **Signals estabilizados** (pero no obligatorios aún)
- `standalone: true` es el default para nuevos componentes
- `APP_INITIALIZER` deprecado → `provideAppInitializer()`
- `afterRender()` renombrado a `afterEveryRender()` (si se usa)

### 2.3 Dependencias de terceros
- [x] `npm install @zxing/ngx-scanner@19`
- [x] `ngx-editor@17` se mantiene (swap a fork en Fase 4, ver Fase 0.2)
- [x] `npm install ng-apexcharts@1.15 apexcharts@^4`
> **Cuidado**: `ng-apexcharts@1.14.0` está publicado **sin archivos compilados** (publish roto, solo source). Usar `1.15.0` (misma compat Angular 19).

### 2.4 Migración de @fuse
- [x] Verificar que `FuseModule` y sub-módulos compilan en 19 — build OK (migración `standalone: false` automática aplicada por ng update)
- [x] Fix `Router.isActive(link, boolean)` → `IsActiveMatchOptions` (`collapsable.component.ts` y `aside.component.ts`, usando `FuseUtilsService.exactMatchOptions`/`subsetMatchOptions`)
- [x] Verificar `FuseLoadingInterceptor` con `HTTP_INTERCEPTORS` — build OK

### 2.5 Verificación
- [x] Build OK + `npx tsc --noEmit` limpio (`npm test` no aplica: no hay suite)
- [x] Smoke test manual — **confirmado por el usuario** (app corre normal)
- [x] Commit + tag `migration/angular-19`

---

## Fase 3: Angular 19 → 20 (1 semana)

### 3.1 Upgrade core
```bash
ng update @angular/core@20 @angular/cli@20
```

### 3.2 Breaking changes críticos
- **Node.js 18 dropped** (requiere 20.11.1+; ya tenemos Node 24 — OK)
- **Karma eliminado** de `@angular/build` → **eliminar Karma por completo** (no hay `*.spec.ts` ni `src/test.ts`, no existe suite que migrar; no usar bridge temporal)
- `@angular-devkit/build-angular` → `@angular/build` (nuevo paquete)

### 3.3 Acciones
- [x] Verificar Node.js en CI/CD (local ya está en 24 — OK)
- [x] Eliminar config de Karma: bloque `test` de `angular.json`, deps `karma*`/`jasmine*` de `package.json`, `tsconfig.spec.json` (ya no existía `src/test.ts`) y scripts `test`/`lint` de package.json
- [x] Migrar builders a `@angular/build:application` / `@angular/build:dev-server` / `@angular/build:extract-i18n` (la migración `use-application-builder` solo agregó el bloque `schematics`)
- [x] Verificar `browserslist` (Opera removido) si se crea el archivo — no aplica, no existe archivo
- [x] Deps de terceros: `@zxing/ngx-scanner@20`, `ng-apexcharts@1.16` (soporta Angular ^20 manteniendo apexcharts ^4; la serie 2.x queda para Fase 4), `lodash` como dependencia directa (lo usa `src/@fuse/tailwind/utils/generate-palette.js`; dejó de ser transitivo), `rxjs@7.8.2` (peer mínimo de ng-apexcharts@1.16)
- [x] Migración automática `DOCUMENT` de `@angular/common` → `@angular/core` (4 archivos)

### 3.4 Verificación
- [x] Build OK + `npx tsc --noEmit` limpio (solo warnings ya documentados: budget initial 3.21MB, non-ESM de geotiff/sweetalert2/file-saver, splash-screen.css ausente)
- [ ] Smoke test manual — **pendiente del usuario**

---

## Fase 4: Angular 20 → 21 → 22 (2 semanas)

### 4.1 Upgrade secuencial
```bash
ng update @angular/core@21 @angular/cli@21
# ... fix issues ...
ng update @angular/core@22 @angular/cli@22
```

### 4.2 Cambios Angular 21
- **Zoneless es default solo para proyectos NUEVOS**; esta app usa zone.js y **se mantiene zone.js durante toda la migración** (totalmente soportado). Migración a zoneless = Fase 5, decisión explícita y opcional.
- `afterRender()` → `afterEveryRender()` (verificar en @fuse y app code) — no se usa `afterRender` en el código, no aplica
- **[x] Ejecutado**: `ng update @angular/core@21 @angular/cli@21` + `ng update @angular/material@21 @angular/cdk@21` → core/cli 21.2.x, material/cdk 21.x, control-flow migration automática (68 archivos HTML/TS)
- **[x] Breaking fix**: `MATERIAL_SANITY_CHECKS` eliminado de Material 21 → removido el provider de `src/@fuse/fuse.module.ts`
- **[x] Breaking fix**: `@HostListener` con métodos `private` ya no compila en 21 → `_onMouseenter`/`_onMouseleave` pasan a `onMouseenter`/`onMouseleave` públicos en `vertical.component.ts`

### 4.3 Cambios Angular 22
- Signal forms estables
- Selectorless components
- `@angular/build` reemplaza completamente a `@angular-devkit/build-angular`
- **[x] Ejecutado**: `ng update @angular/core@22 @angular/cli@22` + `ng update @angular/material@22 @angular/cdk@22` → core 22.1.0, cli/build 22.1.3, material/cdk 22.1.1, TypeScript 6.0.3, zone.js 0.15.1 (control-flow/standalone migrations automáticas)
- **[x] TypeScript 6 rompe el build**: `--strict` pasa a ser **default** → se añadió `"strict": false` explícito a `tsconfig.json` (la modernización a strict/signals es Fase 5, no mezclar con el upgrade). `baseUrl`/`downlevelIteration` deprecados → `"ignoreDeprecations": "6.0"`.
- **[x] NG4003**: `extendedDiagnostics` configurado con `strictTemplates: false` no tiene efecto → eliminado el bloque `extendedDiagnostics` de `tsconfig.app.json`
- **[x] Apexcharts bug**: `apexcharts@5.16.0` rompe con `TS2304: Cannot find name 'ApexDrilldownEvent'` (issue apexcharts/ng-apexcharts#493) → **pin `apexcharts@5.15.2`** (exacto, compatible con `ng-apexcharts@2.4.0`)
- **[x] Breaking fix**: `ModuleWithComponentFactories` eliminado de `@angular/core` 22 → quitado el import sin uso de `src/app/persons/persons.ts`

### 4.4 Dependencias finales
```bash
npm install @zxing/ngx-scanner@22
npm install ng-apexcharts@2.4 apexcharts@^5.10
npm uninstall ngx-editor
npm install @bobbyquantum/ngx-editor@22   # drop-in de ngx-editor
```
- [x] **Ejecutado**: `@zxing/ngx-scanner@22.0.0`, `ng-apexcharts@2.4.0` + `apexcharts@5.15.2` (pin por bug TS2304), `@bobbyquantum/ngx-editor@22.0.1` (import actualizado en `tasks/details/details.component.ts`)

### 4.5 Verificación final
- [x] Build completo sin warnings críticos (solo los ya documentados: non-ESM de geotiff/sweetalert2/file-saver y splash-screen.css ausente) + `npx tsc -p tsconfig.app.json --noEmit` limpio
- [ ] Todos los tests pasando — **N/A**: no existe suite (`*.spec.ts`/`src/test.ts`); montar Vitest es Fase 5.5
- [ ] Smoke test de todas las funcionalidades:
  - [x] Login / autenticación — **confirmado por el usuario** (8/8/2026)
  - [ ] Neuron (forms dinámicos, controles GPS/Mapa con OpenLayers)
  - [ ] Tareas
  - [ ] Contabilidad
  - [ ] Personas
  - [ ] Carga masiva
  - [ ] Notificaciones

---

## Fase 5: Limpieza y Modernización (post-migración, continuo)

Esta fase es **después** de que todo funcione en Angular 22. No combinar con la migración de versión.

### 5.1 Limpieza inmediata
- [x] Eliminar `HttpClientModule` redundante de los 10 layout modules (solo queda el provider en `main.ts`)
- [x] Eliminar `PreloadAllModules` (las rutas lazy cargan al navegar; menos descarga inicial)
- [x] Fix naming inconsistente: `persons.ts`/`persons.html` → `persons.component.ts`/`.html`; `detail_persons.ts` → `detail-person.component.ts` (vía `git mv`)

### 5.2 Migración a standalone (workflow oficial en 3 fases, `ng generate @angular/core:standalone`)
- [x] Fase 1: **convert-to-standalone** — 100 archivos (componentes/directivas/pipes a standalone, modules actualizados); limpiados 3 imports no usados (NG8113 en `vertical.component.ts`, `archivo.component.ts`, `form.component.ts`)
- [x] `ng build` + `npx tsc --noEmit` OK
- [x] Fase 2: **prune-ng-modules** — borrados 7 NgModule (scrollbar, navigation, shared, notification, shortcuts, user, home-button); fix barrels `public-api.ts` que aún exportaban los módulos borrados
- [x] `ng build` + `npx tsc --noEmit` OK
- [x] Fase 3: **standalone-bootstrap** — eliminado `app.module.ts`, `main.ts` usa `bootstrapApplication` (interceptores/error handler/date locale preservados en providers)
- [x] `ng build` + `npx tsc --noEmit` OK (bundle inicial 2.26 MB, dentro de budget)

### 5.3 Adoption de Signals (gradual, usar schematics oficiales, no refactor manual)
- [x] `ng generate @angular/core:inject` — constructor injection → `inject()` (~101 archivos); fix `ImageFormatPipe` con constructor opcional (`ls ?? inject(...)`) porque se instancia manualmente con `new` en estructura.ts/puesto.ts
- [x] `ng generate @angular/core:signal-input-migration` — inputs → signal inputs (61/61). **Revierte a `@Input()` los inputs que el componente escribe**: `vertical.component.ts` (inner, name, opened, transparentOverlay), `horizontal.component.ts` (name), `scrollbar.directive.ts` (fuseScrollbar), `ol-map`/`full-map` (lat, lon). Fixes de templates e imports (TS2540)
- [x] `ng generate @angular/core:signal-queries-migration` — queries → signal queries (19/25; 6 quedaron como `@ViewChild`). Fix de `this.video()?.nativeElement` en change-picture (variable local `videoEl`) y `this.iframe()` en visor-pdf-dialog
- [x] `ng generate @angular/core:output-migration` — outputs → signal outputs (7/8)
- [x] `ng generate @angular/core:control-flow` — `*ngIf/*ngFor/*ngSwitch` → `@if/@for/@switch` (organization.component.html; el resto de usos están en comentarios HTML → código muerto)
- [x] `ng build` + `npx tsc --noEmit` OK en cada subfase
- Empezar por servicios con BehaviorSubjects (pendiente, no bloqueante)
- Neuron es el último en migrar (muy complejo) — pendiente

### 5.4 Migración de interceptores
- [x] `HTTP_INTERCEPTORS` class-based → `withInterceptors()` functional (vía `provideHttpClient`)
- [x] Aplicar a `TokenInterceptor`, `HttpErrorInterceptor`, `FuseLoadingInterceptor`
- [x] Eliminado `FuseLoadingModule` (solo existía para el interceptor); `main.ts` usa `provideHttpClient(withInterceptors([fuseLoadingInterceptor, tokenInterceptor, httpErrorInterceptor]))`; helper functions de token interceptor pasadas a top-level
- [x] `ng build` + `npx tsc --noEmit` OK
- [ ] Decidir migración a **zoneless** (`provideZonelessChangeDetection()`): evaluar usos de `NgZone`/zone.js; opcional y solo cuando la versión esté estable

### 5.5 Testing framework
- [ ] No hay suite que migrar (cero tests). Si se quieren tests, **montar Vitest desde cero** (runner primario en Angular 21+): configurar Vitest y escribir una primera suite sobre un módulo pequeño

---

## Riesgos Principales

| Riesgo | Impacto | Mitigación |
|---|---|---|
| @fuse no compila en Angular 22 | **Alto** | Mantener copia funcional de @fuse; si no compila, migrar a otro template o refactorizar @fuse incrementalmente |
| Neuron module se rompe | **Alto** | El motor de forms dinámicos usa `ComponentFactoryResolver` (3 archivos: `cruds2`, `neuron/form`, `neuron/controls/product`); migrar a `ViewContainerRef.createComponent(Type)` en Fase 1 como de-risking |
| `ngx-editor` sin soporte | **Medio** | Evaluar migración a Tiptap antes de la migración |
| `@magloft/material-carousel` roto | **Alto** | Reemplazar en Fase 0 antes de empezar |
| Sin suite de tests | **Bajo** | No existen `*.spec.ts` ni `src/test.ts`; eliminar Karma en Fase 3 y (opcional) montar Vitest desde cero en Fase 5 |

---

## Timeline Resumido

| Fase | Duración | Acumulado |
|---|---|---|
| Fase 0: Preparación | 1 semana | Semana 1 |
| Fase 1: 17 → 18 | 2 semanas | Semana 3 |
| Fase 2: 18 → 19 | 2 semanas | Semana 5 |
| Fase 3: 19 → 20 | 1 semana | Semana 6 |
| Fase 4: 20 → 22 | 2 semanas | Semana 8 |
| **Total migración versión** | **8 semanas** | |
| Fase 5: Modernización | Continuo | Post-migración |

---

## Hallazgos Técnicos Detallados

### @fuse (Template Base)
- **107 archivos**: 73 TS, 14 SCSS, 14 HTML, 6 JS (Tailwind plugins)
- **14 NgModules**, todos con constructor injection (no `inject()`)
- **Servicios**: FuseLoadingService, FuseConfigService, FuseMediaWatcherService, FusePlatformService, FuseUtilsService, FuseDrawerService, FuseNavigationService
- **APIs deprecated**: `HTTP_INTERCEPTORS`, `HttpInterceptor`, `ComponentFactoryResolver`, `Router.isActive(link, boolean)`
- **Angular Material**: Usa MDC components, deshabilita `MATERIAL_SANITY_CHECKS`

### Neuron (Motor de Forms Dinámicos)
- **21 componentes**, 3 servicios, 64 archivos totales
- **16 tipos de controles dinámicos** (texto, fecha, número, binario, proceso, archivo, croquis, GPS, etc.)
- **Rendering dinámico** via `ComponentFactoryResolver` + `ViewContainerRef` (deprecated, presente en 3 archivos: `cruds/cruds2.component.ts`, `neuron/form/form.component.ts`, `neuron/form/controls/product/product.component.ts`)
- **50+ property keys** que controlan comportamiento de campos
- **State machine** para transiciones de documentos
- **Multi-server federation** para templates

### Interceptores
- `TokenInterceptor`: Agrega Authorization header, convierte fechas
- `HttpErrorInterceptor`: Maneja errores, usa `throwError(string)` (deprecated → `throwError(() => string)`) en `error.interceptor.ts:53` y `login.service.ts:114`
- `FuseLoadingInterceptor`: Loading bar automático

### Routing
- 9 rutas lazy con `PreloadAllModules`
- `AuthGuard` protege sección admin
- `CanDeactivateTasksDetails` guard para tareas

### Dependencias Framework-Agnósticas (sin problemas)
- `ol` (OpenLayers) — pure JS
- `sweetalert2` — pure JS
- `signature_pad` — pure JS
- `perfect-scrollbar` — pure JS
- `ngx-image-compress` — compatible con cualquier Angular >9
