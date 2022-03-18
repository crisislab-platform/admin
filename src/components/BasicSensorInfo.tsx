import { Stack, Theme, Typography } from "@mui/material";

import ConnectedIcon from "@mui/icons-material/Sensors";
import NotConnectedIcon from "@mui/icons-material/SensorsOff";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";

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
