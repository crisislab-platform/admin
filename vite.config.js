import { defineConfig } from "vite";
import { dependencies } from "./package.json";
import react from "@vitejs/plugin-react";

// Code-split the library bundle (in addition to code-splitting the main app)
function renderChunks(deps) {
	let chunks = {};
	Object.keys(deps).forEach((key) => {
		if (["react", "react-router-dom", "react-dom"].includes(key)) return;
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
					vendor: ["react", "react-router-dom", "react-dom"],
					...renderChunks(dependencies),
				},
			},
		},
	},
});
