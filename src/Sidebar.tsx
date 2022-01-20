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
import ShareIcon from "@mui/icons-material/IosShare";
import CloseIcon from "@mui/icons-material/Close";
import LocationIcon from "@mui/icons-material/MyLocation";
import { useSnackbar } from "notistack";

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
	const { enqueueSnackbar } = useSnackbar();
	const theme = useTheme();
	const onMobile = useMediaQuery(theme.breakpoints.down("lg"));

	function handleClose() {
		setActiveSensor(null);
	}

	const sidebarContent = activeSensor && (
		<>
			<Stack sx={{ p: 1 }}>
				<Stack direction="row" sx={{ mb: 1 }} gap={1}>
					<Box>
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
					{"share" in navigator && (
						<Box>
							<Button
								startIcon={<ShareIcon />}
								variant="outlined"
								onClick={async () => {
									try {
										await navigator.share({
											title: `Sensor #${activeSensor.id} on the CRISiSLab sensor map`,
											text: `View live data from sensor #${
												activeSensor.id
											}${
												activeSensor.name
													? ` (${activeSensor.name})`
													: ""
											} plus live data from loads of other sensors on the CRISiSLab sensor map.`,
											url: window.location.href,
										});
									} catch (err) {
										enqueueSnackbar(
											"Failed to share sensor information.",
											{ variant: "warning" },
										);
									}
								}}>
								Share
							</Button>
						</Box>
					)}
				</Stack>
				<BasicSensorInfo sensor={activeSensor} />
				<Divider sx={{ my: (theme) => theme.spacing(1) }} />
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
