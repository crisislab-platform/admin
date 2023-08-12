import { defineConfig } from "vite";
import pluginRewriteAll from "vite-plugin-rewrite-all";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react(), pluginRewriteAll()],
	server: {
		port: 3000,
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					react: ["react", "react-dom"],
					mui: ["@mui/material", "@mui/lab"],
					mui_icons: ["@mui/icons-material"],
					date_pickers: ["@mui/x-date-pickers", "dayjs"],
				},
			},
		},
	},
});
