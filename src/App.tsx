import {
	Box,
	Button,
	CssBaseline,
	ThemeProvider,
	Typography,
	Link,
} from "@mui/material";
import { ErrorBoundary, MissingRole, NavigateWithQuery } from "./components";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router";
import useAuth, { AuthProvider } from "./auth/useAuth";

import AuthWrapper from "./auth/AuthWrapper";
import ManageApp from "./manage/ManageApp";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Route as RouteType } from "./types";
import { SnackbarProvider } from "notistack";
import { authRoutes } from "./auth/authRoutes";
import { routes as manageRoutes } from "./manage/routes";
import { useRef } from "react";
import { makeTheme, publicPermissions, userHasPermission } from "./utils";
import { queryClient } from "./api";

const {theme, NotistackTheme} = makeTheme();

export function WrappedApp() {
	const notistackRef = useRef<SnackbarProvider | null>(null);
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
					Components={{
						success: NotistackTheme,
						error: NotistackTheme,
						warning: NotistackTheme,
						info: NotistackTheme,
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
						{/* <ReactQueryDevtools /> */}
					</QueryClientProvider>
				</SnackbarProvider>
			</ErrorBoundary>
		</ThemeProvider>
	);
}

function RouteElement({ route }: { route: RouteType }) {
	const { user } = useAuth();
	// console.log("Rendering route with slug: ", route.slug);
	const layout = (
		<ErrorBoundary>
			{userHasPermission(user, route.requiredRole.raw) ||
				publicPermissions.includes(route.requiredRole) ? (
				<route.Element />
			) : (
				<MissingRole role={route.requiredRole} addPadding />
			)}
		</ErrorBoundary>
	);
	console.log("Rendered route with slug: ", route.slug);
	return layout;
}

function renderRoutes(routes: RouteType[]) {
	return routes.map((route) => {
		// console.info(`Rendering route with slug: ${route.slug}`);

		return (
			<Route
				key={route.slug}
				path={route.slug}
				element={
					<ErrorBoundary>
						<RouteElement route={route} />
					</ErrorBoundary>
				}
				children={
					route.subRoutes ? renderRoutes(route.subRoutes) : undefined
				}
			/>
		);
	});
}
const PageNotFound = () => (
	<Box p={2}>
		<Typography>Page not found :{"("}</Typography>{" "}
		<Link href="/">Go home</Link>
	</Box>
);
function App() {
	const { user } = useAuth();

	const redirectElement = user ? (
		<NavigateWithQuery to="/manage" />
	) : (
		<NavigateWithQuery to="/auth" />
	);

	return (
		<Routes>
			<Route path="/">
				<Route key="index" index element={redirectElement} />
				<Route key="*" path="*" element={<PageNotFound />} />
				<Route
					key="token-sign-in"
					path="token-sign-in"
					element={<NavigateWithQuery to="/auth/token-sign-in" />}
				/>
				<Route key="auth" path="auth" element={<AuthWrapper />}>
					<Route
						index
						element={<NavigateWithQuery to="/auth/login" />}
					/>
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
						element={
							<ErrorBoundary>
								<NavigateWithQuery to="/manage/sensors" />{" "}
							</ErrorBoundary>
						}
					/>
					{renderRoutes(manageRoutes)}
					<Route
						path="*"
						element={
							<ErrorBoundary>
								<PageNotFound />{" "}
							</ErrorBoundary>
						}
					/>
				</Route>
			</Route>
		</Routes>
	);
}
