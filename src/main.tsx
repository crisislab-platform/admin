import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./styles.css";

import { StrictMode, useState } from "react";

import { App } from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter as Router } from "react-router-dom";
import { render } from "react-dom";

function Entrypoint() {
	return (
		<StrictMode>
			<Auth0Provider
				domain={import.meta.env.VITE_AUTH0_DOMAIN}
				clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
				redirectUri={window.location.origin}
				scope={import.meta.env.VITE_AUTH0_SCOPE}
				audience={import.meta.env.VITE_AUTH0_AUDIENCE}>
				<Router>
					<App />
				</Router>
			</Auth0Provider>
		</StrictMode>
	);
}

render(<Entrypoint />, document.getElementById("root"));
