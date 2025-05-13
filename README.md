# API de Matrículas de San Pedro

## 1. Introducción

Este informe explica como esta creado y organizado la API de Matrículas de San Pedro, un sistema que hemos creado para gestionar el proceso de matrícula de estudiantes. La API maneja varios tipos de matrículas, información de estudiantes y apoderados, gestión de documentos y configuraciones de años escolares.

## 2. Arquitectura del Sistema

### 2.1 Stack Tecnológico

La API está construida utilizando las siguientes tecnologías:
- **Framework Backend**: Node.js con Express.js
- **Base de Datos**: Microsoft SQL Server (Azure SQL Database)
- **Autenticación**: No hay porque falto tiempo, asi que cualquiera acceda a la API
- **Almacenamiento de Archivos**: Almacenamiento local para documentos
- **Middleware**: CORS, Morgan (para registro de logs)

### 2.2 Estructura del Proyecto

La API sigue una arquitectura modular con clara separación de responsabilidades:

```
api/
├── public/                  # Archivos estáticos (HTML, CSS, JS)
├── src/
│   ├── controllers/         # Manejadores de solicitudes
│   ├── database/            # Conexión a la base de datos y esquema
│   ├── middleware/          # Middleware personalizado (ej. carga de archivos)
│   ├── models/              # Capa de acceso a datos
│   ├── routes/              # Definiciones de rutas de la API
│   ├── test_conect/         # Pruebas de conexión a la base de datos
│   ├── app.js               # Configuración de la aplicación Express
│   └── index.js             # Punto de entrada
└── package.json             # Dependencias y scripts del proyecto
```

## 3. Diseño de la Base de Datos

### 3.1 Esquema de la Base de Datos

La base de datos utiliza Microsoft SQL Server con las siguientes tablas principales:

1. **estudiantes**: Almacena información de los estudiantes
2. **apoderados**: Almacena información de los apoderados/padres
3. **relaciones_apoderado_estudiante**: Mapea la relación entre estudiantes y apoderados
4. **anios_escolares**: Gestiona los años escolares y su estado
5. **solicitud_matricula_nueva**: Almacena solicitudes de matrícula nueva
6. **solicitud_traslado**: Almacena solicitudes de matrícula por traslado
7. **solicitud_siguiente_grado**: Almacena solicitudes de matrícula para el siguiente grado
8. **documentos**: Gestiona documentos asociados a las solicitudes de matrícula
9. **observaciones_solicitud**: Almacena comentarios y observaciones sobre las solicitudes
10. **historial_academico**: Registra el historial académico de los estudiantes

### 3.2 Relaciones entre Entidades

- Un estudiante puede tener múltiples apoderados (relación muchos a muchos a través de relaciones_apoderado_estudiante)
- Un estudiante puede tener múltiples solicitudes de matrícula
- Cada solicitud de matrícula puede tener múltiples documentos y observaciones
- Cada estudiante tiene un registro de historial académico para cada año escolar

## 4. Endpoints de la API

La API está organizada en varios módulos lógicos, cada uno con su propio conjunto de endpoints:

### 4.1 Gestión de Estudiantes

- `GET /api/estudiantes`: Obtener todos los estudiantes
- `GET /api/estudiantes/:id`: Obtener un estudiante específico por ID
- `GET /api/estudiantes/verificar-promocion`: Verificar si un estudiante puede ser promovido
- `GET /api/estudiantes/resumen`: Obtener resumen del estudiante con información de promoción
- `POST /api/estudiantes`: Crear un nuevo estudiante
- `PUT /api/estudiantes/:id`: Actualizar un estudiante
- `DELETE /api/estudiantes/:id`: Eliminar un estudiante

### 4.2 Gestión de Apoderados

- `GET /api/apoderados`: Obtener todos los apoderados
- `GET /api/apoderados/:id`: Obtener un apoderado específico por ID
- `GET /api/buscar/:dni`: Obtener un apoderado por DNI
- `POST /api/apoderados`: Crear un nuevo apoderado
- `PUT /api/apoderados/:id`: Actualizar un apoderado
- `DELETE /api/apoderados/:id`: Eliminar un apoderado

### 4.3 Gestión de Relaciones Estudiante-Apoderado

- `GET /api/relaciones`: Obtener todas las relaciones estudiante-apoderado
- `GET /api/relaciones/:id`: Obtener una relación específica por ID
- `GET /api/estudiantes/:estudianteId/apoderados`: Obtener todos los apoderados de un estudiante
- `GET /api/apoderados/:apoderadoId/estudiantes`: Obtener todos los estudiantes de un apoderado
- `POST /api/relaciones`: Crear una nueva relación
- `DELETE /api/relaciones/:id`: Eliminar una relación

### 4.4 Gestión de Años Escolares

- `GET /api/anios-escolares`: Obtener todos los años escolares
- `GET /api/anios-escolares/activo`: Obtener el año escolar activo
- `GET /api/anios-escolares/anio/:anio`: Obtener un año escolar por valor de año
- `GET /api/anios-escolares/:id`: Obtener un año escolar específico por ID
- `POST /api/anios-escolares`: Crear un nuevo año escolar
- `PUT /api/anios-escolares/:id`: Actualizar un año escolar
- `DELETE /api/anios-escolares/:id`: Eliminar un año escolar

### 4.5 Gestión de Solicitudes de Matrícula

La API maneja tres tipos de solicitudes de matrícula:

#### 4.5.1 Matrícula Nueva
- `GET /api/solicitudes/nueva`: Obtener todas las solicitudes de matrícula nueva
- `GET /api/solicitudes/nueva/dni`: Obtener solicitudes de matrícula nueva por DNI del estudiante
- `GET /api/solicitudes/nueva/año/:anio`: Obtener solicitudes de matrícula nueva por año escolar
- `GET /api/solicitudes/nueva/:id`: Obtener una solicitud de matrícula nueva específica
- `POST /api/solicitudes/nueva`: Crear una solicitud de matrícula nueva
- `PUT /api/solicitudes/nueva/:id`: Actualizar una solicitud de matrícula nueva
- `DELETE /api/solicitudes/nueva/:id`: Eliminar una solicitud de matrícula nueva

#### 4.5.2 Matrícula por Traslado
- `GET /api/solicitudes/traslado`: Obtener todas las solicitudes de traslado
- `GET /api/solicitudes/traslado/dni`: Obtener solicitudes de traslado por DNI del estudiante
- `GET /api/solicitudes/traslado/año/:anio`: Obtener solicitudes de traslado por año escolar
- `GET /api/solicitudes/traslado/:id`: Obtener una solicitud de traslado específica
- `POST /api/solicitudes/traslado`: Crear una solicitud de traslado
- `PUT /api/solicitudes/traslado/:id`: Actualizar una solicitud de traslado
- `DELETE /api/solicitudes/traslado/:id`: Eliminar una solicitud de traslado

#### 4.5.3 Matrícula para Siguiente Grado
- `GET /api/solicitudes/siguiente`: Obtener todas las solicitudes para siguiente grado
- `GET /api/solicitudes/siguiente/estudiante/:id`: Obtener solicitudes para siguiente grado por ID de estudiante
- `GET /api/solicitudes/siguiente/año-actual/:anio`: Obtener solicitudes por año escolar actual
- `GET /api/solicitudes/siguiente/año-siguiente/:anio`: Obtener solicitudes por año escolar siguiente
- `POST /api/solicitudes/siguiente`: Crear una solicitud para siguiente grado
- `PUT /api/solicitudes/siguiente/:id`: Actualizar una solicitud para siguiente grado
- `DELETE /api/solicitudes/siguiente/:id`: Eliminar una solicitud para siguiente grado

### 4.6 Gestión de Documentos

- `GET /api/documentos`: Obtener todos los documentos
- `GET /api/documentos/:id`: Obtener un documento específico
- `GET /api/solicitudes/:tipoSolicitud/:solicitudId/documentos`: Obtener documentos para una solicitud
- `POST /api/documentos`: Subir un nuevo documento
- `DELETE /api/documentos/:id`: Eliminar un documento

### 4.7 Gestión de Observaciones

- `GET /api/observaciones`: Obtener todas las observaciones
- `GET /api/observaciones/:id`: Obtener una observación específica
- `GET /api/solicitudes/:tipoSolicitud/:solicitudId/observaciones`: Obtener observaciones para una solicitud
- `GET /api/solicitudes/:tipoSolicitud/:solicitudId/observaciones/padres`: Obtener observaciones visibles para padres
- `POST /api/observaciones`: Crear una nueva observación
- `PUT /api/observaciones/:id`: Actualizar una observación
- `DELETE /api/observaciones/:id`: Eliminar una observación

### 4.8 Gestión de Matrículas

- `GET /api/matriculas`: Obtener todas las matrículas
- `GET /api/matriculas/:id`: Obtener una matrícula específica
- `GET /api/estudiantes/:estudianteId/matriculas`: Obtener matrículas de un estudiante
- `GET /api/matriculas/año/:año`: Obtener matrículas por año escolar
- `POST /api/matriculas/nueva`: Crear una matrícula nueva
- `POST /api/matriculas/traslado`: Crear una matrícula por traslado
- `POST /api/matriculas/siguiente`: Crear una matrícula para siguiente grado
- `PUT /api/matriculas/:id`: Actualizar una matrícula
- `DELETE /api/matriculas/:id`: Eliminar una matrícula

## 5. Flujo del Proceso de Matrícula

El sistema de matrículas soporta tres procesos distintos de matrícula:

### 5.1 Matrícula de Estudiante Nuevo

1. Se envía una solicitud de matrícula nueva a través de `POST /api/solicitudes/nueva`
2. Se suben los documentos requeridos a través de `POST /api/documentos`
3. Los administradores de la escuela revisan la solicitud y añaden observaciones
4. La solicitud es aprobada o rechazada
5. Si es aprobada, se crea un nuevo registro de estudiante y se finaliza la matrícula

### 5.2 Matrícula por Traslado

1. Se envía una solicitud de matrícula por traslado a través de `POST /api/solicitudes/traslado`
2. Se suben los documentos requeridos (incluyendo registros de la escuela anterior)
3. Los administradores de la escuela revisan la solicitud y añaden observaciones
4. La solicitud es aprobada o rechazada
5. Si es aprobada, se crea un nuevo registro de estudiante y se finaliza la matrícula

### 5.3 Matrícula para Siguiente Grado (Estudiantes Existentes)

1. Se envía una solicitud de matrícula para siguiente grado a través de `POST /api/solicitudes/siguiente`
2. El sistema verifica si el estudiante puede ser promovido
3. Los administradores de la escuela revisan la solicitud
4. La solicitud es aprobada o rechazada
5. Si es aprobada, se actualiza el grado del estudiante para el nuevo año escolar

## 6. Modelos de Datos

### 6.1 Modelo de Estudiante

El modelo de estudiante incluye:
- Información personal (nombre, DNI, fecha de nacimiento, género)
- Grado actual
- Dirección
- Estado (activo, inactivo, egresado)
- Fecha de ingreso
- Marcas de tiempo de creación y actualización

### 6.2 Modelo de Apoderado

El modelo de apoderado incluye:
- Información personal (nombre, DNI)
- Relación con el estudiante
- Ocupación
- Nivel de educación
- Información de contacto (teléfono, email)
- Dirección
- Marcas de tiempo de creación y actualización

### 6.3 Modelos de Solicitud de Matrícula

Cada tipo de solicitud de matrícula tiene su propio modelo con campos específicos:

#### 6.3.1 Solicitud de Matrícula Nueva
- Información del estudiante
- Información del apoderado
- Grado solicitado
- Año escolar
- Fecha de solicitud
- Estado (pendiente, aprobada, rechazada)
- Comentarios

#### 6.3.2 Solicitud de Matrícula por Traslado
- Información del estudiante
- Información del apoderado
- Grado solicitado
- Escuela anterior
- Motivo del traslado
- Año escolar
- Fecha de solicitud
- Estado
- Comentarios

#### 6.3.3 Solicitud de Matrícula para Siguiente Grado
- ID del estudiante
- Grado actual
- Siguiente grado
- Año escolar actual
- Año escolar siguiente
- Fecha de solicitud
- Estado
- Comentarios

### 6.4 Modelo de Año Escolar

El modelo de año escolar incluye:
- Año (formato YYYY)
- Descripción
- Fecha de inicio
- Fecha de fin
- Estado (activo, finalizado, planificado)
- Marcas de tiempo de creación y actualización

## 7. Consideraciones de Seguridad

La implementación actual incluye:
- Configuración CORS para control de acceso a la API
- Manejo de errores para prevenir fugas de información
- Validación de entrada para integridad de datos

Áreas para posible mejora:
- Autenticación y autorización
- Limitación de tasa de API
- Cifrado de datos para información sensible
- Almacenamiento seguro de contraseñas (si se añade autenticación de usuario)

## 8. Despliegue y Configuración

La API está configurada para ejecutarse en el puerto 3000 por defecto, que puede ser anulado usando la variable de entorno PORT. La conexión a la base de datos está configurada en el archivo `database/connection.js`, con credenciales almacenadas en variables de entorno para seguridad.

## 9. Algo mas

Este es una versión inicial del informe, y se pueden añadir más detalles según las mejoras que realicemos o funcionalidades que agreguemos, así como las mejoras en áreas clave que faltan como:

- **Seguridad y autenticación**: Implementación de JWT, roles de usuario, protección contra ataques comunes.
- **Optimización y Rendimiento**: Implementación de caché, paginación, optimización de consultas SQL.
