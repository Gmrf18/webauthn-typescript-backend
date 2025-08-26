# WebAuthn Backend

This project is a Node.js backend designed to implement and test passwordless authentication using the **WebAuthn** standard. It uses Express.js for the server and TypeScript for type safety.

## 🚀 Quick Start

Follow these steps to get the development server up and running locally.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18 or higher)

### 1. Clone the repository

```bash
git clone <REPOSITORY_URL>
cd webauthn-back
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The server will start at `http://localhost:3001`.

## 📁 Project Structure

```
webauthn-back/
├── src/
│   ├── index.ts          # Main entry point
│   ├── database.ts       # In-memory database
│   └── webauthn.ts       # WebAuthn logic
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

## 📡 Endpoints

The available API endpoints are described below:

### Authentication

- `POST /generate-registration-options` - Generates the options for registering a new device.
  - **Body:** `{ "username": "<username>" }`
- `POST /verify-registration` - Verifies the device's response and saves the new credential.
  - **Body:** `{ "username": "<username>", "response": { ... } }`
- `POST /generate-login-options` - Generates the options for user authentication.
  - **Body:** `{ "username": "<username>" }`
- `POST /verify-login` - Verifies the device's response and authenticates the user.
  - **Body:** `{ "username": "<username>", "response": { ... } }`

### General

- `GET /` - Returns `{"message":"Hola mundo"}`

## 🗃️ In-memory Database

This project uses an in-memory database to store users and credentials. This means that the data will be lost every time the server is restarted. This setup is ideal for development and testing, but it is not suitable for a production environment.

## 🛠️ Technologies

- Node.js
- TypeScript
- Express.js
- @simplewebauthn/server
- ts-node-dev (development)

## 📝 Available Scripts

- `npm run dev` - Starts the server in development mode with auto-reloading.
- `npm run build` - Compiles TypeScript to JavaScript.
- `npm run start` - Starts the server in production mode.
- `npm run clean` - Cleans the compiled files.
