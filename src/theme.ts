import { createTheme } from "@mui/material";

let theme = createTheme({
	palette: {
		primary: {
			main: "#536dfe",
		},
		secondary: {
			main: "#FF99C9",
		},
		info: {
			main: "#039be5",
		},
		success: {
			main: "#04E762",
		},
		warning: {
			main: "#F9C846",
		},
		error: {
			main: "#F44336",
		},
	},
});

theme = createTheme(theme, {
	components: {
		MuiFab: {
			styleOverrides: {
				root: {
					zIndex: theme.zIndex.snackbar + 1,
				},
			},
		},
	},
});

export { theme };
