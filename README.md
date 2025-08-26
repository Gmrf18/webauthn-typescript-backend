# WebAuthn Backend con Supabase

Este proyecto es un backend de Node.js diseñado para implementar y probar la autenticación sin contraseña utilizando el estándar **WebAuthn**. Utiliza Express.js para el servidor, TypeScript para un tipado seguro, y se integra con **Supabase** para la persistencia de datos de usuarios y autenticadores.

## 🚀 Inicio Rápido

Sigue estos pasos para poner en marcha el servidor de desarrollo localmente.

### Prerrequisitos

-   [Node.js](https://nodejs.org/) (versión 18 o superior)
-   Una cuenta de [Supabase](https://supabase.com/) con un proyecto creado.

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd webauthn-back
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo `.env.example` y renómbralo a `.env`.

```bash
cp .env.example .env
```

Ahora, abre el archivo `.env` y añade tus credenciales del proyecto de Supabase y la configuración de WebAuthn.

```env
# URL de tu proyecto de Supabase
SUPABASE_URL=https://<id-proyecto>.supabase.co

# Clave anónima (pública) de tu proyecto de Supabase
SUPABASE_ANON_KEY=<tu-anon-key>

# --- Configuración de WebAuthn ---

# Nombre de tu aplicación (Relying Party Name)
RP_NAME="Mi App con WebAuthn"

# ID de tu Relying Party (generalmente el dominio donde se aloja el frontend)
# En desarrollo, puede ser 'localhost'
RP_ID=localhost

# Origen desde donde se permitirán las peticiones (URL del frontend)
# En desarrollo, suele ser http://localhost:3000 o similar
ORIGIN=http://localhost:3000
```

### 3. Instalar dependencias

```bash
npm install
# o
yarn install
```

### Desarrollo
```bash
npm run dev
# o
yarn dev
```

### Construcción
```bash
npm run build
# o
yarn build
```

### Producción
```bash
npm start
# o
yarn start
```

## 📁 Estructura del proyecto

```
webauthn-back/
├── src/
│   └── index.ts          # Punto de entrada principal
├── dist/                 # Archivos compilados (generado)
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

## 📡 Endpoints

- `GET /` - Devuelve "Hola mundo"

## 🛠️ Tecnologías

- Node.js
- TypeScript
- Express.js
- ts-node-dev (desarrollo)

## 📝 Scripts disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con recarga automática
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia el servidor en modo producción
- `npm run clean` - Limpia los archivos compilados
