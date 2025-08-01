# Gemini Code Router Guide (GEMINI.md)

This document provides a guide for Gemini to understand and work with the `claude-code-router` project.

## Project Overview

This project appears to be a code router, originally built for Claude, and now being adapted for Gemini. It seems to function as a proxy or server that can receive requests, process them through various "providers" or "transformers", and route them accordingly. It includes a backend server and a web-based user interface for configuration and monitoring.

## Project Structure

The project is a monorepo with a backend server and a frontend UI.

-   `src/`: Contains the source code for the backend server, written in TypeScript.
    -   `src/index.ts`: Main entry point for the application.
    -   `src/server.ts`: The core server logic, likely using Express or a similar framework.
    -   `src/cli.ts`: A command-line interface for the project.
    -   `src/middleware/`: Middleware for the server (e.g., authentication).
    -   `src/utils/`: Utility functions.
-   `ui/`: Contains the source code for the frontend web application.
    -   `ui/src/App.tsx`: The main React component.
    -   `ui/src/main.tsx`: The entry point for the React application.
    -   `ui/vite.config.ts`: Vite configuration for the frontend.
    -   `ui/components/`: Reusable React components.
-   `scripts/`: Build scripts.
-   `package.json`: Project dependencies and scripts for the backend.
-   `ui/package.json`: Project dependencies and scripts for the frontend.
-   `docker-compose.yml` & `dockerfile`: Docker configuration for containerizing the application.
-   `config.example.json`: Example configuration file.

## Key Technologies

-   **Backend**: Node.js, TypeScript. Possibly Express.js for the server.
-   **Frontend**: React, TypeScript, Vite, Tailwind CSS (judging by `index.css` and modern React project structure).
-   **Package Management**: npm or pnpm.
-   **Containerization**: Docker.

## Development Setup

### Backend

1.  Install dependencies from the root directory:
    ```bash
    npm install
    ```
    or
    ```bash
    pnpm install
    ```
2.  Create a `config.json` from `config.example.json` and populate it with the necessary credentials and settings.

### Frontend

1.  Navigate to the `ui` directory:
    ```bash
    cd ui
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
    or
    ```bash
    pnpm install
    ```

## Running the Application

### Backend

From the root directory, you can likely start the server with a command found in `package.json`, for example:

```bash
npm run dev
```

### Frontend

From the `ui` directory, you can likely start the development server with:

```bash
npm run dev
```

This will start the Vite development server, and you can access the UI in your browser at the address provided (e.g., `http://localhost:5173`).

## Building the Project

The `scripts/build.js` file suggests a custom build process. The `package.json` file likely contains a `build` script that executes this.

```bash
npm run build
```

This command should build both the backend and frontend into a distributable format.
