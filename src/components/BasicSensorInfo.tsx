import { Stack, SxProps, Theme, Typography } from "@mui/material";

import AndroidIcon from "@mui/icons-material/PhoneAndroid";
import ConnectedIcon from "@mui/icons-material/Sensors";
import NotConnectedIcon from "@mui/icons-material/SensorsOff";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { Sensor } from "../types";
import SensorIcon from "@mui/icons-material/RouterOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
export function statusColour(theme: Theme, online?: boolean) {
	return online === true
		? theme.palette.success.main
		: online === false
		? theme.palette.error.main
		: theme.palette.secondary.main;
}

export function SensorStatusIcon({ online }: { online?: boolean }) {
	return online === true ? (
		<ConnectedIcon
			sx={{
				color: (theme) => statusColour(theme, online),
			}}
		/>
	) : online === false ? (
		<NotConnectedIcon
			sx={{
				color: (theme) => statusColour(theme, online),
			}}
		/>
	) : (
		<QuestionMarkIcon
			sx={{
				color: (theme) => statusColour(theme, online),
			}}
		/>
	);
}
export function SensorStatusText({
	online,
	addLabel,
}: {
	online?: boolean;
	addLabel?: boolean;
}) {
	return (
		<Stack direction="row" gap={0.5} alignItems="center">
			{addLabel && <Typography>Connection status: </Typography>}
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

export function SensorImage({
	sensor,
	size,
	showStatusColour,
}: {
	sensor: Sensor;
	size?: number;
	showStatusColour?: boolean;
}) {
	const iconStyle: SxProps<Theme> = {
		width: size,
		height: size,
		color: showStatusColour
			? (theme) => statusColour(theme, sensor.online)
			: undefined,
	};

	const type = sensor.type?.toLowerCase() + "";

	if (type.includes("android")) return <AndroidIcon sx={iconStyle} />;
	if (type.includes("palert")) return <AddCircleOutlineIcon sx={iconStyle} />;

	return <SensorIcon sx={iconStyle} />;
}
