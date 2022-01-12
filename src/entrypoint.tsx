import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "./styles.css";

import App from "./App";
import { CssBaseline } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom";
import { SnackbarProvider } from "notistack";

ReactDOM.render(
	<React.StrictMode>
		<CssBaseline enableColorScheme />
		<SnackbarProvider
			anchorOrigin={{ horizontal: "left", vertical: "bottom" }}>
			<App />
		</SnackbarProvider>
	</React.StrictMode>,
	document.getElementById("root"),
);
