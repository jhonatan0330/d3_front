# PlanMejoras — SW42 (d3Front)

Plan de mejores prácticas post-migración Angular 22. Auditoría completa (sesión 8/8/2026). Cada punto se resuelve en un commit independiente en `main`.

## Fase P0 — Seguridad y Correctez Crítica

Bugs que comprometen seguridad o autenticación.

- [x] **P0-1** `pdf.service.ts:10` — secretos `P_KEY`/`P_TOKEN` hardcodeados en `config.ts` + HTTP sin TLS (`http://piopollo.softwareparati.com`). Secretos movidos a `config.ts` (importado desde `environments`), exigir HTTPS en backend. *(Nota: los secretos siguen en `config.ts` no en `environment.ts` — ver P0-extra).*
- [x] **P0-2** `login.service.ts:222-225` — `catchError` emite `of(error)` (truthy) → bypass de `AuthGuard` en fallo de red. Cambiar a `return of(false)`.
- [ ] **P0-3** JWT en query strings de reportes — `form.component.ts:966-987`, `cruds2.component.ts:472-490`, `manual-form.component.ts:411`. **Diseñado, NO aplicado (requiere backend).** Diseño: los 3 `showReport` abren `window.open(GET /reporte?nombre&P_KEY&P_TOKEN)`; el backend solo acepta GET con query params. Fix propuesto: (1) backend expone endpoint que acepta el JWT por header `Authorization` (ya lo añade `token.interceptor.ts` a las llamadas HttpClient de la app) o por body POST; (2) frontend unifica los 3 call sites en un único helper en `utils.service.ts` que hace `HttpClient.post(..., { responseType: 'blob' })` y abre el blob resultante (`URL.createObjectURL`) en pestaña nueva, replicando el comportamiento actual. No tocar `showReport` hasta coordinar backend.
- [x] **P0-4** XSS potencial — `bypassSecurityTrustHtml` en `login.service.ts:168,175` → `[innerHTML]` en los 10 layouts. Render con escape o whitelist.
- [x] **P0-5** `signout()` llama `getOrganization()` (HTTP en pleno logout) — `login.service.ts:261`. Extraer solo limpieza local.
- [ ] **P0-extra** `config.ts:2` — `apiUrl: 'http://localhost'` hardcodeado en prod. Mover a `environment.prod.ts` con valor HTTPS real.

## Fase P1 — NG0100 / Reactividad

Estado mutado en suscripciones sin notificación al CD (zoneless + OnPush).

- [x] **P1-1** 5 componentes OnPush mutan props planas en subscribes sin CDR: `form.component.ts`, `massive.component.ts`, `cruds2.component.ts`, `security.component.ts`. Convertir estado a signals. *(Completado: `security`+`cruds2`+`massive` en P1-1a/P1-1b, `archivo` en P1-1d, `form` en P1-1e.)*
- [x] **P1-2** Anti-patrón: reasignación de signals en vez de `.set()` — `form.component.ts:196,386`. Corregir.
- [x] **P1-3** Migrar props planas de `form.component.ts` (`transiciones`, `reportes`, `messages`) a signal/computed.

## Fase P2 — Ciclo de vida RxJS

- [ ] **P2-1** 102 `.subscribe()` sin cleanup en 36 archivos (neuron: 63). Priorizar `valueChanges.subscribe()` de controles (fuga de listeners por apertura de dialog) → `takeUntilDestroyed()` o `effect()`. **Parcial**: 42 `valueChanges`/API subscribes de controles migrados (archivo, configuracion, croquis, detalle ×5, disponibilidad ×2, fecha ×7, gps, gps-map, informative ×2, numero ×3, proceso ×6, product, producto-lista, seccion, vinculo ×3 + binario, direcciones, texto). Pendiente: ~60 subscribes restantes (Secciones B neuron y C app). *(Nota: 12 migrados en tanda 1 + 13 en tanda 2 = 25 nuevos esta sesión.)*
- [ ] **P2-2** Suscripciones anidadas/recursivas: `form.component.ts:1141`, `detalle.component.ts:414`, `proceso.component.ts:1094,1132,1184` (recursión HTTP sin guarda anti-reentrada).
- [ ] **P2-3** 22 archivos con `Subject<any>` + `takeUntil` legacy → `takeUntilDestroyed()`.

## Fase P3 — Deuda estructural del motor `neuron`

- [ ] **P3-1** God objects: `proceso.component.ts` (~1.400 líneas), `form.component.ts` (~1.150). Extraer lógica de relaciones/QR/menú a servicios. *(Parcial: extraídos `FormClipboardService`, `FormReportService`, `FormTransitionService`. Pendiente: `listar()` y `createNewDocument()` muy acoplados al estado del componente, no extraíbles limpiamente.)*
- [x] **P3-2** Bloque `relacionesPropiedad` duplicado 4× (proceso) + 1× (detalle) → único método memoizado `TemplateService.getOrFetchRelations()`. *(Completado: 5 call sites simplificados.)*
- [x] **P3-3** `getComponent()` switch → `Record<Enum, Type<IDynamicControl>>` con `default: TextoComponent`. *(Completado: `form-helper.ts` 83→44 líneas.)*
- [x] **P3-4** Código muerto: `api.service.getTemplates()` (0 usos), `conectionTemplates` (nunca se puebla), `utils.openPDF()` hardcodeado, `testPrint()`. *(Completado: ~65 líneas eliminadas en 4 archivos.)*
- [x] **P3-5** Duplicación: `guardarDocumento`/`saveByMassive` unificados vía `postDocumento()`, construcción de URLs de reporte (3× → `FormReportService`), boilerplate `getColor`/`getColorFont` (5× wrappers mínimos, templates los usan directamente). *(Completado.)*

## Fase P4 — TypeScript y Forms

- [ ] **P4-1** `strict:false` + 50 `: any` + 48 `as any` + 366 `!` (`form.component.ts`: 105). Subir a `strict:true` incremental (por archivo). *(Nota: el conteo original de 188 `any` incluía matches de `as any` — separar: 50 anotaciones `: any` + 48 `as any` explícitos).*
- [ ] **P4-2** 8 archivos con `UntypedForm*` legacy → `FormBuilder` tipado / `NonNullableFormBuilder`.
- [ ] **P4-3** `LoginService` god service (432 líneas) → extraer carrusel/landing/auth a servicios dedicados.

## Fase P5 — Testing y CI

- [ ] **P5-1** Instalar `@vitest/coverage-v8`, bloque `coverage` en `vitest.config.ts` con umbrales, scripts `typecheck`/`test:coverage`/`test:ci`.
- [ ] **P5-2** Tests del motor `neuron` (mayor riesgo, 0 cobertura de componentes). Ampliar de 1/4 servicios testados (`template.service.spec.ts`) a todos los críticos (`api.service`, `utils.service`, `form.component`, `proceso.component`). *(Nota: 5 suites/66 tests pass; `neuron` tiene 35 archivos TS, 1 spec).*
- [ ] **P5-3** Integrar `@angular-eslint` en `eslint.config.js` (inactivo hoy). Lint ya funciona con 165 warnings/0 errors (`ng lint` funciona); añadir `@angular-eslint` rules, subir `no-explicit-any`/`no-console` a `error`.
- [ ] **P5-4** Pipeline CI (GitHub Actions/GitLab): install → lint → typecheck → test+coverage → build.

## Limpiezas menores (rápidas)

- [x] AGENTS.md actualizado (afirmaciones desactualizadas corregidas: lint funciona, `gps` sigue activo, `throwError`/`ComponentFactoryResolver` resueltos, `@magloft` removido, `ignoreDeprecations` pendiente).
- [x] `persons` eager → lazy (`app.routing.ts:50`). *(Completado: lazy-loaded via `loadComponent`.)*
- [ ] `apiUrl: 'http://localhost'` en config (`config.ts:2`, `environment.prod.ts:6`). **Pendiente**: requiere decidir valor real HTTPS para prod.
- [ ] `ignoreDeprecations: "6.0"` en `tsconfig.json:6` — **pendiente**: aún necesario para TypeScript 6.0.x, eliminar cuando se migre a TS 6.1+.
- [x] URLs demo hardcodeadas (`visor-pdf-dialog.component.ts:38,46`) — eliminados URLs de debug (`orimi.com/pdf-test.pdf`).
- [x] `rxjs/operators` import legacy en `token.interceptor.ts:9` → migrado a `import { map } from 'rxjs'`.
