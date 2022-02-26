import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./styles.css";

import { StrictMode, useState } from "react";

import { App } from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { render } from "react-dom";

function Entrypoint() {
	return (
		<StrictMode>
			<Router>
				<App />
			</Router>
		</StrictMode>
	);
}

render(<Entrypoint />, document.getElementById("root"));
