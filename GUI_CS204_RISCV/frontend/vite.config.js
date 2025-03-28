import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
    plugins: [
        react()  ,  tailwindcss(),
    ],    
    server: {
        port: 5173,
        proxy: {
            "/run": {
                target: "http://localhost:5001",
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
