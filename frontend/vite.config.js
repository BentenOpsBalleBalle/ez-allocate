import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
dotenv.config();
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        "process.env": process.env, // Pass environment variables to the app
    },
    server: {
        watch: {
            usePolling: true,
        },
    },
});
