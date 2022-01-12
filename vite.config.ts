import { defineConfig } from "vite";
import { dependencies } from "./package.json";
import react from "@vitejs/plugin-react";

// Code-split the library bundle (in addition to code-splitting the main app)
const coreDeps = ["react", "react-dom", "react-router-dom"];
function renderChunks(deps: Record<string, string>) {
	let chunks = {};
	Object.keys(deps).forEach((key) => {
		if (coreDeps.includes(key)) return;
		chunks[key] = [key];
	});
	return chunks;
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: coreDeps,
					...renderChunks(dependencies),
				},
			},
		},
	},
});
