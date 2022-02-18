import { Stack, Typography } from "@mui/material";

import ConnectedIcon from "@mui/icons-material/Sensors";
import NotConnectedIcon from "@mui/icons-material/SensorsOff";
import { Sensor } from "../types";

export function BasicSensorInfo({ sensor }: { sensor: Sensor }) {
	return (
		<Stack>
			<Typography>
				Sensor ID: <strong>{sensor.id}</strong>
			</Typography>
			<Stack direction="row" gap={0.5}>
				<Typography>Connection status: </Typography>
				<SensorStatusText online={sensor.online} />
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

export function SensorStatusIcon({ online }: { online: boolean }) {
	return online ? (
		<ConnectedIcon
			sx={{
				color: (theme) => {
					// console.log(theme);
					return theme.palette.success.main;
				},
			}}
		/>
	) : (
		<NotConnectedIcon
			sx={{
				color: (theme) => theme.palette.error.main,
			}}
		/>
	);
}
export function SensorStatusText({ online }: { online: boolean }) {
	return (
		<Stack direction="row" gap={0.5} alignItems="center">
			<SensorStatusIcon online={online} />
			<Typography
				variant="button"
				sx={{
					color: (theme) => {
						// console.log(theme);
						return online
							? theme.palette.success.main
							: theme.palette.error.main;
					},
				}}>
				{online ? "Online" : "Offline"}
			</Typography>
		</Stack>
	);
}
