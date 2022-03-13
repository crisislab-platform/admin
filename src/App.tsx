import { CssBaseline, ThemeProvider, Typography } from "@mui/material";
import { MissingRole, NavigateWithQuery } from "./components";
import { Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import React, { Suspense } from "react";
import useAuth, { AuthProvider } from "./auth/useAuth";

import { LoadingSpinner } from "./components";
import MapApp from "./map/MapApp";
import { ReactQueryDevtools } from "react-query/devtools";
import { Route as RouteType } from "./types";
import { SnackbarProvider } from "notistack";
import { authRoutes } from "./auth/authRoutes";
import { routes as manageRoutes } from "./manage/routes";
import { theme } from "./theme";

const ManageApp = React.lazy(() => import("./manage/ManageApp"));
const AuthWrapper = React.lazy(() => import("./auth/AuthWrapper"));

const queryClient = new QueryClient();

export function WrappedApp() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline enableColorScheme />
			<SnackbarProvider
				classes={{
					containerRoot: "Snackbar-Bottom-Spacing",
					variantSuccess: "Snackbar-Success",
					variantError: "Snackbar-Error",
					variantWarning: "Snackbar-Warning",
					variantInfo: "Snackbar-Info",
				}}
				anchorOrigin={{
					horizontal: "right",
					vertical: "bottom",
				}}>
				<QueryClientProvider client={queryClient}>
					<AuthProvider>
						<App />
					</AuthProvider>
					<ReactQueryDevtools />
				</QueryClientProvider>
			</SnackbarProvider>
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
		<NavigateWithQuery to="/map" replace />
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
				<Route
					key="auth"
					path="auth"
					element={
						<Suspense
							fallback={
								<LoadingSpinner
									message="Loading login page(s)"
									addPadding
								/>
							}>
							<AuthWrapper />
						</Suspense>
					}>
					<Route index element={<NavigateWithQuery to="./login" />} />
					{authRoutes.map((route) => (
						<Route
							key={route.path}
							path={route.path}
							element={
								<Suspense
									fallback={
										<LoadingSpinner
											message={`Loading ${route.path}`}
											addPadding
										/>
									}>
									{route.component}
								</Suspense>
							}
						/>
					))}
				</Route>
				<Route
					key="map"
					path="map"
					element={
						<Suspense
							fallback={
								<LoadingSpinner
									message="Loading map"
									addPadding
								/>
							}>
							<MapApp />
						</Suspense>
					}
				/>
				<Route
					key="manage"
					path="manage"
					element={
						<Suspense
							fallback={
								<LoadingSpinner
									message="Loading dashboard"
									addPadding
								/>
							}>
							<ManageApp />
						</Suspense>
					}>
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
