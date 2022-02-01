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
import { LoginButton, useUser } from "../components";
import { useLocation, useNavigate } from "react-router-dom";

import { SidebarLink } from "../types";

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
	const user = useUser();
	const navigate = useNavigate();
	const location = useLocation();
	const onIOS =
		typeof navigator !== "undefined" &&
		/iPad|iPhone|iPod/.test(navigator.userAgent);

	const drawerContents = (
		<>
			{!onMobile && <Toolbar variant={onMobile ? undefined : "dense"} />}

			<Stack gap={1} sx={{ p: onMobile ? 2 : 1 }}>
				{user.isLoggedIn && user.info && (
					<Stack direction="row" alignItems="center" gap={1}>
						{user.info.picture && (
							<Avatar
								src={user.info.picture}
								alt={user.info.name}
							/>
						)}
						<Stack>
							{user.info.name && (
								<Typography sx={{ ...longTextMixin }}>
									{user.info.name}
								</Typography>
							)}
							{user.info.email && (
								<Typography
									sx={{
										color: (theme) =>
											theme.palette.text.secondary,
										...longTextMixin,
									}}>
									{user.info.email}
								</Typography>
							)}
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
						selected={location.pathname.endsWith(link.slug)}
						disablePadding>
						<ListItemButton
							disabled={
								!user.permissions.includes(
									link.requiredPermission,
								)
							}
							onClick={() => {
								navigate(`./${link.slug}`);
								setMobileDrawerOpen(false);
							}}>
							<ListItemIcon>
								<link.Icon />
							</ListItemIcon>
							<ListItemText primary={link.text} />
						</ListItemButton>
					</ListItem>
				))}
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
