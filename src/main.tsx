import "./styles.css";
import "@fontsource/manrope";

import { BrowserRouter as Router } from "react-router";
import { StrictMode } from "react";
import { WrappedApp } from "./App";
import { createRoot } from "react-dom/client";

function Entrypoint() {
	return (
		<Router>
			<WrappedApp />
		</Router>
	);
}

const root = createRoot(document.getElementById("root")!);

root.render(
	<StrictMode>
		<Entrypoint />
	</StrictMode>,
);
