import { defineConfig } from "vite";
import pluginRewriteAll from "vite-plugin-rewrite-all";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react(), pluginRewriteAll()],
	server: {
		port: 3000,
	},
});
