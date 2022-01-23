import { JWTContext, LoadingSpinner, useUser } from "./components";
import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense, useState } from "react";

import React from "react";
import { SnackbarProvider } from "notistack";

const MapApp = React.lazy(() => import("./map/App"));
const ManageApp = React.lazy(() => import("./manage/App"));

export function App() {
	const [JWT, setJWT] = useState<null | string>(null);
	const user = useUser();
	const redirectElement = user.isLoggedIn ? (
		<Navigate to="/manage" replace />
	) : (
		<Navigate to="/map" replace />
	);
	return (
		<JWTContext.Provider value={[JWT, setJWT]}>
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
						<Route index element={redirectElement} />
						<Route path="*" element={redirectElement} />
						<Route
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
							path="manage"
							element={
								<Suspense
									fallback={
										<LoadingSpinner message="Loading dashboard..." />
									}>
									<ManageApp />
								</Suspense>
							}
						/>
					</Route>
				</Routes>
			</SnackbarProvider>
		</JWTContext.Provider>
	);
}
