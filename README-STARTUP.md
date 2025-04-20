# DateSpark Startup Guide

## Quick Start

The easiest way to start the application is to use the included PowerShell script:

```powershell
.\start.ps1
```

This will start both the backend and frontend servers in separate terminal windows.

## Manual Startup

If you prefer to start the servers manually:

### 1. Start the Backend Server

```powershell
cd datespark-backend
node server.cjs
```

The backend server will start on port 5001.

### 2. Start the Frontend Development Server

```powershell
npm run dev
```

The frontend server will start on an available port (typically 8080, 8081, etc.).

## Troubleshooting

### PowerShell Command Syntax

If you encounter issues with command syntax in PowerShell (like with `&&`), use separate commands:

```powershell
cd datespark-backend
node server.cjs
```

### Port Conflicts

If you see port conflicts, you can:

1. Close other applications that might be using those ports
2. Modify the backend port in `datespark-backend/server.cjs`
3. Let the frontend automatically find an available port

### Missing Modules

If you encounter module not found errors:

```powershell
npm install
cd datespark-backend
npm install
```

### TypeScript Errors

Some TypeScript errors in the editor (like Tailwind CSS directives) can be ignored as they don't affect the running application.

## Environment Variables

The application uses environment variables from:

- `.env` - Base environment variables
- `.env.local` - Local overrides (not committed to version control)

Make sure these files exist and contain the necessary variables. 