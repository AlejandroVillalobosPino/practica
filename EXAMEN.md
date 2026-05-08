# EXAMEN.md — Defensa de la Práctica Final BildyApp

## 1. Cambios realizados y por qué

### Qué se detectó
El modelo `Client.js` no declaraba explícitamente el campo `deleted`, aunque el controlador
`client.controller.js` lo usaba en `findOneAndUpdate(..., { deleted: true })`. Esto funciona
en Mongoose por defecto porque el modo `strict` permite escribir campos no declarados en el
esquema, pero no los valida ni les asigna valores por defecto.

El modelo `Project.js` tenía el mismo problema.

Además, `getClients` en `client.controller.js` no filtraba los clientes archivados en el
listado general, mientras que `getProjects` en `project.controller.js` sí lo hacía con
`deleted: { $ne: true }`. Esto era una inconsistencia que hacía que `GET /api/client`
devolviera también los clientes archivados, lo cual es un bug.

### Qué se cambió
- Se añadió `deleted: { type: Boolean, default: false }` explícitamente en `src/models/Client.js`
- Se añadió `deleted: { type: Boolean, default: false }` explícitamente en `src/models/Project.js`
- Se modificó el query base de `getClients` en `src/controllers/client.controller.js` de
  `{ company: req.user.company }` a `{ company: req.user.company, deleted: { $ne: true } }`
- Se añadió un test de ciclo completo en `tests/client.test.js` que cubre:
  crear → archivar → verificar que no aparece en listado normal → verificar que aparece
  en /archived → restaurar → verificar que reaparece en listado normal

---

## 2. Respuestas a las preguntas socráticas

### Pregunta 1
> En `Client.js` no declaras el campo `deleted`, pero en `client.controller.js` haces
> `findOneAndUpdate(..., { deleted: true })`. ¿Por qué parece "funcionar" y qué riesgo
> tiene en producción con `strict: 'throw'`?

Mongoose tiene el modo `strict` activado por defecto, lo que significa que los campos no
declarados en el esquema se ignoran silenciosamente al guardar — no se escriben en MongoDB.
Sin embargo, con `findOneAndUpdate` el comportamiento es diferente: Mongoose por defecto
**no aplica strict** en las operaciones de update, por lo que el campo `deleted` se escribe
en la base de datos aunque no esté en el esquema.

El riesgo concreto es que si alguien configura `strict: 'throw'` en el esquema o a nivel
global, Mongoose lanzará un error al intentar escribir `deleted: true` porque el campo no
está declarado. En producción esto causaría un crash inesperado en el endpoint de borrado.
Además, sin declarar el campo no se puede establecer un valor por defecto (`false`), lo que
significa que los documentos existentes no tendrían el campo y una consulta
`{ deleted: false }` no los devolvería, aunque sí lo haría `{ deleted: { $ne: true } }`.

### Pregunta 2
> En `project.controller.js` usas `deleted: { $ne: true }` y en `client.controller.js`
> no filtrabas nada. ¿Cuál es el comportamiento correcto y por qué?

El comportamiento correcto es filtrar `deleted: { $ne: true }` en el listado general.
El contrato REST de `GET /api/client` implica devolver los clientes "activos" de la
compañía — es decir, los que no han sido archivados. Si un usuario archiva un cliente
es porque no quiere verlo en el listado principal, solo en `/archived`.

Devolver clientes archivados en el listado general rompe la expectativa del usuario y
del frontend, que tendría que filtrar manualmente. Es siempre un bug porque el soft delete
existe precisamente para ocultar registros del flujo principal sin eliminarlos físicamente.

### Pregunta 3
> En `client.controller.js` decides el tipo de borrado con `req.query.soft === 'true'`.
> Si usaras DELETE para borrado físico y PATCH `/archive` para el lógico, ¿qué ganarías
> y qué perderías? Razónalo en términos de idempotencia y semántica HTTP.

**Lo que se ganaría:** mejor semántica HTTP. DELETE sería idempotente y predecible —
siempre borra físicamente. PATCH `/archive` expresaría claramente que es una modificación
de estado, no un borrado. El cliente HTTP sabría exactamente qué esperar de cada verbo.

**Lo que se perdería:** simplicidad. Con el diseño actual un solo endpoint gestiona ambos
casos con un parámetro query, lo que reduce el número de rutas. Además, usar un parámetro
query para distinguir comportamientos es un patrón habitual en APIs REST reales (GitHub,
Stripe lo hacen).

El problema del diseño actual es que DELETE con `?soft=true` no es idempotente en la
práctica: la primera llamada archiva, pero si se llama de nuevo no hace nada diferente
porque el cliente ya está archivado. Con el diseño alternativo, DELETE sería siempre
idempotente (borrar lo ya borrado no cambia nada) y PATCH `/archive` sería más explícito.

### Pregunta 4
> Un cliente queda archivado (`deleted: true`) y existen proyectos suyos no archivados.
> `GET /api/project` devuelve esos proyectos con `populate('client', 'name cif')`.
> ¿Qué devuelve el populate? ¿Es un bug, una feature o depende del producto?

El populate de Mongoose devuelve el documento del cliente aunque tenga `deleted: true`,
porque populate hace un `findById` simple sin filtros adicionales. Por tanto, el proyecto
aparecerá con los datos del cliente archivado — nombre y CIF — como si estuviera activo.

Si es un bug o una feature depende del producto. En un contexto contable o legal, los
proyectos y albaranes históricos deben conservar la referencia al cliente aunque esté
archivado, para mantener la trazabilidad. En ese caso es una feature: el archivo no
destruye datos históricos.

Si el producto quiere que los proyectos de un cliente archivado también queden ocultos,
habría que o bien archivar en cascada los proyectos al archivar el cliente, o bien añadir
un filtro en el populate. En nuestra implementación actual es un comportamiento aceptable
porque favorece la trazabilidad histórica.

### Pregunta 5
> Compara soft delete (`deleted: true`) en Client con la máquina de estados en
> `DeliveryNote` (`status: PENDING_SIGNATURE | SIGNED | REJECTED`). ¿Por qué un albarán
> no tiene soft delete y un cliente sí? ¿Cuándo conviene un booleano y cuándo una
> máquina de estados?

Un cliente puede estar en dos estados excluyentes desde el punto de vista del negocio:
activo o archivado. No hay transiciones intermedias ni reglas de negocio que dependan
del estado — simplemente existe o no en el flujo principal. Un booleano es suficiente.

Un albarán en cambio tiene un ciclo de vida con reglas de negocio estrictas:
- `PENDING_SIGNATURE` → puede modificarse o borrarse
- `SIGNED` → no puede modificarse ni borrarse, puede descargarse en PDF
- `REJECTED` → estado terminal alternativo

Estas transiciones tienen efectos secundarios (subir firma a Cloudinary, generar PDF)
y restricciones (no borrar si está firmado). Un booleano no capturaría esta complejidad
— necesitarías varios booleanos (`signed`, `rejected`, `deleted`) que podrían entrar en
estados inconsistentes entre sí.

La regla general es: usa un booleano cuando el estado es binario y sin efectos laterales.
Usa una máquina de estados cuando hay más de dos estados, transiciones con lógica de
negocio, o restricciones sobre qué operaciones están permitidas según el estado actual.

---

## 3. Prompts de IA utilizados y tiempo dedicado

Se utilizó Claude (Anthropic) como asistente durante el desarrollo de la práctica.
Los prompts principales fueron orientados a:
- Depuración de errores en tests (timeouts, imports incorrectos, campos faltantes en modelos)
- Corrección de sintaxis YAML en comentarios Swagger
- Configuración de GitHub Actions con mongodb-memory-server
- Implementación de Nodemailer y Slack webhooks

El asistente fue usado como herramienta de apoyo para resolver errores concretos,
no para generar el diseño arquitectónico de la aplicación.

Tiempo dedicado aproximado: 6-8 horas en total.