import "./styles.css";

import {
	AppBar,
	Box,
	IconButton,
	Stack,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { MissingPermission, useUser } from "../components";
import { Outlet, Route as RouterRoute, Routes } from "react-router-dom";
import { Route, SidebarLink } from "../types";
import { SensorInfo, Sensors } from "./pages/index";
import { useEffect, useState } from "react";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ManageUsersIcon from "@mui/icons-material/ManageAccounts";
import MenuIcon from "@mui/icons-material/Menu";
import SensorsIcon from "@mui/icons-material/Sensors";
import Sidebar from "./Sidebar";
import { SnackbarProvider } from "notistack";
import { useLocation } from "react-router-dom";

let routes: (Route | SidebarLink)[] = [
	{
		index: true,
		text: "Overview",
		Icon: DashboardIcon,
		Element: <div>Overview</div>,
		requiredPermission: "logged_in",
	},
	{
		slug: "sensors",
		text: "Sensors",
		Icon: SensorsIcon,
		Element: <Sensors />,
		requiredPermission: "sensors:read",
	},
	{
		slug: "sensors/:sensorID",
		indexSlug: "sensors/",
		text: "Sensor info",
		Element: <SensorInfo />,
		requiredPermission: "sensors:read",
	},
];

const drawerWidth = 260;

export default function AppRoutes() {
	const user = useUser();

	function routeElement(route: Route) {
		return user.permissions.includes(route.requiredPermission) ? (
			route.Element
		) : (
			<MissingPermission permission={route.requiredPermission} />
		);
	}

	return (
		<Routes>
			<RouterRoute path="/" element={<App />}>
				{routes.map((route) => (
					<RouterRoute
						key={route.slug}
						path={route.slug}
						element={routeElement(route)}
						index={route.index}
					/>
				))}
				<RouterRoute
					key="*"
					path="*"
					element={<Typography>Page not found :(</Typography>}
				/>
			</RouterRoute>
		</Routes>
	);
}

function App() {
	const theme = useTheme();
	const onMobile = useMediaQuery(theme.breakpoints.down("lg"));
	const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
	const location = useLocation();
	const user = useUser();

	useEffect(() => {
		document.title = "Manage sensors";
	}, []);

	return (
		<Box sx={{ pl: onMobile ? 0 : `${drawerWidth}px` }}>
			<AppBar position="fixed">
				<Toolbar variant={onMobile ? undefined : "dense"}>
					{onMobile && (
						<IconButton
							sx={{ mr: 2 }}
							color="inherit"
							aria-label="open drawer"
							onClick={() => setMobileDrawerOpen(true)}
							edge="start">
							<MenuIcon />
						</IconButton>
					)}
					<Typography variant="h6" component="h1">
						{routes
							.sort((a, b) => {
								const aLength: number = a.slug
									? a.slug.length
									: 0;
								const bLength: number = b.slug
									? b.slug.length
									: 0;
								return bLength - aLength;
							})
							.find((route) =>
								route.index
									? location.pathname.endsWith("manage")
									: location.pathname.startsWith(
											"/manage/" +
												("indexSlug" in route
													? route.indexSlug
													: route.slug),
									  ),
							)?.text || "Unknown page"}
					</Typography>
				</Toolbar>
			</AppBar>
			<Sidebar
				links={routes.filter(
					(route): route is SidebarLink => "Icon" in route,
				)}
				width={drawerWidth}
				setMobileDrawerOpen={setMobileDrawerOpen}
				mobileDrawerOpen={mobileDrawerOpen}
			/>
			<Stack sx={{ minHeight: "100vh", p: 2 }}>
				<Toolbar variant={onMobile ? undefined : "dense"} />
				<Outlet />
			</Stack>
		</Box>
	);
}
