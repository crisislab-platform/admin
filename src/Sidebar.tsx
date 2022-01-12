import { Box, Drawer, IconButton, Stack, Typography } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ConnectedIcon from "@mui/icons-material/CellTower";
import LocationIcon from "@mui/icons-material/MyLocation";
import NotConnectedIcon from "@mui/icons-material/PortableWifiOff";
import { Sensor } from "./types";

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
					<IconButton onClick={() => setActiveSensor(null)}>
						<CloseIcon />
					</IconButton>
				</Box>
			</Stack>
			{activeSensor && (
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
					</Stack>
				</>
			)}
		</Drawer>
	);
}
