# Pedra App Development Guide

## Build Commands
- `npm run dev` - Start development server (uses Webpack)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

## Code Style Guidelines
- **Types**: Use TypeScript interfaces for all data structures; mark optional fields with `?`
- **Components**: React functional components with `React.FC` typing
- **Imports**: Group by external libraries, then internal modules/components
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Context**: Use React Context API for shared state (see MapContext)
- **Error Handling**: Try/catch blocks with specific error messages and fallback UI
- **Refs**: Use useRef for DOM elements and external libraries (like mapboxgl)
- **CSS**: Use Tailwind utilities for styling with className prop
- **TypeScript**: Strict mode enabled, explicit return types on functions
- **File Structure**: Components in components/, context in context/, services in services/

This project uses Next.js, React 19, Mapbox GL, Supabase, and Tailwind CSS.