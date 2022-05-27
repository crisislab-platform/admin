import "./styles.css";
import "@fontsource/manrope/variable.css";

import { BrowserRouter as Router } from "react-router-dom";
import { StrictMode } from "react";
import { WrappedApp } from "./App";
import { render } from "react-dom";

function Entrypoint() {
	return (
		<Router>
			<WrappedApp />
		</Router>
	);
}

render(
	<StrictMode>
		<Entrypoint />
	</StrictMode>,
	document.getElementById("root"),
);
