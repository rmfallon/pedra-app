#!/bin/bash

echo "🚀 Starting Pedra Setup..."

# Ensure we are in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: This script must be run from the root of the Pedra project."
  exit 1
fi

# Delete unnecessary files
echo "🗑️  Removing unnecessary files and folders..."
rm -rf src layout.tsx globals.css .next public/favicon.ico eslint.config.mjs

# Create required directories
echo "📂 Creating necessary directories..."
mkdir -p lib context pages/api components

# Create required files
echo "📄 Creating required files..."

# Supabase Client
cat <<EOL > lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
EOL

# Auth Context
cat <<EOL > context/AuthContext.tsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
EOL

# Next.js App Wrapper
cat <<EOL > pages/_app.tsx
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';

export default function App({ Component, pageProps }: any) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
EOL

# Home Page
cat <<EOL > pages/index.tsx
export default function Home() {
  return <h1>Welcome to Pedra</h1>;
}
EOL

# API Endpoints
cat <<EOL > pages/api/auth.ts
export default function handler(req, res) {
  res.status(200).json({ message: 'Auth API works!' });
}
EOL

cat <<EOL > pages/api/pois.ts
export default function handler(req, res) {
  res.status(200).json({ pois: [] });
}
EOL

# Components
cat <<EOL > components/Map.tsx
export default function Map() {
  return <div>Map Component Placeholder</div>;
}
EOL

cat <<EOL > components/SearchBar.tsx
export default function SearchBar() {
  return <input type="text" placeholder="Search..." />;
}
EOL

cat <<EOL > components/Sidebar.tsx
export default function Sidebar() {
  return <div>Sidebar Placeholder</div>;
}
EOL

cat <<EOL > components/POIButton.tsx
export default function POIButton() {
  return <button>Add POI</button>;
}
EOL

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run the project
echo "🚀 Running Pedra..."
npm run dev