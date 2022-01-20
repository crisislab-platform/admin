import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "./styles.css";
import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import App from "./App";
import React from "react";
import ReactDOM from "react-dom";
import { SnackbarProvider } from "notistack";
import { ThemeProvider, theme } from "internship-react-components";

ReactDOM.render(
	<React.StrictMode>
		<MuiThemeProvider theme={theme}>
			<ThemeProvider>
				<SnackbarProvider
					anchorOrigin={{ horizontal: "left", vertical: "bottom" }}>
					<App />
				</SnackbarProvider>
			</ThemeProvider>
		</MuiThemeProvider>
	</React.StrictMode>,
	document.getElementById("root"),
);
