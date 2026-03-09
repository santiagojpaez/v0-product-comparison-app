# Product Comparison App (Frontend)

Aplicación frontend desarrollada con [Next.js](https://nextjs.org) para comparar productos. Permite navegar categorías, explorar productos y realizar comparaciones entre ellos.

## Requisitos previos

- **Node.js** (v18 o superior)
- **pnpm** (gestor de paquetes)
- **Backend corriendo en `http://localhost:8080`**: esta aplicación consume la API REST del backend. Sin el backend activo, la app no podrá cargar categorías, productos ni comparaciones.

## Cómo ejecutar el sistema

### 1. Levantar el backend

Antes de iniciar el frontend, asegurate de tener el backend corriendo en `http://localhost:8080`. Podés consultar el README del proyecto backend (`challenge-backend/`) para ver las instrucciones de ejecución.

### 2. Instalar dependencias del frontend

```bash
pnpm install
```

### 3. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Comando        | Descripción                        |
| -------------- | ---------------------------------- |
| `pnpm dev`     | Inicia el servidor de desarrollo   |
| `pnpm build`   | Genera el build de producción      |
| `pnpm start`   | Inicia el servidor de producción   |
| `pnpm lint`    | Ejecuta el linter (ESLint)         |
