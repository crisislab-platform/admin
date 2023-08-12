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
	Tooltip,
	Typography,
} from "@mui/material";
import { Dispatch, SetStateAction, useMemo } from "react";
import { LoginButton, useNavigateWithQuery } from "../components";

import LaunchIcon from "@mui/icons-material/Launch";
import { SidebarLink } from "../types";
import StarIcon from "@mui/icons-material/LocalPolice";
import { mapURL, useOnMobile } from "../utils";
import useAuth from "../auth/useAuth";
import { useLocation } from "react-router-dom";

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
	const onMobile = useOnMobile();
	const { user } = useAuth();
	const navigateWithQuery = useNavigateWithQuery();

	const sortedLinks = useMemo(() => {
		let linksCopy = [...links];
		links.sort((a, b) => {
			if (b.position === undefined && a.position === undefined) {
				return 0;
			}
			if (a.position && b.position === undefined) {
				return -1;
			}
			if (b.position && a.position === undefined) {
				return 1;
			}

			// Smaller position = higher in list
			if (a.position < b.position) {
				return -1;
			}
			if (b.position < a.position) {
				return 1;
			}
			return 0;
		});
		return links;
	}, [links]);

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
							<Stack direction="row" alignItems="center" gap={1}>
								{user.name && (
									<Typography sx={{ ...longTextMixin }}>
										{user.name}
									</Typography>
								)}
								{"super" in user && (
									<Tooltip
										title="Super User"
										placement="right">
										<StarIcon />
									</Tooltip>
								)}
							</Stack>
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
				{sortedLinks.map(
					(link) =>
						link.showInSidebar !== false && (
							<ListItem
								key={link.slug}
								selected={
									location.pathname.split("/")[2] ===
									link.slug
								}
								disablePadding>
								<ListItemButton
									onClick={() => {
										navigateWithQuery(
											`/manage/${link.slug}`,
										);
										setMobileDrawerOpen(false);
									}}>
									<ListItemIcon>
										{link.ActiveIcon ? (
											location.pathname.split("/")[2] ===
											link.slug ? (
												<link.ActiveIcon />
											) : (
												<link.Icon />
											)
										) : (
											<link.Icon />
										)}
									</ListItemIcon>
									<ListItemText primary={link.text} />
								</ListItemButton>
							</ListItem>
						),
				)}
				<ListItem key="go-to-map-link" disablePadding>
					<ListItemButton href={mapURL} target="_blank">
						<ListItemIcon>
							<LaunchIcon />
						</ListItemIcon>
						<ListItemText primary="Launch shakemap" />
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
