# Plan de Migración: Angular 17.3 → Angular 22

## Contexto del Proyecto

| Métrica | Valor |
|---|---|
| Angular actual | 17.3.12 (EOL mayo 2025) |
| Angular objetivo | 22 (estable, junio 2026) |
| Componentes | ~75 |
| Servicios | ~21 |
| Módulos Ng | 32 |
| Rutas lazy | 9 |
| Módulo más complejo | Neuron (motor de forms dinámicos, 21 componentes, 1200+ líneas) |
| Template base | @fuse (107 archivos, 14 NgModules, 100% constructor injection) |

---

## Fase 0: Preparación (1 semana)

### 0.1 Auditoría pre-migración
- [ ] Crear rama `migration/angular-22` desde `main`
- [ ] Ejecutar `ng build` y `ng test` — asegurar que todo compila y pasa en Angular 17
- [ ] Documentar bugs existentes (no corregir, solo registrar)

### 0.2 Dependencias críticas a resolver ANTES de empezar

| Dependencia | Problema | Acción |
|---|---|---|
| `@magloft/material-carousel@14` | **Abandonado**, no funciona más allá de Angular 14 | **Reemplazar** por `swiper` o carousel nativo de Angular Material |
| `ngx-editor@17` | Solo hasta beta para Angular 19+ | Evaluar `@tiptap/angular` como alternativa |
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

---

## Fase 1: Angular 17 → 18 (2 semanas)

### 1.1 Upgrade core
```bash
ng update @angular/core@18 @angular/cli@18
```
**Breaking changes principales:**
- Node.js 16 dropped (requiere 18.13+)
- TypeScript 5.2+ required
- Angular Material migrado a MDC (ya estaba desde 15, verificar estilos)

### 1.2 Dependencias de terceros
```bash
npm install @zxing/ngx-scanner@18
npm install ng-apexcharts@1.11 apexcharts@^4
```

### 1.3 Cambios manuales
- [ ] Verificar que los estilos de Angular Material no se rompieron (MDC classes)
- [ ] Actualizar `browserslist` si es necesario
- [ ] Fix `throwError(errorMessage)` → `throwError(() => errorMessage)` en `error.interceptor.ts`

### 1.4 Verificación
- [ ] `ng build` exitoso
- [ ] `ng test` todos pasan
- [ ] Smoke test manual: login, forms, mapa GPS, tareas

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
```bash
npm install @zxing/ngx-scanner@19
npm install ngx-editor@19.0.0-beta.1  # o evaluar alternativa
npm install ng-apexcharts@1.14 apexcharts@^4
```

### 2.4 Migración de @fuse
- [ ] Verificar que `FuseModule` y sub-módulos compilan en 19
- [ ] Fix `Router.isActive(link, boolean)` → usar `IsActiveMatchOptions`
- [ ] Verificar `FuseLoadingInterceptor` con `HTTP_INTERCEPTORS`

### 2.5 Verificación
- [ ] Build + test + smoke test completo

---

## Fase 3: Angular 19 → 20 (1 semana)

### 3.1 Upgrade core
```bash
ng update @angular/core@20 @angular/cli@20
```

### 3.2 Breaking changes críticos
- **Node.js 18 dropped** (requiere 20.11.1+)
- **Karma eliminado** de `@angular/build` → necesita `@angular-devkit/build-angular` temporal o migrar a Vitest
- `@angular-devkit/build-angular` → `@angular/build` (nuevo paquete)

### 3.3 Acciones
- [ ] Actualizar Node.js a 20.x en CI/CD y development
- [ ] Reinstalar `@angular-devkit/build-angular` como bridge temporal para tests
- [ ] Verificar `browserslist` (Opera removido)

### 3.4 Verificación
- [ ] Build + test + smoke test

---

## Fase 4: Angular 20 → 21 → 22 (2 semanas)

### 4.1 Upgrade secuencial
```bash
ng update @angular/core@21 @angular/cli@21
# ... fix issues ...
ng update @angular/core@22 @angular/cli@22
```

### 4.2 Cambios Angular 21
- Zoneless change detection (default)
- `afterRender()` → `afterEveryRender()` (verificar en @fuse y app code)

### 4.3 Cambios Angular 22
- Signal forms estables
- Selectorless components
- `@angular/build` reemplaza completamente a `@angular-devkit/build-angular`

### 4.4 Dependencias finales
```bash
npm install @zxing/ngx-scanner@22
npm install ng-apexcharts@2.4 apexcharts@^5.10
```

### 4.5 Verificación final
- [ ] Build completo sin warnings críticos
- [ ] Todos los tests pasando
- [ ] Smoke test de todas las funcionalidades:
  - Login / Logout / DFA
  - Neuron (forms dinámicos)
  - GPS / Mapas
  - Tareas
  - Contabilidad
  - Personas
  - Carga masiva
  - Notificaciones

---

## Fase 5: Limpieza y Modernización (post-migración, continuo)

Esta fase es **después** de que todo funcione en Angular 22. No combinar con la migración de versión.

### 5.1 Limpieza inmediata
- [ ] Eliminar `HttpClientModule` redundante de los 10 layout modules
- [ ] Eliminar `PreloadAllModules` si no se usa (o justificar por qué)
- [ ] Fix naming inconsistente (`persons.ts` → `persons.component.ts`, etc.)

### 5.2 Migración a standalone (gradual, 1 componente a la vez)
- [ ] Empezar por componentes pequeños y aislados
- [ ] Usar `ng generate @angular/core:standalone` para automatizar
- [ ] No tocar Neuron ni Fuse hasta el final

### 5.3 Adoption de Signals (gradual)
- [ ] Empezar por servicios con BehaviorSubjects
- [ ] Migrar inputs/outputs a signal inputs/outputs
- [ ] Neuron es el último en migrar (muy complejo)

### 5.4 Migración de interceptores
- [ ] `HTTP_INTERCEPTORS` class-based → `withInterceptors()` functional
- [ ] Aplicar a `TokenInterceptor`, `HttpErrorInterceptor`, `FuseLoadingInterceptor`

### 5.5 Testing framework
- [ ] Migrar de Karma a Vitest o Jest (Angular 22 lo requiere eventualmente)

---

## Riesgos Principales

| Riesgo | Impacto | Mitigación |
|---|---|---|
| @fuse no compila en Angular 22 | **Alto** | Mantener copia funcional de @fuse; si no compila, migrar a otro template o refactorizar @fuse incrementalmente |
| Neuron module se rompe | **Alto** | El motor de forms dinámicos usa `ComponentFactoryResolver` deprecated; migrar a `ViewContainerRef.createComponent(Type)` antes del salto a 22 |
| `ngx-editor` sin soporte | **Medio** | Evaluar migración a Tiptap antes de la migración |
| `@magloft/material-carousel` roto | **Alto** | Reemplazar en Fase 0 antes de empezar |
| Tests de Karma no funcionan | **Medio** | Bridge temporal con `@angular-devkit/build-angular`; migrar a Vitest en Fase 5 |

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
- **Rendering dinámico** via `ComponentFactoryResolver` + `ViewContainerRef` (deprecated)
- **50+ property keys** que controlan comportamiento de campos
- **State machine** para transiciones de documentos
- **Multi-server federation** para templates

### Interceptores
- `TokenInterceptor`: Agrega Authorization header, convierte fechas
- `HttpErrorInterceptor`: Maneja errores, usa `throwError(string)` (deprecated, debe ser `throwError(() => string)`)
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
