import { defineConfig } from "vite";
import { dependencies } from "./package.json";
import react from "@vitejs/plugin-react";

// Packages we want in the vendor aka the deps needed in the entire app.
const globalVendorPackages = [
	"react",
	"react-dom",
	"react-router-dom",
	"@auth0/auth0-react",
];

function renderChunks(deps: Record<string, string>) {
	let chunks = {};
	Object.keys(deps).forEach((key) => {
		if (globalVendorPackages.includes(key)) return;
		chunks[key] = [key];
	});
	return chunks;
}

export default defineConfig({
	plugins: [react()],
	build: {
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: globalVendorPackages,
					...renderChunks(dependencies),
				},
			},
		},
	},
});
