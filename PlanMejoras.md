# PlanMejoras — SW42 (d3Front)

Plan de mejores prácticas post-migración Angular 22. Auditoría completa (sesión 8/8/2026). Cada punto se resuelve en un commit independiente en `main`.

## Fase P0 — Seguridad y Correctez Crítica

Bugs que comprometen seguridad o autenticación.

- [x] **P0-1** `pdf.service.ts:10` — secretos `P_KEY`/`P_TOKEN` hardcodeados en `config.ts` + HTTP sin TLS (`http://piopollo.softwareparati.com`). Secretos movidos a `config.ts` (importado desde `environments`), exigir HTTPS en backend. *(Nota: los secretos siguen en `config.ts` no en `environment.ts` — ver P0-extra).*
- [x] **P0-2** `login.service.ts:222-225` — `catchError` emite `of(error)` (truthy) → bypass de `AuthGuard` en fallo de red. Cambiar a `return of(false)`.
- [x] **P0-4** XSS potencial — `bypassSecurityTrustHtml` en `login.service.ts:168,175` → `[innerHTML]` en los 10 layouts. Render con escape o whitelist.
- [x] **P0-5** `signout()` llama `getOrganization()` (HTTP en pleno logout) — `login.service.ts:261`. Extraer solo limpieza local.
- [x] **P0-extra** `config.ts:2` — `apiUrl: 'http://localhost'` hardcodeado. **Decisión usuario**: dejar como `http://localhost` — es valor de desarrollo local, no de producción.

## Fase P1 — NG0100 / Reactividad

Estado mutado en suscripciones sin notificación al CD (zoneless + OnPush).

- [x] **P1-1** 5 componentes OnPush mutan props planas en subscribes sin CDR: `form.component.ts`, `massive.component.ts`, `cruds2.component.ts`, `security.component.ts`. Convertir estado a signals. *(Completado: `security`+`cruds2`+`massive` en P1-1a/P1-1b, `archivo` en P1-1d, `form` en P1-1e.)*
- [x] **P1-2** Anti-patrón: reasignación de signals en vez de `.set()` — `form.component.ts:196,386`. Corregir.
- [x] **P1-3** Migrar props planas de `form.component.ts` (`transiciones`, `reportes`, `messages`) a signal/computed.

## Fase P2 — Ciclo de vida RxJS

- [x] **P2-1** 102 `.subscribe()` sin cleanup en 36 archivos (neuron: 63). Priorizar `valueChanges.subscribe()` de controles (fuga de listeners por apertura de dialog) → `takeUntilDestroyed()` o `effect()`. **Completado**: 97 subscribes migradas en 34 archivos (neuron: archivo, configuracion, croquis, detalle ×5, disponibilidad ×2, fecha ×7, gps, gps-map, informative ×2, numero ×3, proceso ×6, product, producto-lista, seccion, vinculo ×3 + binario, direcciones, texto; app: accounting ×7, cruds2 ×3, notification-button ×4, sign-in ×4, flex ×6, addProperty ×6, fieldComponent ×5, addField ×3, transfer-form ×2, new-password ×2, security ×2, property-form ×2, recover-password, dfa, manual-form ×6, tasks/list ×4, tasks/details ×3, dashboard ×1). Skipped: `login.service.ts` (providedIn:'root', singleton never destroyed). Nota: tasks migrated from legacy `Subject+takeUntil` → `DestroyRef+takeUntilDestroyed`.
- [x] **P2-2** Suscripciones anidadas/recursivas → `switchMap`. **Completado**: `proceso.component.ts` (valueChanges → HTTP con switchMap+tap+of/map), `login.service.ts` (map+subscribe → switchMap). `trazability.component.ts` outer subscribe agregado `takeUntilDestroyed`. Subscribe anidados en dialog afterClosed (sign-in, trazability, form) salteados — no leak real, el dialog se completa.
- [x] **P2-3** 6 archivos con `Subject<any>` + `takeUntil` legacy → `takeUntilDestroyed()`. **Completado**: `layout.component.ts` y `persons.component.ts` migrados (2+1 subscribes). `shortcuts.component.ts` Subject eliminado + subscribe protegido. `recover-password.component.ts`, `new-password.component.ts`, `empty.component.ts` Subject y OnDestroy muertos eliminados. Net -64 líneas.

## Fase P3 — Deuda estructural del motor `neuron`

- [ ] **P3-1** God objects: `proceso.component.ts` (~1.400 líneas), `form.component.ts` (~1.150). Extraer lógica de relaciones/QR/menú a servicios. *(Parcial: extraídos `FormClipboardService`, `FormReportService`, `FormTransitionService`. Pendiente: `listar()` y `createNewDocument()` muy acoplados al estado del componente, no extraíbles limpiamente.)*
- [x] **P3-2** Bloque `relacionesPropiedad` duplicado 4× (proceso) + 1× (detalle) → único método memoizado `TemplateService.getOrFetchRelations()`. *(Completado: 5 call sites simplificados.)*
- [x] **P3-3** `getComponent()` switch → `Record<Enum, Type<IDynamicControl>>` con `default: TextoComponent`. *(Completado: `form-helper.ts` 83→44 líneas.)*
- [x] **P3-4** Código muerto: `api.service.getTemplates()` (0 usos), `conectionTemplates` (nunca se puebla), `utils.openPDF()` hardcodeado, `testPrint()`. *(Completado: ~65 líneas eliminadas en 4 archivos.)*
- [x] **P3-5** Duplicación: `guardarDocumento`/`saveByMassive` unificados vía `postDocumento()`, construcción de URLs de reporte (3× → `FormReportService`), boilerplate `getColor`/`getColorFont` (5× wrappers mínimos, templates los usan directamente). *(Completado.)*

## Fase P4 — TypeScript y Forms

- [x] **P4-1** `strict:false` + 50 `: any` + 48 `as any` + 366 `!`. **Completado parcial**: habilitados `strictBindCallApply`, `strictFunctionTypes`, `alwaysStrict` (ya estaban en tsconfig). Fixes: `accounting.component.ts` (AccountFlatNode+wbs), `tasks.component.ts` (fromEvent&lt;KeyboardEvent&gt;), `addProperty.ts` (ApiErrorResponse→any). `noImplicitAny` genera 838 errores — pendiente habilitar incrementalmente.
- [x] **P4-2** Archivos con `UntypedForm*` legacy → `FormBuilder` tipado. **Completado (7/7)**: `accounting`, `persons`, `numero`, `proceso`, `security` (FormGroup tipado completo), `property-form`. `manual-form`: migrado con casts puntuales (`as FormGroup`) en grupos dinámicos desde DTOs — el payload a la API se preserva intacto; coerción `Number()` en setHours/setMinutes y handlers pairwise null-safe.
- [x] **P4-3** `LoginService` god service (428 líneas) → **Completado**: extraído `CarouselService` (slides/landing/headerSection + loadFromOrganization) y `DateNotificationService` (date signal). LoginService delega ambos. Net -70 líneas en login.service.ts.

## Fase P5 — Testing y CI

- [x] **P5-1** Instalar `@vitest/coverage-v8`, bloque `coverage` en `vitest.config.ts` con umbrales, scripts `typecheck`/`test:coverage`/`test:ci`. **Completado**: coverage-v8 4.1.11, reporters text/html/lcov en `dist/coverage` (gitignored), `all:false` (solo archivos ejecutados — evita PARSE_ERROR de decoradores), umbrales trinquete: stmts/lines ≥30%, branches ≥20%, funcs ≥30% (baseline actual 37.5/24.8/35.4/38.0). Scripts: `typecheck`, `test:coverage`, `test:ci`.
- [ ] **P5-2** Tests del motor `neuron` (mayor riesgo, 0 cobertura de componentes). Ampliar servicios críticos. **Progreso**: `api.service.spec.ts` (+20 tests: endpoints GET/POST, headers non-duplicate, mapeo consultarDatosBase) y `utils.service.spec.ts` (+20 tests: fachada completa de diálogos, singleton flex/field, clase CSS body). 7 suites/106 tests. Pendiente: `proceso.component`, `form.component` (requieren harness de componentes).
- [x] **P5-3** Integrar `@angular-eslint` en `eslint.config.js`. **Completado**: plugin TS (14 reglas: 11 error — contextual-decorator/lifecycle, renames, pipe-impure, forward-ref, async-lifecycle...; 3 warn de migración — use-lifecycle-interface, prefer-inject, no-implicit-take-until-destroyed) + template-parser con 15 reglas HTML (eqeqeq smart, banana-in-box, a11y, duplicados). `no-console` → **error** con `allow:[warn,error]` (debug `log` prohibido, CI-failing). Bugs reales corregidos: `class` duplicado ignorado por navegador en `full-map.component.html:19` y `ol-map.component.html:22`, `console.log` debug en indicator-card. A11y (click-events/alt-text) en warn — backlog. `no-explicit-any` sigue warn (153 sitios).
- [x] **P5-4** Pipeline CI (GitHub Actions/GitLab): install → lint → typecheck → test+coverage → build. **Completado**: `.github/workflows/ci.yml` (GitHub, repo `jhonatan0330/d3_front`). Trigger push/PR a `main`, `concurrency` con cancelación de runs superados, Node 22 + caché npm, pasos: `npm ci` → `lint` (0 errores exigidos) → `typecheck` → `test:ci` (106 tests + umbrales coverage) → `build` prod → artifact del reporte HTML de coverage (`dist/coverage`, 7 días). YAML validado; aliases de vitest usan `process.cwd()` (portables a Linux).

## Limpiezas menores (rápidas)

- [x] AGENTS.md actualizado (afirmaciones desactualizadas corregidas: lint funciona, `gps` sigue activo, `throwError`/`ComponentFactoryResolver` resueltos, `@magloft` removido, `ignoreDeprecations` pendiente).
- [x] `persons` eager → lazy (`app.routing.ts:50`). *(Completado: lazy-loaded via `loadComponent`.)*
- [ ] `apiUrl: 'http://localhost'` en config (`config.ts:2`, `environment.prod.ts:6`). **Pendiente**: requiere decidir valor real HTTPS para prod.
- [ ] `ignoreDeprecations: "6.0"` en `tsconfig.json:6` — **pendiente**: aún necesario para TypeScript 6.0.x, eliminar cuando se migre a TS 6.1+.
- [x] URLs demo hardcodeadas (`visor-pdf-dialog.component.ts:38,46`) — eliminados URLs de debug (`orimi.com/pdf-test.pdf`).
- [x] `rxjs/operators` import legacy en `token.interceptor.ts:9` → migrado a `import { map } from 'rxjs'`.
