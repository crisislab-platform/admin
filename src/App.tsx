import { Button, CssBaseline, ThemeProvider, Typography } from "@mui/material";
import { ErrorBoundary, MissingRole, NavigateWithQuery } from "./components";
import { QueryClient, QueryClientProvider } from "react-query";
import { Route, Routes } from "react-router-dom";
import useAuth, { AuthProvider } from "./auth/useAuth";

import AuthWrapper from "./auth/AuthWrapper";
import ManageApp from "./manage/ManageApp";
import { ReactQueryDevtools } from "react-query/devtools";
import { Route as RouteType } from "./types";
import { SnackbarProvider } from "notistack";
import { authRoutes } from "./auth/authRoutes";
import { routes as manageRoutes } from "./manage/routes";
import { theme } from "./theme";
import { useRef } from "react";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000, // One minute
		},
	},
});

export function WrappedApp() {
	const notistackRef = useRef(null);
	return (
		<ThemeProvider theme={theme}>
			<ErrorBoundary>
				<CssBaseline enableColorScheme />
				<SnackbarProvider
					ref={notistackRef}
					action={(key) => (
						<Button
							sx={{ color: "white" }}
							onClick={() => {
								notistackRef?.current?.closeSnackbar(key);
							}}>
							Dismiss
						</Button>
					)}
					classes={{
						variantSuccess: "Snackbar-Success",
						variantError: "Snackbar-Error",
						variantWarning: "Snackbar-Warning",
						variantInfo: "Snackbar-Info",
					}}
					anchorOrigin={{
						horizontal: "right",
						vertical: "bottom",
					}}
					dense>
					<QueryClientProvider client={queryClient}>
						<AuthProvider>
							<ErrorBoundary>
								<App />
							</ErrorBoundary>
						</AuthProvider>
						<ReactQueryDevtools />
					</QueryClientProvider>
				</SnackbarProvider>
			</ErrorBoundary>
		</ThemeProvider>
	);
}

function routeElement(route: RouteType) {
	const { user } = useAuth();
	return (!!user &&
		!!user.roles.find((role) => role.raw === route.requiredRole.raw)) ||
		route.requiredRole.raw === "sensors:read" ? (
		route.Element
	) : (
		<MissingRole role={route.requiredRole} addPadding />
	);
}

function renderRoutes(routes: RouteType[]) {
	return routes.map((route) => {
		console.info(`Rendering route with slug: ${route.slug}`);

		return (
			<Route
				key={route.slug}
				path={route.slug}
				element={routeElement(route)}
				children={
					route.subRoutes ? renderRoutes(route.subRoutes) : undefined
				}
			/>
		);
	});
}

function App() {
	const { user } = useAuth();

	const redirectElement = !!user ? (
		<NavigateWithQuery to="/manage" replace />
	) : (
		<NavigateWithQuery to="/auth" replace />
	);

	return (
		<Routes>
			<Route path="/">
				<Route key="index" index element={redirectElement} />
				<Route
					key="*"
					path="*"
					element={<Typography>Page not found :(</Typography>}
				/>
				<Route
					key="token-sign-in"
					path="token-sign-in"
					element={<NavigateWithQuery to="../auth/token-sign-in" />}
				/>
				<Route key="auth" path="auth" element={<AuthWrapper />}>
					<Route index element={<NavigateWithQuery to="./login" />} />
					{authRoutes.map((route) => (
						<Route
							key={route.path}
							path={route.path}
							element={route.component}
						/>
					))}
				</Route>
				<Route key="manage" path="manage" element={<ManageApp />}>
					<Route
						index
						element={<NavigateWithQuery to="./sensors" />}
					/>
					{renderRoutes(manageRoutes)}
					<Route
						path="*"
						element={<Typography>Page not found :{"("}</Typography>}
					/>
				</Route>
			</Route>
		</Routes>
	);
}
