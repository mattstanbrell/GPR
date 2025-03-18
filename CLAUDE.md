# Commands and Guidelines for Audily Codebase

## Commands
- Build: `npm run build` (Next.js build)
- Dev: `npm run dev` (Next.js with Turbopack)
- Start: `npm run start` (Next.js production server)
- Lint: `npm run lint` (Next.js lint)

## Code Style
- TypeScript with strict type checking
- Biome for formatting (120 char width, tabs, double quotes)
- React functional components with hooks
- PascalCase for component files/names, camelCase for variables/functions
- Prefix "handle" for event handlers (handleClick, handleSubmit)
- Async/await for API calls with consistent try/catch error handling
- AWS Amplify for auth and data storage
- Context API for global state, props for component-specific data
- Path alias: import from @/* maps to ./src/*

## Architecture
- `/src/app`: Next.js app router structure
- `/src/app/components`: Reusable UI components
- `/src/app/constants`: Global constants
- `/src/app/types`: TypeScript interfaces
- `/src/utils`: Helper functions and utilities