import {
	AppBar,
	Box,
	Button,
	Dialog,
	Divider,
	Drawer,
	IconButton,
	Slide,
	Stack,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import {
	BasicSensorInfo,
	LoadingSpinner,
	Sensor,
	MobileDialog,
} from "internship-react-components";
import React, { Suspense } from "react";

import CloseIcon from "@mui/icons-material/Close";
import LocationIcon from "@mui/icons-material/MyLocation";

const LiveDataGraphs = React.lazy(() => import("./LiveDataGraphs"));

export default function Sidebar({
	activeSensor,
	setActiveSensor,
	width,
	flyToCoords,
}: {
	activeSensor: Sensor | null;
	setActiveSensor: (toSet: Sensor | null) => void;
	width: number;
	flyToCoords: (longatude: number, latitude: number) => void;
}) {
	const theme = useTheme();
	const onMobile = useMediaQuery(theme.breakpoints.down("lg"));

	function handleClose() {
		setActiveSensor(null);
	}

	const sidebarContent = activeSensor && (
		<>
			<Stack sx={{ p: 1 }}>
				<Box sx={{ mb: 1 }}>
					<Button
						startIcon={<LocationIcon />}
						variant="outlined"
						onClick={() => {
							flyToCoords(
								activeSensor.longitude,
								activeSensor.latitude,
							);
							if (onMobile) handleClose();
						}}>
						Show sensor on map
					</Button>
				</Box>
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
			<MobileDialog
				title={`Sensor${activeSensor && ` #${activeSensor.id}`}`}
				open={!!activeSensor}
				onClose={handleClose}>
				{sidebarContent}
			</MobileDialog>
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
