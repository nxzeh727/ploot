import { defineConfig } from 'vite';
import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react()],
  server: {
    host: true,
    proxy: {
      "/time":"http://127.0.0.1:5000",
      "/events":"http://127.0.0.1:5000",
      "/todo": "http://127.0.0.1:5000",
      "/modifications": {target: "http://127.0.0.1:5000", timeout: 120000},
    }
  }
})

