# GeoMundo — Código fuente del proyecto académico

## 1. Descripción

GeoMundo es una aplicación educativa web desarrollada como parte del proyecto académico **“Realidad Mixta Inclusiva para Enseñar Sólidos Geométricos en Niños con TDAH de tercero de primaria”**.

Este repositorio contiene el código fuente y los recursos utilizados para construir la aplicación. **No se ha realizado una conversión del proyecto a otro lenguaje ni se ha modificado la lógica funcional original para esta entrega.** La preparación realizada corresponde únicamente a organización, documentación y exclusión de archivos temporales o propios del entorno de desarrollo que no son necesarios para reconstruir el proyecto.

## 2. Tecnologías principales

- **TypeScript** — lenguaje principal del proyecto.
- **React** — construcción de la interfaz de usuario.
- **Vite** — desarrollo y compilación del frontend.
- **Three.js / React Three Fiber** — visualización y manejo de elementos 3D.
- **React Three XR** — soporte relacionado con experiencias XR.
- **PNPM Workspace** — organización del proyecto como monorepo y administración de dependencias.
- **Express 5** — servidor API incluido en el proyecto.
- **Zod** — validación de datos.
- **Drizzle ORM / PostgreSQL** — infraestructura preparada para persistencia mediante base de datos.
- **OpenAPI / Orval** — especificación y generación de componentes relacionados con la API.

## 3. Estructura del proyecto

```text
GeoMundo/
├── artifacts/
│   ├── src/                  # Código principal de la aplicación GeoMundo
│   ├── public/               # Recursos públicos de la aplicación
│   ├── api-server/           # Servidor API de Express
│   ├── package.json          # Dependencias y scripts del frontend
│   └── vite.config.ts        # Configuración de Vite
│
├── lib/
│   ├── api-client-react/     # Cliente React generado a partir de OpenAPI
│   ├── api-spec/             # Especificación OpenAPI
│   ├── api-zod/              # Esquemas de validación generados
│   └── db/                   # Configuración de PostgreSQL/Drizzle
│
├── attached_assets/          # Imágenes, modelos 3D y texturas utilizados
├── scripts/                  # Scripts auxiliares del workspace
│
├── package.json              # Configuración principal del workspace
├── pnpm-workspace.yaml       # Definición del PNPM Workspace
├── pnpm-lock.yaml            # Versiones bloqueadas de dependencias
├── tsconfig.json             # Configuración TypeScript
└── .gitignore                # Archivos que no deben versionarse
```

## 4. Componentes principales de GeoMundo

El código principal se encuentra en `artifacts/src/` e incluye, entre otros elementos:

- Pantalla de inicio y navegación.
- Exploración de figuras geométricas.
- Visualización de figuras en 3D.
- Actividades de práctica y evaluación.
- Juegos educativos.
- Seguimiento del progreso.
- Configuración y preferencias de audio.
- Personaje educativo Pablito.
- Escenarios y experiencias relacionadas con la exploración 3D/XR.
- Componentes de interfaz reutilizables.

Los datos de las figuras se encuentran en `artifacts/src/data/figuras.ts` y la lógica relacionada con progreso y audio está en `artifacts/src/lib/`.

## 5. Recursos gráficos y 3D

La carpeta `attached_assets/` conserva los recursos utilizados durante el desarrollo, incluyendo:

- imágenes de las figuras geométricas;
- imágenes de objetos reales;
- escenarios de GeoMundo;
- recursos gráficos del personaje Pablito;
- modelos 3D en formato `.fbx`;
- texturas utilizadas por los modelos y escenas.

Estos recursos forman parte de la entrega porque son necesarios para comprender y reconstruir la aplicación tal como fue desarrollada.

## 6. Requisitos para ejecutar el proyecto

Se recomienda utilizar:

- **Node.js 20 o superior**. El entorno original utilizó Node.js 24.
- **pnpm** como gestor de paquetes.

No es necesario instalar manualmente cada biblioteca. Las dependencias se encuentran declaradas en los archivos `package.json` y sus versiones quedan registradas en `pnpm-lock.yaml`.

## 7. Instalación

Desde la carpeta raíz del proyecto:

```bash
pnpm install
```

El proyecto utiliza **PNPM Workspace**, por lo que las dependencias y paquetes internos se administran desde la raíz.

## 8. Ejecución de la aplicación

Para iniciar el frontend de GeoMundo en modo desarrollo:

```bash
pnpm --filter @workspace/geomundo run dev
```

Vite mostrará en la terminal la dirección local desde la cual puede abrirse la aplicación.

El proyecto también incluye un servidor API en `artifacts/api-server/`. Algunas funciones de evaluación utilizan la ruta `/api/rating`; dichas funciones pueden requerir las variables de entorno correspondientes cuando se ejecuta el servidor fuera del entorno original.

## 9. Variables de entorno

El archivo `.env.example` sirve como referencia para las variables que pueden requerirse en el entorno de ejecución.

Entre ellas se encuentran:

```text
PORT=21135
BASE_PATH=/
RESEND_API_KEY=TU_RESEND_API_KEY_AQUI
DATABASE_URL=TU_DATABASE_URL_AQUI
```

**No se deben incluir claves, contraseñas, tokens ni valores reales de servicios externos en el repositorio.**

`RESEND_API_KEY` se relaciona con el servicio de envío de la calificación por correo. `DATABASE_URL` corresponde a la infraestructura de PostgreSQL/Drizzle incluida en el proyecto y no debe contener credenciales reales en esta entrega.

## 10. Comprobaciones del proyecto

Para revisar los tipos de TypeScript:

```bash
pnpm run typecheck
```

Para construir la aplicación:

```bash
pnpm --filter @workspace/geomundo run build
```

Para construir el servidor API:

```bash
pnpm --filter @workspace/api-server run build
```

## 11. Sobre PNPM Workspace

PNPM Workspace **no es un lenguaje de programación**. Es el mecanismo utilizado para organizar este proyecto como un conjunto de paquetes relacionados dentro de un mismo repositorio.

Por esta razón, el código fuente de GeoMundo se conserva en su tecnología original y no se convierte a Java, Python u otro lenguaje.

## 12. Archivos no incluidos en esta entrega

No forman parte de la entrega académica los archivos temporales, cachés, dependencias instaladas, compilaciones o credenciales privadas. Entre ellos se encuentran, por ejemplo:

- `node_modules/`
- `dist/`
- `.cache/`
- `.local/`
- `.git/`
- archivos `.env` con valores reales
- archivos temporales del entorno de desarrollo de Replit

Estos elementos no son necesarios para entregar el código fuente y pueden regenerarse o configurarse en el equipo donde se ejecute el proyecto.

## 13. Nota de entrega académica

La presente carpeta corresponde a una **versión preparada para revisión académica del código fuente completo de GeoMundo**. La aplicación y su lógica funcional se conservan; la preparación se limita a ordenar la documentación y excluir elementos temporales o específicos del entorno de desarrollo que no son necesarios para la reconstrucción del proyecto.
