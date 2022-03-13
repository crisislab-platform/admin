import {
	Avatar,
	Box,
	Divider,
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Stack,
	SwipeableDrawer,
	Theme,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { LoginButton, useNavigateWithQuery } from "../components";
import { useLocation, useNavigate } from "react-router-dom";

import MapIcon from "@mui/icons-material/Map";
import { SidebarLink } from "../types";
import useAuth from "../auth/useAuth";

const longTextMixin = {
	textOverflow: "ellipsis",
	overflow: "hidden",
	maxWidth: "21ch",
};

export default function Sidebar({
	links,
	width,
	setMobileDrawerOpen,
	mobileDrawerOpen,
}: {
	links: SidebarLink[];
	width: number;
	setMobileDrawerOpen: Dispatch<SetStateAction<boolean>>;
	mobileDrawerOpen: boolean;
}) {
	const theme = useTheme();
	const onMobile = useMediaQuery(theme.breakpoints.down("lg"));
	const { user } = useAuth();
	const navigateWithQuery = useNavigateWithQuery();
	const navigate = useNavigate();

	const location = useLocation();
	const onIOS =
		typeof navigator !== "undefined" &&
		/iPad|iPhone|iPod/.test(navigator.userAgent);

	const drawerContents = (
		<>
			{!onMobile && <Toolbar variant={onMobile ? undefined : "dense"} />}

			<Stack gap={1} sx={{ p: onMobile ? 2 : 1 }}>
				{!!user && (
					<Stack direction="row" alignItems="center" gap={1}>
						{user.picture && (
							<Avatar
								src={user.picture}
								alt={user.name || user.email}
							/>
						)}
						<Stack>
							{user.name && (
								<Typography sx={{ ...longTextMixin }}>
									{user.name}
								</Typography>
							)}

							<Typography
								sx={{
									color: (theme) =>
										theme.palette.text.secondary,
									...longTextMixin,
								}}>
								{user.email}
							</Typography>
						</Stack>
					</Stack>
				)}
				<Box>
					<LoginButton />
				</Box>
				<Divider />
			</Stack>
			<List>
				{links.map((link) => (
					<ListItem
						key={link.slug}
						selected={location.pathname.split("/")[2] === link.slug}
						disablePadding>
						<ListItemButton
							onClick={() => {
								navigateWithQuery(`./${link.slug}`);
								setMobileDrawerOpen(false);
							}}>
							<ListItemIcon>
								{location.pathname.split("/")[2] ===
								link.slug ? (
									<link.ActiveIcon />
								) : (
									<link.Icon />
								)}
							</ListItemIcon>
							<ListItemText primary={link.text} />
						</ListItemButton>
					</ListItem>
				))}
				<ListItem key="go-to-map-link" disablePadding>
					<ListItemButton
						href="/map"
						onClick={(event) => {
							event.preventDefault();
							navigate("/map");
						}}>
						<ListItemIcon>
							<MapIcon />
						</ListItemIcon>
						<ListItemText primary="Launch map" />
					</ListItemButton>
				</ListItem>
			</List>
		</>
	);

	if (onMobile) {
		return (
			<SwipeableDrawer
				sx={{
					width,
					flexShrink: 0,
					"& .MuiDrawer-paper": {
						zIndex: (theme: Theme) => theme.zIndex.appBar + 1,
						width,
						boxSizing: "border-box",
						py: 1,
					},
				}}
				disableBackdropTransition={!onIOS}
				disableDiscovery={onIOS}
				anchor="left"
				open={mobileDrawerOpen}
				onOpen={() => setMobileDrawerOpen(true)}
				onClose={() => setMobileDrawerOpen(false)}>
				{drawerContents}
			</SwipeableDrawer>
		);
	}

	return (
		<Drawer
			sx={{
				width,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					zIndex: (theme: Theme) => theme.zIndex.appBar - 1,
					width,
					boxSizing: "border-box",
					py: 1,
				},
			}}
			open
			variant="persistent"
			anchor="left">
			{drawerContents}
		</Drawer>
	);
}
