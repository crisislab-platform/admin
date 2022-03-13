import { Stack, Typography } from "@mui/material";

import ConnectedIcon from "@mui/icons-material/Sensors";
import NotConnectedIcon from "@mui/icons-material/SensorsOff";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
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
				Longitude: <strong>{sensor.longitude || "Unknown"}</strong>
			</Typography>
			<Typography>
				Latitude: <strong>{sensor.latitude || "Unknown"}</strong>
			</Typography>
		</Stack>
	);
}

export function SensorStatusIcon({ online }: { online?: boolean }) {
	return online === true ? (
		<ConnectedIcon
			sx={{
				color: (theme) => {
					return theme.palette.success.main;
				},
			}}
		/>
	) : online === false ? (
		<NotConnectedIcon
			sx={{
				color: (theme) => theme.palette.error.main,
			}}
		/>
	) : (
		<QuestionMarkIcon
			sx={{
				color: (theme) => theme.palette.secondary.main,
			}}
		/>
	);
}
export function SensorStatusText({ online }: { online?: boolean }) {
	return (
		<Stack direction="row" gap={0.5} alignItems="center">
			<SensorStatusIcon online={online} />
			<Typography
				variant="button"
				sx={{
					color: (theme) => {
						return online === true
							? theme.palette.success.main
							: online === false
							? theme.palette.error.main
							: theme.palette.secondary.main;
					},
				}}>
				{online === true
					? "Online"
					: online === false
					? "Offline"
					: "Unknown"}
			</Typography>
		</Stack>
	);
}
