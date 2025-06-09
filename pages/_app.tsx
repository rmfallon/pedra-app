// pages/_app.tsx
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MapProvider } from "../context/MapContext";
import { AuthProvider } from "../context/AuthContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <MapProvider>
        <Component {...pageProps} />
      </MapProvider>
    </AuthProvider>
  );
}

export default MyApp;
