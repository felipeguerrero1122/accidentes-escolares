# Valor Comercial de la App: Registro de Accidentes Escolares

## 1. Contexto general

**Nombre del producto:** Registro de Accidentes Escolares  
**Tipo de producto:** aplicación web administrativa  
**Propósito principal:** reemplazar una planilla Excel usada para registrar accidentes escolares, alumnos, reportes y estadísticas  
**Mercado objetivo:** colegios, escuelas y establecimientos educacionales en Chile  
**Estado actual:** MVP funcional, operativo y usable

Esta app fue construida para digitalizar el registro de accidentes escolares dentro de un establecimiento educacional. El sistema centraliza alumnos, accidentes, historial, indicadores y reportes en una sola plataforma web, reemplazando un flujo que antes se hacía en Excel con macros.

## 2. Resumen ejecutivo del producto

La aplicación permite:

- registrar accidentes escolares desde un formulario web
- buscar alumnos por RUT y autocompletar sus datos
- mantener una base de alumnos
- consultar historial de accidentes
- editar y eliminar registros con permisos de administrador
- generar PDFs de accidentes individuales
- visualizar dashboard con indicadores y tablas
- importar datos desde una planilla Excel existente
- administrar usuarios con roles diferenciados
- administrar catálogos como lugares y tipos de lesión

El sistema ya resuelve un problema real de operación diaria: sacar a un establecimiento del uso de Excel/manualidad para pasar a una base centralizada con permisos, trazabilidad y mejor consulta de información.

## 3. Módulos funcionales actuales

### Autenticación y roles

- login con credenciales
- sesión persistente
- roles `ADMIN` y `OPERATOR`
- `ADMIN` puede crear, editar y eliminar
- `OPERATOR` quedó restringido a solo lectura

### Gestión de alumnos

- listado de alumnos
- ficha individual del alumno
- edición de alumno por administrador
- visualización de datos clave:
  - ID alumno
  - RUT
  - curso
  - fecha de nacimiento
  - edad
  - apoderado
  - teléfono
  - salud / alergias
  - observaciones
- importación inicial de alumnos desde Excel/CSV

### Registro de accidentes

- formulario de nuevo accidente
- autocompletado del alumno al ingresar RUT
- captura de fecha, hora, lugar, lesión, primeros auxilios, derivación, aviso al apoderado, responsable y observaciones
- guardado de accidentes en historial
- edición de accidentes por administrador
- eliminación definitiva de accidentes por administrador

### Historial y detalle

- listado histórico de accidentes
- acceso a ficha detallada por accidente
- apertura de PDF individual del accidente
- orden y consulta por fecha y otros filtros

### Dashboard e indicadores

- total de accidentes
- con derivación
- sin aviso al apoderado
- sin descripción
- último registro
- curso con más accidentes
- lesión más frecuente
- día hábil con más accidentes
- tabla de accidentes por curso
- tabla de accidentes por tipo de lesión
- tabla de accidentes por día
- exportación del dashboard a PDF

### Catálogos y administración

- administración de lugares
- administración de tipos de lesión
- edición y borrado por administrador
- creación de usuarios
- edición y eliminación de usuarios por administrador

## 4. Resumen técnico

### Stack principal

- `Next.js`
- `React`
- `TypeScript`
- `Prisma`
- `PostgreSQL`
- `Zod`
- `@react-pdf/renderer`

### Arquitectura general

- frontend y backend en una misma app Next.js
- rutas protegidas por sesión
- APIs internas para alumnos, accidentes, usuarios, dashboard y catálogos
- base de datos relacional con Prisma
- PDFs generados desde servidor

### Despliegue actual

- funcionamiento local en servidor web
- acceso público temporal mediante túnel tipo `trycloudflare`
- pensado hoy para operación controlada, no para despliegue SaaS masivo

## 5. Estado de madurez del producto

### Lo que ya está resuelto

- producto funcional
- flujo principal implementado
- base de datos operativa
- permisos por rol
- historial y edición
- PDFs
- panel de indicadores
- importación desde la planilla original

### Perfil de uso actual

- uso administrativo interno
- optimizado principalmente para escritorio
- orientado a un establecimiento en v1

### Lo que todavía no tiene

- modo multi-colegio
- despliegue cloud productizado
- auditoría avanzada de cambios
- firma digital
- facturación / suscripciones
- notificaciones automáticas
- marca visual premium o branding comercial avanzado

## 6. Factores que le dan valor comercial

### Problema que resuelve

Reemplaza un proceso manual o semimanual basado en Excel para una operación escolar sensible y frecuente: el registro de accidentes.

### Beneficios concretos

- ahorro de tiempo administrativo
- menos errores de digitación
- consulta rápida por RUT y por historial
- centralización de información crítica
- mejor control de permisos
- mejores reportes e indicadores
- digitalización de un proceso que suele seguir siendo informal

### Valor para un comprador

Para un colegio o sostenedor, esta app puede representar:

- reducción de dependencia de planillas
- mejor trazabilidad frente a revisiones internas
- mayor orden documental
- posibilidad de estandarizar el proceso entre funcionarios
- base inicial para evolucionar a una solución institucional más grande

## 7. Limitaciones que deben considerarse al valorarla

- el branding todavía es básico
- la experiencia visual es funcional, no premium
- el despliegue aún es local / semimanual
- no está empaquetada todavía como SaaS comercial formal
- está pensada para un solo establecimiento en su versión actual
- no incluye facturación, onboarding automatizado ni multicliente
- no incluye todavía integraciones externas

## 8. Cómo debería valorarse comercialmente

La valoración debería considerar que esto **no es solo un prototipo visual**, sino una aplicación funcional con backend, permisos, base de datos, importación, reportes y lógica de negocio real.

Al mismo tiempo, no debe valorarse como producto SaaS maduro enterprise, porque todavía le faltan capas de producto comercial y escalamiento.

La valoración más razonable debiera ubicarse como:

- software administrativo vertical funcional
- MVP avanzado / producto operativo inicial
- con uso realista para venta a colegios en Chile

## 9. Instrucciones para la IA valuadora

Analiza esta app como si fueras un consultor de producto y pricing de software en Chile.

Quiero que estimes el **valor comercial de venta** de esta aplicación web considerando que:

- ya está desarrollada y funcional
- resuelve un problema real en establecimientos educacionales
- fue creada para reemplazar una planilla Excel con macros
- incluye backend, frontend, base de datos, autenticación, permisos, PDFs, dashboard e importación
- está en etapa de MVP funcional avanzado
- aún no es multi-colegio ni SaaS maduro

Tu respuesta debe incluir:

1. un rango estimado de **venta única del software** en pesos chilenos (`CLP`)
2. un rango estimado de **cobro por implementación / puesta en marcha**
3. un rango estimado de **precio mensual** si se ofreciera como servicio
4. una explicación clara de cómo llegaste a esos valores
5. qué variables harían subir o bajar ese precio
6. una recomendación de precio realista para venderla hoy en Chile

Por favor, considera:

- complejidad técnica real
- funcionalidades implementadas
- utilidad para colegios
- estado de madurez actual del producto
- contexto del mercado chileno

No respondas solo con teoría. Quiero números concretos en `CLP` y una recomendación comercial práctica.
