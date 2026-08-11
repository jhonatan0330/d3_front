# PlanMejoras — SW42 (d3Front)

Plan de mejores prácticas post-migración Angular 22. Auditoría completa (sesión 8/8/2026). Cada punto se resuelve en un commit independiente en `main`.

## Fase P0 — Seguridad y Correctez Crítica

Bugs que comprometen seguridad o autenticación.

- [x] **P0-1** `pdf.service.ts:10` — secretos `P_KEY`/`P_TOKEN` hardcodeados + HTTP sin TLS (`http://piopollo.softwareparati.com`). Mover a `environment.ts`, exigir HTTPS.
- [x] **P0-2** `login.service.ts:222-225` — `catchError` emite `of(error)` (truthy) → bypass de `AuthGuard` en fallo de red. Cambiar a `return of(false)`.
- [ ] **P0-3** JWT en query strings de reportes — `form.component.ts:966-987`, `cruds2.component.ts:472-490`, `manual-form.component.ts:411`. **Diseñado, NO aplicado (requiere backend).** Diseño: los 3 `showReport` abren `window.open(GET /reporte?nombre&P_KEY&P_TOKEN)`; el backend solo acepta GET con query params. Fix propuesto: (1) backend expone endpoint que acepta el JWT por header `Authorization` (ya lo añade `token.interceptor.ts` a las llamadas HttpClient de la app) o por body POST; (2) frontend unifica los 3 call sites en un único helper en `utils.service.ts` que hace `HttpClient.post(..., { responseType: 'blob' })` y abre el blob resultante (`URL.createObjectURL`) en pestaña nueva, replicando el comportamiento actual. No tocar `showReport` hasta coordinar backend.
- [x] **P0-4** XSS potencial — `bypassSecurityTrustHtml` en `login.service.ts:168,175` → `[innerHTML]` en los 10 layouts. Render con escape o whitelist.
- [x] **P0-5** `signout()` llama `getOrganization()` (HTTP en pleno logout) — `login.service.ts:261`. Extraer solo limpieza local.

## Fase P1 — NG0100 / Reactividad

Estado mutado en suscripciones sin notificación al CD (zoneless + OnPush).

- [ ] **P1-1** 5 componentes OnPush mutan props planas en subscribes sin CDR: `form.component.ts`, `massive.component.ts`, `cruds2.component.ts`, `security.component.ts`. Convertir estado a signals.
- [ ] **P1-2** Anti-patrón: reasignación de signals en vez de `.set()` — `form.component.ts:196,386`. Corregir.
- [ ] **P1-3** Migrar props planas de `form.component.ts` (`transiciones`, `reportes`, `messages`) a signal/computed.

## Fase P2 — Ciclo de vida RxJS

- [ ] **P2-1** 119 `.subscribe()` sin cleanup en 36 archivos (neuron: 63). Priorizar `valueChanges.subscribe()` de controles (fuga de listeners por apertura de dialog) → `takeUntilDestroyed()` o `effect()`.
- [ ] **P2-2** Suscripciones anidadas/recursivas: `form.component.ts:1141`, `detalle.component.ts:414`, `proceso.component.ts:1094,1132,1184` (recursión HTTP sin guarda anti-reentrada).
- [ ] **P2-3** 22 archivos con `Subject<any>` + `takeUntil` legacy → `takeUntilDestroyed()`.

## Fase P3 — Deuda estructural del motor `neuron`

- [ ] **P3-1** God objects: `proceso.component.ts` (1.625 líneas), `form.component.ts` (1.204). Extraer lógica de relaciones/QR/menú a servicios.
- [ ] **P3-2** Bloque `relacionesPropiedad` duplicado 4× (proceso) + 1× (detalle) → único método memoizado en `TemplateService`.
- [ ] **P3-3** `getComponent()` switch → `Record<Enum, Type<IDynamicControl>>` con `default: TextoComponent`.
- [ ] **P3-4** Código muerto: `api.service.getTemplates()` (0 usos), `conectionTemplates` (nunca se puebla), `utils.openPDF()` hardcodeado.
- [ ] **P3-5** Duplicación: `guardarDocumento`/`saveByMassive`, construcción de URLs de reporte (3×), boilerplate `getColor`/`getColorFont` (5×).

## Fase P4 — TypeScript y Forms

- [ ] **P4-1** `strict:false` + 188 `any` + 48 `as any` + 366 `!` (`form.component.ts`: 105). Subir a `strict:true` incremental (por archivo).
- [ ] **P4-2** 8 archivos con `UntypedForm*` legacy → `FormBuilder` tipado / `NonNullableFormBuilder`.
- [ ] **P4-3** `LoginService` god service → extraer carrusel/landing/auth a servicios dedicados.

## Fase P5 — Testing y CI

- [ ] **P5-1** Instalar `@vitest/coverage-v8`, bloque `coverage` en `vitest.config.ts` con umbrales, scripts `typecheck`/`test:coverage`/`test:ci`.
- [ ] **P5-2** Tests del motor `neuron` (mayor riesgo, 0 cobertura de componentes). Ampliar de 3/18 servicios a todos los críticos.
- [ ] **P5-3** Integrar `@angular-eslint` en `eslint.config.js` (inactivo hoy), reparar `ng lint`, subir `no-explicit-any`/`no-console` a `error`.
- [ ] **P5-4** Pipeline CI (GitHub Actions/GitLab): install → lint → typecheck → test+coverage → build.

## Limpiezas menores (rápidas)

- [ ] Ruta debug `noseperolodejopormodule/form` (app.routing.ts:42).
- [ ] `persons` eager → lazy (`app.routing.ts:6,46`).
- [ ] `apiUrl: 'http://localhost'` en config prod (`config.ts:2`, `environment.prod.ts:6`).
- [ ] URLs demo hardcodeadas (`visor-pdf-dialog.component.ts:41,46`).
- [ ] Actualizar AGENTS.md (afirmaciones desactualizadas: `ComponentFactoryResolver` ya no existe, `gps` sigue activo, `takeUntilDestroyed` en uso).
