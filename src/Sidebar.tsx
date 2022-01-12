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
import LiveDataGraphs from "./LiveDataGraphs";
import CloseIcon from "@mui/icons-material/Close";
import ConnectedIcon from "@mui/icons-material/CellTower";
import LocationIcon from "@mui/icons-material/MyLocation";
import NotConnectedIcon from "@mui/icons-material/PortableWifiOff";
import { Sensor } from "./types";
import { forwardRef } from "react";
import { TransitionProps } from "@mui/material/transitions";

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
				<Typography>
					Sensor ID: <strong>{activeSensor.id}</strong>
				</Typography>
				<Stack direction="row" gap={0.5}>
					<Typography>Connection status: </Typography>
					{activeSensor.status === "online" ? (
						<ConnectedIcon color="success" />
					) : (
						<NotConnectedIcon color="error" />
					)}
					<Typography>
						<strong>
							{activeSensor.status === "online"
								? "Online"
								: "Offline"}
						</strong>
					</Typography>
				</Stack>
				<Typography>
					Longitude: <strong>{activeSensor.longitude}</strong>
				</Typography>
				<Typography>
					Latitude: <strong>{activeSensor.latitude}</strong>
				</Typography>
				<Divider sx={{ my: (theme) => theme.spacing(1) }} />
				<LiveDataGraphs />
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
