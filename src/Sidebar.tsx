import {
	Box,
	Drawer,
	IconButton,
	Stack,
	Typography,
	Divider,
	Dialog,
	AppBar,
	Toolbar,
	Slide,
	useTheme,
	useMediaQuery,
} from "@mui/material";
import React, { Suspense, forwardRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import LocationIcon from "@mui/icons-material/MyLocation";

import { Sensor } from "./types";
import { TransitionProps } from "@mui/material/transitions";
import LoadingSpinner from "./LoadingSpinner";
import BasicSensorInfo from "./BasicSensorInfo";
const LiveDataGraphs = React.lazy(() => import("./LiveDataGraphs"));

const SlideUpTransition = forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>,
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

export default function Sidebar({
	activeSensor,
	setActiveSensor,
	width,
	flyToCoords,
}: {
	activeSensor: Sensor | null;
	setActiveSensor: (toSet: Sensor | null) => void;
	width: number;
	flyToCoords: (
		longatude: number,
		latitude: number,
		sidebarOpen: boolean,
	) => void;
}) {
	const theme = useTheme();
	const onMobile = useMediaQuery(theme.breakpoints.down("lg"));

	function handleClose() {
		setActiveSensor(null);
	}

	const sidebarContent = activeSensor && (
		<>
			<Stack sx={{ p: 1 }}>
				<BasicSensorInfo sensor={activeSensor} />
				<Divider sx={{ my: (theme) => theme.spacing(1) }} />
				<Suspense fallback={<LoadingSpinner />}>
					<LiveDataGraphs />
				</Suspense>
			</Stack>
		</>
	);

	if (onMobile) {
		return (
			<Dialog
				fullScreen
				open={!!activeSensor}
				onClose={handleClose}
				TransitionComponent={SlideUpTransition}>
				<AppBar sx={{ position: "relative" }}>
					<Toolbar>
						<IconButton
							edge="start"
							color="inherit"
							onClick={handleClose}
							aria-label="close">
							<CloseIcon />
						</IconButton>
						<Typography
							sx={{ ml: 2, flex: 1 }}
							variant="h6"
							component="div">
							Sensor #{activeSensor && activeSensor.id}
						</Typography>
					</Toolbar>
				</AppBar>
				{sidebarContent}
			</Dialog>
		);
	}

	return (
		<Drawer
			sx={{
				width: width,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: width,
					boxSizing: "border-box",
					p: 1,
				},
			}}
			open={!!activeSensor}
			variant="persistent"
			anchor="right">
			<Stack direction="row">
				<Box>
					<IconButton onClick={handleClose}>
						<CloseIcon />
					</IconButton>
				</Box>
			</Stack>
			{sidebarContent}
		</Drawer>
	);
}
