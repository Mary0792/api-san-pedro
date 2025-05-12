
-- Base de datos para matrícula escolar con 'anio' en lugar de 'año'

CREATE TABLE estudiantes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(10) NOT NULL,
    grado_actual INT NOT NULL,
    direccion VARCHAR(MAX) NOT NULL,
    estado VARCHAR(10) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'egresado')),
    fecha_ingreso DATE NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE apoderados (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    parentesco VARCHAR(50) NOT NULL,
    ocupacion VARCHAR(100) NOT NULL,
    grado_instruccion VARCHAR(50) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    direccion VARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE relaciones_apoderado_estudiante (
    id INT IDENTITY(1,1) PRIMARY KEY,
    apoderado_id INT NOT NULL,
    estudiante_id INT NOT NULL,
    es_principal BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (apoderado_id) REFERENCES apoderados(id),
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    CONSTRAINT UQ_apoderado_estudiante UNIQUE (apoderado_id, estudiante_id)
);

CREATE TABLE solicitud_matricula_nueva (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre_estudiante VARCHAR(100) NOT NULL,
    dni_estudiante VARCHAR(20) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(10) NOT NULL,
    grado_solicitado INT NOT NULL,
    direccion VARCHAR(MAX) NOT NULL,
    nombre_apoderado VARCHAR(100) NOT NULL,
    dni_apoderado VARCHAR(20) NOT NULL,
    parentesco VARCHAR(50) NOT NULL,
    ocupacion VARCHAR(100) NOT NULL,
    grado_instruccion VARCHAR(50) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    direccion_apoderado VARCHAR(MAX) NOT NULL,
    anio_escolar VARCHAR(4) NOT NULL,
    fecha_solicitud DATE NOT NULL,
    estado VARCHAR(10) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
    comentarios VARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE solicitud_traslado (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre_estudiante VARCHAR(100) NOT NULL,
    dni_estudiante VARCHAR(20) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(10) NOT NULL,
    grado_solicitado INT NOT NULL,
    direccion VARCHAR(MAX) NOT NULL,
    nombre_apoderado VARCHAR(100) NOT NULL,
    dni_apoderado VARCHAR(20) NOT NULL,
    parentesco VARCHAR(50) NOT NULL,
    ocupacion VARCHAR(100) NOT NULL,
    grado_instruccion VARCHAR(50) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    direccion_apoderado VARCHAR(MAX) NOT NULL,
    colegio_anterior VARCHAR(100) NOT NULL,
    motivo_traslado VARCHAR(MAX),
    anio_escolar VARCHAR(4) NOT NULL,
    fecha_solicitud DATE NOT NULL,
    estado VARCHAR(10) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
    comentarios VARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE solicitud_siguiente_grado (
    id INT IDENTITY(1,1) PRIMARY KEY,
    estudiante_id INT NOT NULL,
    grado_actual INT NOT NULL,
    grado_siguiente INT NOT NULL,
    anio_escolar_actual VARCHAR(4) NOT NULL,
    anio_escolar_siguiente VARCHAR(4) NOT NULL,
    fecha_solicitud DATE NOT NULL,
    estado VARCHAR(10) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
    comentarios VARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id)
);

CREATE TABLE documentos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo_solicitud VARCHAR(10) NOT NULL CHECK (tipo_solicitud IN ('nueva', 'traslado', 'siguiente')),
    solicitud_id INT NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE historial_academico (
    id INT IDENTITY(1,1) PRIMARY KEY,
    estudiante_id INT NOT NULL,
    anio_escolar VARCHAR(4) NOT NULL,
    grado INT NOT NULL,
    seccion VARCHAR(10),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    CONSTRAINT UQ_estudiante_anio UNIQUE (estudiante_id, anio_escolar)
);

CREATE TABLE anios_escolares (
    id INT IDENTITY(1,1) PRIMARY KEY,
    anio VARCHAR(4) NOT NULL UNIQUE,
    descripcion VARCHAR(100),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('activo', 'finalizado', 'planificado')),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE observaciones_solicitud (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo_solicitud VARCHAR(10) NOT NULL CHECK (tipo_solicitud IN ('nueva', 'traslado', 'siguiente')),
    solicitud_id INT NOT NULL,
    fecha DATETIME DEFAULT GETDATE(),
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('comentario', 'rechazo', 'aprobación', 'petición_documentos')),
    descripcion VARCHAR(MAX) NOT NULL,
    es_visible_para_padres BIT DEFAULT 1
);
