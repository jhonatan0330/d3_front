# Plan de Migración: Formularios de Administración Flex → d3_front

## Contexto
- **Origen**: App Flex (Apache Flex, deprecado) con backend `FullControllerDTO.java` (~70 endpoints, 28 entidades)
- **Destino**: `d3_front` (Angular 22, zoneless, signals, Tailwind, Material mínimo)
- **API Nueva**: `/api/config/` (reemplaza `/flex/`)
- **Objetivo final**: Borrar `FullControllerDTO.java` tras migración completa

---

## Estado Actual en d3_front

### `src/app/configuration-forms/flex/` (Ya implementado - base para DocumentoPlantilla)
| Componente | Funcionalidad |
|------------|---------------|
| `FlexComponent` | Lista campos de plantilla con drag-drop, inline edit código/nombre, selector formato, papelera |
| `FieldComponent` | Detalle campo + lista propiedades + CRUD propiedades (modal `AddPropertyComponent`) |
| `AddFieldComponent` | Modal crear/editar campo (DocumentoPlantillaCaracteristica) |
| `AddPropertyComponent` | Modal completo Propiedad con: selector PropiedadValorDefinido, roles, usuarios (debounce), fechas, bloqueo, valor, texto, motivo, relaciones (RelacionInterna) |

### Servicios Existentes
| Servicio | Ubicación | Endpoints | Notas |
|----------|-----------|-----------|-------|
| `FlexService` | `configuration-forms/flex.service.ts` | `/flex/consultaXIdDocumentoPlantilla`, `/flex/listarConsultaDocumentoPlantillaCaracteristica`, `/flex/guardarDocumentoPlantillaCaracteristica`, `/flex/actualizarDocumentoPlantillaCaracteristica`, `/flex/inactivarDocumentoPlantillaCaracteristica`, `/flex/listarConsultaPropiedad`, `/flex/guardarPropiedad`, `/flex/actualizarPropiedad`, `/flex/inactivarPropiedad`, `/flex/consultaXIdPropiedadValorDefinido`, `/flex/listarPorOrigenPropiedadValorDefinido`, `/flex/listarConsultaRolAcceso`, `/flex/listarRolUsuario` | **Migrar a `/api/config/`** |
| `PropertyService` | `authentication/property.service.ts` | `/property/` | **Distinto propósito** (config usuario), no tocar |

### DTOs Disponibles (`shared.domain.ts` + `sw42.domain.ts`)
```typescript
// Base
BasicDTO { llaveTabla, estado }
BasicParamDTO extends BasicDTO { propiedades: PropiedadDTO[] }
BasicFilterDTO { paginacionRegistroInicial, paginacionRegistroFinal, filtroParametro, llaveTabla, estado, securityToken }

// Propiedades
PropiedadDTO extends BasicDTO { propiedadValor, tipo, nombre, key, campo, valor, texto, motivo, relaciones }
PropiedadCampoDTO extends propiedadCampo { texto, bloqueo, fechaFinal, fechaInicial, rol, rolNombre, rolExcluyente, rolExcluyenteNombre, usuario, usuarioNombre, usuarioExcluyente, usuarioExcluyenteNombre }
PropiedadValorDefinidoDTO extends BasicDTO { origen, origenCategoria, codigo, nombre, grupo, textOculto, necesitaDesarrollo, incluirPreloadOrigen, multiple, pideRol, pideTiempoBloqueo, propiedadBoolean, pideUsuario, solicitaMotivo, pideFechas }

// Relaciones
RelacionInternaDTO extends BasicDTO { propiedad, propiedadNombre, plantilla, plantillaNombre, campo, campoNombre, auxiliar, fechaInicio }
RelacionInternaFilterDTO extends BasicFilterDTO { propiedad, propiedadNombre, plantilla, plantillaNombre, campo, campoNombre, auxiliar }

// Entidades con propiedades (BasicParamDTO)
DocumentoPlantillaDTO, DocumentoPlantillaCaracteristicaDTO, ProcesoTransicionDTO, ReporteBaseDTO, ProcesoEstadoDTO, ProductoDTO, DetallePedidoVentaDTO, OrganizacionDTO
```

### MensajeDTO (Backend)
```java
// d3brain/src/main/java/com/softure/mail/domain/MensajeDTO.java
adjuntoURL: String  // Texto con URL(s) de archivos adjuntos
correoEnviado: Date // Null = no enviado → botón "Reenviar"
```

---

## Nueva Arquitectura Frontend

```
src/app/configuration-forms/
├── flex/                          ← EXISTENTE (renombrar a document-templates/)
│   ├── flex.service.ts            → document-template.service.ts (migrar a /api/config/)
│   ├── flex.ts                    → document-template-list.component.ts
│   ├── flex.html                  → document-template-list.component.html
│   ├── fieldComponent.ts          → document-template-field-detail.component.ts
│   ├── fieldComponent.html        → document-template-field-detail.component.html
│   ├── addField.ts                → document-template-field-form.component.ts
│   ├── addField.html              → document-template-field-form.component.html
│   ├── addProperty.ts             → property-form.component.ts (COMPARTIDO)
│   ├── addProperty.html           → property-form.component.html (COMPARTIDO)
├── shared/                        ← NUEVO: Componentes/servicios reutilizables
│   ├── property.service.ts        ← CRUD Propiedad + RelacionInterna (/api/config/propiedades, /api/config/relaciones)
│   ├── property-field.component.ts   ← Campo reutilizable para BasicParamDTO.propiedades
│   ├── property-modal.component.ts   ← Modal unificado (reemplaza AddPropertyComponent)
│   ├── property-relations.component.ts ← Lista/gestión RelacionInterna
│   └── attachment-viewer.component.ts  ← Visor adjuntoURL (MensajeDTO)
├── document-templates/            ← REEMPLAZA flex/ (ver arriba)
│   ├── document-template-list.component.ts
│   ├── document-template-form.component.ts
│   ├── document-template-fields/
│   │   ├── field-list.component.ts
│   │   └── field-form.component.ts
│   └── document-template-reports/
│       ├── report-list.component.ts
│       └── report-form.component.ts
├── web-services/
│   ├── web-service.service.ts
│   ├── web-service-list.component.ts
│   ├── web-service-form.component.ts
│   └── web-service-execution.component.ts
├── message-templates/
│   ├── message-template.service.ts
│   ├── message-template-list.component.ts
│   └── message-template-form.component.ts
├── messages/
│   ├── message.service.ts
│   ├── message-list.component.ts      ← Filtro fecha, estado envío, adjuntos
│   └── message-detail.component.ts
├── auto-tasks/
│   ├── auto-task.service.ts
│   ├── auto-task-list.component.ts    ← Filtro fecha
│   └── auto-task-actions.component.ts ← Botones Programar / Ejecutar
├── organizations/
│   ├── organization.service.ts
│   ├── organization-list.component.ts
│   └── organization-form.component.ts
├── consecutives/
│   ├── consecutive.service.ts
│   ├── consecutive-list.component.ts
│   └── consecutive-form.component.ts
├── servers/
│   ├── server.service.ts
│   ├── server-list.component.ts
│   └── server-form.component.ts
├── property-values/
│   ├── property-value.service.ts
│   ├── property-value-list.component.ts
│   └── property-value-form.component.ts
├── processes/
│   ├── process.service.ts
│   ├── process-list.component.ts
│   ├── process-form.component.ts
│   └── process-transitions/
│       ├── transition-list.component.ts
│       └── transition-form.component.ts
```

---

## Mapeo Endpoints: `/flex/` → `/api/config/`

| Entidad | Endpoints Actuales (`/flex/`) | Endpoints Nuevos (`/api/config/`) |
|---------|------------------------------|-----------------------------------|
| **WebService** | consultaXIdWebService, consultaUnicaWebService, listarConsultaWebService, activarWebService, inactivarWebService, actualizarWebService, guardarWebService, ejecutarAPIWebServiceEjecucion, listarConsultaWebServiceEjecucion | GET/POST/PUT/DELETE `/api/config/web-services`, POST `/api/config/web-services/{id}/execute`, GET `/api/config/web-services/{id}/executions` |
| **MensajePlantillaCorreo** | consultaXIdMensajePlantillaCorreo, consultaUnicaMensajePlantillaCorreo, listarConsultaMensajePlantillaCorreo, activarMensajePlantillaCorreo, inactivarMensajePlantillaCorreo, actualizarMensajePlantillaCorreo, guardarMensajePlantillaCorreo | CRUD `/api/config/message-templates` |
| **Mensaje** | listarConsultaMensaje, mensajesUsuarioMensaje, enviarMensajeMensaje | GET `/api/config/messages?fechaDesde&fechaHasta&enviado`, POST `/api/config/messages/{id}/resend`, GET `/api/config/messages/{id}/attachments` |
| **ProcesoTransicionAutomatica** | listarConsultaProcesoTransicionAutomatica, programarProcesoTransicionAutomatica, ejecutarProcesoTransicionAutomatica | GET `/api/config/auto-tasks?fechaDesde&fechaHasta`, POST `/api/config/auto-tasks/{id}/schedule`, POST `/api/config/auto-tasks/{id}/execute` |
| **Organizacion** | listarConsultaOrganizacion, consultaXIdOrganizacion, consultaUnicaOrganizacion, activarOrganizacion, inactivarOrganizacion, actualizarOrganizacion, guardarOrganizacion, obtenerPrincipalOrganizacion | CRUD `/api/config/organizations`, GET `/api/config/organizations/principal` |
| **Consecutivo** | listarConsultaConsecutivo, consultaXIdConsecutivo, consultaUnicaConsecutivo, activarConsecutivo, inactivarConsecutivo, actualizarConsecutivo, guardarConsecutivo, asignarConsecutivoConsecutivo | CRUD `/api/config/consecutives`, POST `/api/config/consecutives/{id}/assign` |
| **Servidor** | listarConsultaServidor, consultaXIdServidor, consultaUnicaServidor, activarServidor, inactivarServidor, actualizarServidor, guardarServidor | CRUD `/api/config/servers` |
| **PropiedadValorDefinido** | listarConsultaPropiedadValorDefinido, listarPorOrigenPropiedadValorDefinido, consultaXIdPropiedadValorDefinido, consultaUnicaPropiedadValorDefinido, activarPropiedadValorDefinido, inactivarPropiedadValorDefinido, actualizarPropiedadValorDefinido, guardarPropiedadValorDefinido | CRUD `/api/config/property-values`, GET `/api/config/property-values/origen/{origen}?categoria={categoria}` |
| **DocumentoPlantilla** | listarConsultaDocumentoPlantilla, consultaXIdDocumentoPlantilla, consultaUnicaDocumentoPlantilla, activarDocumentoPlantilla, inactivarDocumentoPlantilla, actualizarDocumentoPlantilla, guardarDocumentoPlantilla, consultaAdministradorDocumentoPlantilla, duplicarDocumentoPlantilla, obtenerCamposDocumentoPlantilla, consultaUsuarioDocumentoPlantilla | CRUD `/api/config/document-templates`, POST `/api/config/document-templates/{id}/duplicate` |
| **DocumentoPlantillaCaracteristica** | listarConsultaDocumentoPlantillaCaracteristica, consultaXIdDocumentoPlantillaCaracteristica, consultaUnicaDocumentoPlantillaCaracteristica, activarDocumentoPlantillaCaracteristica, inactivarDocumentoPlantillaCaracteristica, actualizarDocumentoPlantillaCaracteristica, guardarDocumentoPlantillaCaracteristica, completarDatosBasePedidoVentaCaracteristica | CRUD `/api/config/document-templates/{templateId}/fields` |
| **ReporteBase** | listarConsultaReporteBase, consultaXIdReporteBase, consultaUnicaReporteBase, activarReporteBase, inactivarReporteBase, actualizarReporteBase, guardarReporteBase | CRUD `/api/config/document-templates/{templateId}/reports` |
| **Proceso** | listarConsultaProceso, consultarArbolProceso, consultaXIdProceso, consultaUnicaProceso, activarProceso, inactivarProceso, actualizarProceso, guardarProceso, obtenerProcesoParaGraficarProceso | CRUD `/api/config/processes`, GET `/api/config/processes/tree` |
| **ProcesoTransicion** | listarConsultaProcesoTransicion, consultaXIdProcesoTransicion, consultaUnicaProcesoTransicion, activarProcesoTransicion, inactivarProcesoTransicion, actualizarProcesoTransicion, guardarProcesoTransicion | CRUD `/api/config/processes/{processId}/transitions` |
| **Propiedad** | listarConsultaPropiedad, consultaXIdPropiedad, consultaUnicaPropiedad, activarPropiedad, inactivarPropiedad, actualizarPropiedad, guardarPropiedad | CRUD `/api/config/properties` |
| **RelacionInterna** | listarConsultaRelacionInterna, consultaXIdRelacionInterna, consultaUnicaRelacionInterna, activarRelacionInterna, inactivarRelacionInterna, actualizarRelacionInterna, guardarRelacionInterna | CRUD `/api/config/properties/{propertyId}/relations` |

---

## Fases de Implementación

### FASE 0: Base Compartida y Preparación (2-3 días) ✅ **COMPLETADA**
**Objetivo**: Componentes/servicios reutilizables para propiedades y adjuntos

| Tarea | Descripción | Archivos | Estado |
|-------|-------------|----------|--------|
| 0.1 | Crear `PropertyService` en `configuration-forms/shared/` con CRUD completo Propiedad + RelacionInterna usando `/api/config/properties` y `/api/config/properties/{id}/relations` | `property.service.ts` | ✅ |
| 0.2 | Crear `PropertyFieldComponent` - componente standalone reutilizable para editar `BasicParamDTO.propiedades[]` (inline o modal) | `property-field.component.ts/.html` | ✅ |
| 0.3 | Crear `PropertyModalComponent` - modal unificado (reemplaza `AddPropertyComponent`) que usa `PropertyService` y `PropertyFieldComponent` | `property-modal.component.ts/.html` | ✅ |
| 0.4 | Crear `PropertyRelationsComponent` - gestión visual de `RelacionInternaDTO[]` (lista, agregar, editar, eliminar) | `property-relations.component.ts/.html` | ✅ |
| 0.5 | Crear `AttachmentViewerComponent` - visor para `MensajeDTO.adjuntoURL` (parsea URLs, muestra iconos/descarga) | `attachment-viewer.component.ts/.html` | ✅ |
| 0.6 | Actualizar `FlexService` → `DocumentTemplateService`: cambiar base URL a `/api/config/document-templates`, añadir métodos faltantes (reportes, duplicar, árbol) | `document-template.service.ts` | ✅ |
| 0.7 | Verificar/agregar DTOs faltantes en `sw42.domain.ts`: `WebServiceDTO`, `WebServiceEjecucionDTO`, `MensajePlantillaCorreoDTO`, `MensajeDTO`, `ProcesoTransicionAutomaticaDTO`, `OrganizacionDTO`, `ConsecutivoDTO`, `ServidorDTO`, `ProcesoDTO`, `ProcesoTransicionDTO` + sus FilterDTOs | `sw42.domain.ts` | ✅ |
| 0.8 | Configurar `LocalStoreService.getUrlAccess()` para resolver `/api/config/` correctamente | `local-store.service.ts` | ✅ (ya compatible) |

**Verificaciones FASE 0:**
- ✅ Build: `npm run build` - Exitosa
- ✅ Typecheck: `npx tsc -p tsconfig.app.json --noEmit` - Sin errores
- ✅ Lint: `npm run lint` - 0 errores (solo warnings pre-existentes)
- ✅ Tests: `npm test` - 5 suites, 66 tests pasando

### FASE 1: Módulos Independientes - CRUD Simple (3-4 días) ✅ **COMPLETADA**
**Orden**: Sin sub-entidades complejas, solo PropertyField compartido

| Orden | Módulo | Rutas API | Componentes Clave | Complejidad | Estado |
|-------|--------|-----------|-------------------|-------------|--------|
| 1.1 | **Consecutivos** | `/api/config/consecutives` | List, Form, Service | Baja | ✅ |
| 1.2 | **Valores Definidos** | `/api/config/property-values` | List (filtro origen/categoría), Form, Service | Baja | ✅ |
| 1.3 | **Organizaciones** | `/api/config/organizations` | List, Form + PropertyField, Service, Principal | Media | ✅ |
| 1.4 | **Servidores** | `/api/config/servers` | List, Form + PropertyField, Service | Media | ✅ |

**Patrón común por módulo**:
- `XxxService` inyecta `HttpClient` + `LocalStoreService`
- `XxxListComponent`: tabla con paginación, filtros, acciones (crear/editar/inactivar)
- `XxxFormComponent`: reactive form, `PropertyFieldComponent` para `propiedades[]`, submit → service
- Rutas lazy-loaded en `app.routing.ts` (pendiente Fase 4)

**Verificaciones FASE 1:**
- ✅ Build: `npm run build` - Exitosa
- ✅ Typecheck: `npx tsc -p tsconfig.app.json --noEmit` - Sin errores
- ✅ Lint: `npm run lint` - 0 errores (solo warnings pre-existentes)
- ✅ Tests: `npm test` - 7 suites, 106 tests pasando

### FASE 2: Módulos con Lógica Específica (4-5 días) ✅ **COMPLETADA**

| Orden | Módulo | Rutas API | Particularidades | Estado |
|-------|--------|-----------|------------------|--------|
| 2.1 | **WebServices** | `/api/config/web-services` | CRUD + pestaña Ejecuciones (histórico), modal Ejecutar API con parámetros JSON | ✅ |
| 2.2 | **Plantillas Mensaje** | `/api/config/message-templates` | CRUD estándar + PropertyField | ✅ |
| 2.3 | **Mensajes** | `/api/config/messages` | **Filtros**: fechaDesde, fechaHasta, enviado (sí/no)<br>**Tabla**: título, fecha, usuario, estado (enviado/pendiente/error), adjuntos (icono + contador), acciones<br>**Detalle**: muestra `adjuntoURL` parseado (AttachmentViewerComponent), botón "Reenviar" si `!correoEnviado` | ✅ |
| 2.4 | **Tareas Automáticas** | `/api/config/auto-tasks` | **Filtro**: fechaDesde, fechaHasta, activa, proceso, estados<br>**Tabla**: nombre, proceso, estados, activa, programación, próxima ejecución<br>**Acciones**: btn "Programar" (modal cron/fecha única/recurrente), btn "Ejecutar Ahora" (confirm + loading) | ✅ |

**Verificaciones FASE 2:**
- ✅ Build: `npm run build` - Exitosa
- ✅ Typecheck: `npx tsc -p tsconfig.app.json --noEmit` - Sin errores
- ✅ Lint: `npm run lint` - 0 errores (solo warnings pre-existentes)
- ✅ Tests: `npm test` - 7 suites, 106 tests pasando

### FASE 3: Módulos Jerárquicos Complejos (6-7 días) ✅ **COMPLETADA**

| Orden | Módulo | Estructura | Detalles | Estado |
|-------|--------|------------|----------|--------|
| 3.1 | **Plantillas Documento** | DocumentTemplateList → DocumentTemplateForm (tabs: General, Campos, Reportes, Propiedades) | **Reutiliza/extiende** `flex/` existente<br>- General: datos plantilla + PropertyField<br>- Campos: FieldList (drag-drop reutilizado) + FieldForm<br>- Reportes: ReportList + ReportForm (ReporteBase + PropertyField)<br>- Propiedades: PropertyFieldComponent | ✅ |
| 3.2 | **Procesos** | ProcessList → ProcessForm (tabs: General, Transiciones, Propiedades) | **General**: datos + PropertyField + selector consecutivo<br>**Transiciones**: TransitionList + TransitionForm (ProcesoTransicion + PropertyField)<br>**Árbol**: usa `getProcessTree` para vista jerárquica con transiciones anidadas | ✅ |

**Verificaciones FASE 3:**
- ✅ Build: `npm run build` - Exitosa
- ✅ Typecheck: `npx tsc -p tsconfig.app.json --noEmit` - Sin errores
- ✅ Lint: `npm run lint` - 0 errores (solo warnings pre-existentes)
- ✅ Tests: `npm test` - 7 suites, 106 tests pasando

### FASE 4: Integración, Navegación y Limpieza (2 días)

| Tarea | Descripción |
|-------|-------------|
| 4.1 | Registrar todas las rutas en `app.routing.ts` como lazy-loaded modules |
| 4.2 | Agrupar en navegación lateral: nuevo grupo **"Configuración"** con sub-items por módulo |
| 4.3 | Testing manual E2E de cada módulo (listar, crear, editar, inactivar, propiedades, relaciones) |
| 4.4 | **Borrar `FullControllerDTO.java`** del backend |
| 4.5 | Verificar que no queden imports/usos de `/flex/` en frontend (buscar `getUrlAccess('/flex/`) |
| 4.6 | Actualizar `PlanMejoras.md` marcando ítems completados |

---

## Detalles Técnicos Críticos

### 1. PropertyFieldComponent (Reutilizable)
```typescript
// Input: propiedades: PropiedadDTO[] (from BasicParamDTO.propiedades)
// Output: propiedadesChange: EventEmitter<PropiedadDTO[]>
// Funcionalidad:
// - Render lista compacta: nombre - valor - acciones
// - Click "Agregar" → abre PropertyModalComponent
// - Click editar → abre PropertyModalComponent con datos
// - Click eliminar → confirma → PropertyService.inactivarPropiedad()
// - Drag-drop para reordenar (opcional)
```

### 2. PropertyModalComponent (Unificado)
```typescript
// Basado en AddPropertyComponent existente
// Inputs: propiedad?: PropiedadCampoDTO, tipoOrigen: string, origenCategoria?: string
// Usa: PropertyService.getTypes(), PropertyService.createProperty(), PropertyService.actualizarPropiedad()
// Lógica dinámica según PropiedadValorDefinidoDTO (pideRol, pideUsuario, pideFechas, pideTiempoBloqueo, etc.)
// Incluye PropertyRelationsComponent si propiedad.key existe
```

### 3. Message List - Filtros y Adjuntos
```typescript
// Filtros: dateRange (desde/hasta), enviado: 'all' | 'sent' | 'pending' | 'error'
// Columnas:
// - Título (link a detalle)
// - Fecha
// - Usuario
// - Estado: badge (Enviado/Pendiente/Error)
// - Adjuntos: icono paperclip (si adjuntoURL) → click abre AttachmentViewerComponent
// - Acciones: "Reenviar" (solo si !correoEnviado || correoError)
// Detalle: muestra adjuntoURL parseado (múltiples URLs separadas por ; o ,)
```

### 4. Auto-Task Actions
```typescript
// Programar: modal con selector tipo (cron/fecha única/recurrente), campos según tipo
// Ejecutar: confirmación "¿Ejecutar ahora?" → POST /api/config/auto-tasks/{id}/execute → toast resultado
```

### 5. DocumentTemplate - Renombrado de flex/
```
flex/ → document-templates/
FlexComponent → DocumentTemplateListComponent
FieldComponent → DocumentTemplateFieldDetailComponent
AddFieldComponent → DocumentTemplateFieldFormComponent
AddPropertyComponent → (usa shared/PropertyModalComponent)
FlexService → DocumentTemplateService (baseUrl: /api/config/document-templates)
```

---

## Checklist de DTOs a Verificar/Agregar en `sw42.domain.ts`

```typescript
// ✓ Ya existen
DocumentoPlantillaDTO, DocumentoPlantillaCaracteristicaDTO, ReporteBaseDTO
ProcesoTransicionDTO, ProcesoEstadoDTO, PropiedadDTO, PropiedadCampoDTO
PropiedadValorDefinidoDTO, RelacionInternaDTO, RelacionInternaFilterDTO

// ⬜ Agregar (revisar backend para campos exactos)
WebServiceDTO, WebServiceFilterDTO
WebServiceEjecucionDTO, WebServiceEjecucionFilterDTO
MensajePlantillaCorreoDTO, MensajePlantillaCorreoFilterDTO
MensajeDTO, MensajeFilterDTO          // Incluir adjuntoURL, correoEnviado, correoError
ProcesoTransicionAutomaticaDTO, ProcesoTransicionAutomaticaFilterDTO
OrganizacionDTO, OrganizacionFilterDTO
ConsecutivoDTO, ConsecutivoFilterDTO
ServidorDTO, ServidorFilterDTO
ProcesoDTO, ProcesoFilterDTO
ProcesoTransicionDTO, ProcesoTransicionFilterDTO
```

---

## Navegación Lateral - Nuevo Grupo

```typescript
// En navigation.service.ts o layout navigation config
{
  label: 'Configuración',
  icon: 'settings',
  children: [
    { label: 'Plantillas Documento', route: '/config/document-templates', icon: 'description' },
    { label: 'Campos Plantilla', route: '/config/document-templates/fields', icon: 'dynamic_form' },
    { label: 'Reportes Plantilla', route: '/config/document-templates/reports', icon: 'assessment' },
    { label: 'Procesos', route: '/config/processes', icon: 'account_tree' },
    { label: 'Transiciones Proceso', route: '/config/processes/transitions', icon: 'swap_horiz' },
    { label: 'Tareas Automáticas', route: '/config/auto-tasks', icon: 'schedule' },
    { label: 'Web Services', route: '/config/web-services', icon: 'cloud' },
    { label: 'Plantillas Mensaje', route: '/config/message-templates', icon: 'mail_outline' },
    { label: 'Mensajes', route: '/config/messages', icon: 'inbox' },
    { label: 'Organizaciones', route: '/config/organizations', icon: 'business' },
    { label: 'Consecutivos', route: '/config/consecutives', icon: 'confirmation_number' },
    { label: 'Servidores', route: '/config/servers', icon: 'dns' },
    { label: 'Valores Definidos', route: '/config/property-values', icon: 'list_alt' },
    { label: 'Propiedades', route: '/config/properties', icon: 'tune' },
  ]
}
```

---

## Estimación de Esfuerzo

| Fase | Días | Entregable Principal |
|------|------|---------------------|
| 0 - Base Compartida | 2-3 | PropertyService, PropertyField, PropertyModal, AttachmentViewer, DocumentTemplateService |
| 1 - CRUD Simples | 3-4 | 4 módulos (Consecutivos, Valores, Org, Servidores) |
| 2 - Lógica Específica | 4-5 | 4 módulos (WebServices, MsgTemplates, Mensajes, AutoTasks) |
| 3 - Jerárquicos | 6-7 | 2 módulos complejos (Plantillas Doc, Procesos) |
| 4 - Integración | 2 | Rutas, menú, testing, borrar FullControllerDTO |
| **TOTAL** | **17-21 días** | **Migración completa** |

---

## Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Backend `/api/config/` no listo | Bloquea todo | Mockear respuestas en servicios con `of()` hasta que backend exponga endpoints |
| DTOs incompletos en frontend | Errores compilación | Sincronizar con backend: generar DTOs desde OpenAPI/Swagger o copiar manualmente |
| PropertyField en muchos formularios | Complejidad | Empezar FASE 0 completando PropertyField/Modal **antes** de FASE 1 |
| Drag-drop campos (flex) roto al renombrar | Regresión | Tests visuales manuales tras renombrado; Cypress opcional |
| AdjuntoURL parsing inconsistente | UX pobre | AttachmentViewerComponent robusto: split por `;`, `,`, salto línea; validar URL |

---

## Próximos Pasos Inmediatos

1. **Confirmar plan** - Revisar con equipo backend disponibilidad `/api/config/`
2. **Crear issue/board** - Desglosar cada tarea en tickets (Jira/GitHub)
3. **Iniciar FASE 0.1-0.5** - Base compartida (PropertyService, PropertyField, PropertyModal, AttachmentViewer)
4. **Renombrar flex/ → document-templates/** - Primer commit visible

---

## Notas para el Equipo Backend

Endpoints esperados en `/api/config/` (RESTful, no `/flex/`):
- **GET** `/api/config/{recurso}` - Lista con query params para filtros/paginación
- **GET** `/api/config/{recurso}/{id}` - Detalle
- **POST** `/api/config/{recurso}` - Crear
- **PUT** `/api/config/{recurso}/{id}` - Actualizar completo
- **PATCH** `/api/config/{recurso}/{id}` - Actualizar parcial (opcional)
- **DELETE** `/api/config/{recurso}/{id}` - Inactivar (soft delete, estado='I')
- **Acciones especiales**: POST `/api/config/{recurso}/{id}/{accion}` (ej: execute, schedule, duplicate, assign, resend)

Headers: `Authorization: Bearer <jwt>` (ya maneja `token.interceptor.ts`)

---

*Documento generado: 2026-08-24 | Versión 1.0 | Autor: Asistente IA*