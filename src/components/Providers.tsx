import { theme } from "../theme";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { ReactChild } from "react";
import { Auth0Provider, Auth0ProviderOptions } from "@auth0/auth0-react";
export function ThemeProvider({
	children,
}: {
	children: ReactChild | ReactChild[];
}) {
	return (
		<MuiThemeProvider theme={theme}>
			<CssBaseline enableColorScheme />
			{children}
		</MuiThemeProvider>
	);
}
export function AuthProvider(props: Auth0ProviderOptions) {
	return <Auth0Provider {...props} />;
}
