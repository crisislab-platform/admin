import { CssBaseline, ThemeProvider, Typography } from "@mui/material";
import { JWTContext, LoadingSpinner, useUser } from "./components";
import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense, useState } from "react";

import { MissingPermission } from "./components";
import React from "react";
import { Route as RouteType } from "./types";
import { SnackbarProvider } from "notistack";
import { routes as manageRoutes } from "./manage/routes";
import { theme } from "./theme";

const MapApp = React.lazy(() => import("./map/MapApp"));
const ManageApp = React.lazy(() => import("./manage/ManageApp"));

export function App() {
	const [JWT, setJWT] = useState<null | string>(null);
	const user = useUser();
	const redirectElement = user.isLoggedIn ? (
		<Navigate to="/manage" replace />
	) : (
		<Navigate to="/map" replace />
	);
	function routeElement(route: RouteType) {
		return user.permissions.includes(route.requiredPermission) ? (
			route.Element
		) : (
			<MissingPermission permission={route.requiredPermission} />
		);
	}

	return (
		<JWTContext.Provider value={[JWT, setJWT]}>
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
							<Route
								key="index"
								index
								element={redirectElement}
							/>
							<Route
								key="*"
								path="*"
								element={
									<Typography>Page not found :(</Typography>
								}
							/>
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
		</JWTContext.Provider>
	);
}
