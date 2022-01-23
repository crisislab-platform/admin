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
				<SensorStatusText status={sensor.status} />
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

export function SensorStatusIcon({ status }: { status: "online" | "offline" }) {
	return status === "online" ? (
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
export function SensorStatusText({ status }: { status: "online" | "offline" }) {
	return (
		<Stack direction="row" gap={0.5} alignItems="center">
			<SensorStatusIcon status={status} />
			<Typography
				variant="button"
				sx={{
					color: (theme) => {
						// console.log(theme);
						return status === "online"
							? theme.palette.success.main
							: theme.palette.error.main;
					},
				}}>
				{status}
			</Typography>
		</Stack>
	);
}
