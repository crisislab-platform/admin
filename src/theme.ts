import { createTheme } from "@mui/material";

let theme = createTheme({
	palette: {
		primary: {
			main: "#1162A1",
		},
		secondary: {
			main: "#5ECAEB",
		},
		info: {
			main: "#30B7FF",
		},
		success: {
			main: "#157F1F",
		},
		warning: {
			main: "#FF7700",
		},
		error: {
			main: "#D00000",
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
