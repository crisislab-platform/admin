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
import { ReactChild, useEffect, useState } from "react";

import MenuIcon from "@mui/icons-material/Menu";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SidebarLink } from "../types";
import { routes } from "./routes";
import { useLocation } from "react-router-dom";
import { useUser } from "../components";

const drawerWidth = 260;

export default function ManageApp() {
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
								location.pathname.startsWith(
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
