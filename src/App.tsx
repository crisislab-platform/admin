import { CssBaseline, Link, ThemeProvider, Typography } from "@mui/material";
import { LoadingSpinner, useUser } from "./components";
import { Navigate, Route, Link as RouterLink, Routes } from "react-router-dom";
import React, { Suspense } from "react";

import { MissingPermission } from "./components";
import { Route as RouteType } from "./types";
import { SnackbarProvider } from "notistack";
import { routes as manageRoutes } from "./manage/routes";
import { theme } from "./theme";

const MapApp = React.lazy(() => import("./map/MapApp"));
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
					containerRoot: "SnackbarBottomSpacing",
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
							<Route
								key="reset-password-start"
								path="reset-password-start"
								element={
									<>Enter email to reset your password</>
								}
							/>
							<Route
								key="reset-password-new-password"
								path="reset-password-new-password"
								element={<>Enter a new password</>}
							/>
							<Route
								key="login"
								path="login"
								element={
									<>
										Login here
										<Link
											component={RouterLink}
											to="../register">
											Register →
										</Link>
									</>
								}
							/>
							<Route
								key="register"
								path="register"
								element={
									<>
										<p>
											To get an account, ask a site admin
											to create one for you.
										</p>
										<Link
											component={RouterLink}
											to="../login">
											← Back to login
										</Link>
									</>
								}
							/>
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
