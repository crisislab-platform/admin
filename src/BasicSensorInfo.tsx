import { Sensor } from "./types";
import { Stack, Typography } from "@mui/material";
import ConnectedIcon from "@mui/icons-material/Sensors";
import NotConnectedIcon from "@mui/icons-material/SensorsOff";
export default function BasicSensorInfo({ sensor }: { sensor: Sensor }) {
	return (
		<Stack>
			<Typography>
				Sensor ID: <strong>{sensor.id}</strong>
			</Typography>
			<Stack direction="row" gap={0.5}>
				<Typography>Connection status: </Typography>
				{sensor.status === "online" ? (
					<ConnectedIcon color="success" />
				) : (
					<NotConnectedIcon color="error" />
				)}
				<Typography>
					<strong>
						{sensor.status === "online" ? "Online" : "Offline"}
					</strong>
				</Typography>
			</Stack>
			<Typography>
				Longitude: <strong>{sensor.longitude}</strong>
			</Typography>
			<Typography>
				Latitude: <strong>{sensor.latitude}</strong>
			</Typography>
		</Stack>
	);
}
