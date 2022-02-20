import { CssBaseline, Link, ThemeProvider, Typography } from "@mui/material";
import { LoadingSpinner, useUser } from "./components";
import { Navigate, Route, Link as RouterLink, Routes } from "react-router-dom";
import React, { Suspense } from "react";

import { MissingPermission } from "./components";
import { Route as RouteType } from "./types";
import { SnackbarProvider } from "notistack";
import { authRoutes } from "./auth/authRoutes";
import { routes as manageRoutes } from "./manage/routes";
import { theme } from "./theme";

import MapApp from "./map/MapApp";
const ManageApp = React.lazy(() => import("./manage/ManageApp"));
const AuthWrapper = React.lazy(() => import("./auth/AuthWrapper"));

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
				<Routes>
					<Route path="/">
						<Route key="index" index element={redirectElement} />
						<Route
							key="*"
							path="*"
							element={<Typography>Page not found :(</Typography>}
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
							<Route
								index
								element={<Navigate to="./sensors" />}
							/>
							<Route
								path="*"
								element={
									<Typography>
										Page not found :{"("}
									</Typography>
								}
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
			</SnackbarProvider>
		</ThemeProvider>
	);
}
