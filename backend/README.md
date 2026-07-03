# PlayMate Backend

The backend is built with **Node.js**, **Express**, **TypeScript**, and **Prisma ORM** connecting to a **PostgreSQL** database.

## 🚀 Getting Started

Ensure you have a `.env` file created by copying `.env.example` and filling in your credentials:
```bash
cp .env.example .env
```

### Development Scripts

Run the development server with hot-reloading:
```bash
npm run dev
```

Build the TypeScript files to `dist/`:
```bash
npm run build
```

Run database migrations:
```bash
npm run prisma:migrate
```

Generate Prisma client:
```bash
npm run prisma:generate
```
