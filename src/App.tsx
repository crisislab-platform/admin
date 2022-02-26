import { CssBaseline, ThemeProvider, Typography } from "@mui/material";
import { LoadingSpinner, useUser } from "./components";
import { MissingPermission, NavigateWithQuery } from "./components";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import React, { Suspense } from "react";

import { AuthProvider } from "./auth/useAuth";
import MapApp from "./map/MapApp";
import { Route as RouteType } from "./types";
import { SnackbarProvider } from "notistack";
import { authRoutes } from "./auth/authRoutes";
import { routes as manageRoutes } from "./manage/routes";
import { theme } from "./theme";

const ManageApp = React.lazy(() => import("./manage/ManageApp"));
const AuthWrapper = React.lazy(() => import("./auth/AuthWrapper"));

function EverythingWrapper() {
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
				<AuthProvider>
					<Outlet />
				</AuthProvider>
			</SnackbarProvider>
		</ThemeProvider>
	);
}

export function App() {
	const user = useUser();
	const redirectElement = user.isLoggedIn ? (
		<Navigate to="/manage" replace />
	) : (
		<Navigate to="/map" replace />
	);
	function routeElement(route: RouteType) {
		// console.log(user.permissions);
		return user.permissions.includes(route.requiredPermission) ? (
			route.Element
		) : (
			<MissingPermission permission={route.requiredPermission} />
		);
	}

	return (
		<Routes>
			<Route path="/" element={<EverythingWrapper />}>
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
								<LoadingSpinner message="Loading login page(s)..." />
							}>
							<AuthWrapper />
						</Suspense>
					}>
					<Route index element={<Navigate to="./login" />} />
					{authRoutes.map((route) => (
						<Route
							key={route.path}
							path={route.path}
							element={
								<Suspense
									fallback={
										<LoadingSpinner
											message={`Loading ${route.path}`}
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
								<LoadingSpinner message="Loading map..." />
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
								<LoadingSpinner message="Loading dashboard..." />
							}>
							<ManageApp />
						</Suspense>
					}>
					<Route index element={<Navigate to="./sensors" />} />
					<Route
						path="*"
						element={<Typography>Page not found :{"("}</Typography>}
					/>
					{manageRoutes.map((route) => (
						<Route
							key={route.slug}
							path={route.slug}
							element={routeElement(route)}
						/>
					))}
				</Route>
			</Route>
		</Routes>
	);
}
