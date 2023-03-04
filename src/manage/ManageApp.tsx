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
import { useEffect, useState } from "react";

import { ErrorBoundary } from "../components";
import MenuIcon from "@mui/icons-material/Menu";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SidebarLink } from "../types";
import { routes } from "./routes";
import { useLocation } from "react-router-dom";

const drawerWidth = 260;

export default function ManageApp() {
	const theme = useTheme();
	const onMobile = useMediaQuery(theme.breakpoints.down("lg"));
	const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
	const location = useLocation();

	useEffect(() => {
		document.title = "Manage sensors";
	}, []);

	return (
		<Box
			sx={{
				pl: onMobile ? 0 : `${drawerWidth}px`,
				height: "100%",
				maxHeight: "100%",
			}}
		>
			<AppBar position="fixed">
				<Toolbar variant={onMobile ? undefined : "dense"}>
					{onMobile && (
						<IconButton
							sx={{ mr: 2 }}
							color="inherit"
							aria-label="open drawer"
							onClick={() => setMobileDrawerOpen(true)}
							edge="start"
						>
							<MenuIcon />
						</IconButton>
					)}
					<Typography variant="h6" component="h1">
						{routes
							.sort((a, b) => {
								const aLength: number = a.slug ? a.slug.length : 0;
								const bLength: number = b.slug ? b.slug.length : 0;
								return bLength - aLength;
							})
							.find((route) =>
								location.pathname.startsWith(
									`/manage/${
										"indexSlug" in route ? route.indexSlug : route.slug
									}`,
								),
							)?.text || "Unknown page"}
					</Typography>
				</Toolbar>
			</AppBar>

			<Stack sx={{ height: "100%", maxHeight: "100%" }}>
				<Toolbar variant={onMobile ? undefined : "dense"} />
				{/* The sidebar is here (under the toolbar) so that if it throws, the error message is still visible under the app bar. */}
				<ErrorBoundary>
					<Sidebar
						links={routes.filter(
							(route): route is SidebarLink => "Icon" in route,
						)}
						width={drawerWidth}
						setMobileDrawerOpen={setMobileDrawerOpen}
						mobileDrawerOpen={mobileDrawerOpen}
					/>
				</ErrorBoundary>
				<ErrorBoundary>
					<Outlet />
				</ErrorBoundary>
			</Stack>
		</Box>
	);
}
