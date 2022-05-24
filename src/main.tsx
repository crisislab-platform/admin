import "./styles.css";

import { BrowserRouter as Router } from "react-router-dom";
import { StrictMode } from "react";
import { WrappedApp } from "./App";
import { render } from "react-dom";

function Entrypoint() {
	return (
		<StrictMode>
			<Router>
				<WrappedApp />
			</Router>
		</StrictMode>
	);
}

render(<Entrypoint />, document.getElementById("root"));
