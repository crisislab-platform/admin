import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "./styles.css";

import { CssBaseline, ThemeProvider } from "@mui/material";

import App from "./App";
import React from "react";
import ReactDOM from "react-dom";
import { SnackbarProvider } from "notistack";
import { theme } from "internship-react-components";

ReactDOM.render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<CssBaseline enableColorScheme />
			<SnackbarProvider
				anchorOrigin={{ horizontal: "left", vertical: "bottom" }}>
				<App />
			</SnackbarProvider>
		</ThemeProvider>
	</React.StrictMode>,
	document.getElementById("root"),
);
