import { Box, Button, Paper, Stack, Typography } from "@mui/material";

import AndroidIcon from "@mui/icons-material/PhoneAndroid";
import ExternalLinkIcon from "@mui/icons-material/OpenInNew";
import PiIcon from "@mui/icons-material/RouterOutlined";
import { Sensor } from "../types";
import { SensorStatusIcon } from "./BasicSensorInfo";
const shakemapOrigin = "https://shakemap.viggers.net";

export function SensorCard({
	sensor,
	onDetailsClick,
}: {
	sensor: Sensor;
	onDetailsClick?: () => void;
}) {
	const online = sensor.status === "online";
	return (
		<Paper
			variant="outlined"
			sx={{ width: "310px", p: 1, borderColor: "rgba(0,0,0,0.25)" }}>
			<Stack gap={0.5}>
				<Stack direction="row" alignItems="center" gap={0.5}>
					{sensor.type === "android" ? <AndroidIcon /> : <PiIcon />}
					<Typography variant="h6">
						{generateSensorCardTitle(sensor)}
					</Typography>
				</Stack>
				{sensor.name && (
					<Typography variant="body1">{sensor.name}</Typography>
				)}
				<Stack direction="row" gap={1} alignItems="center">
					<SensorStatusIcon status={sensor.status} />
					<Typography
						variant="button"
						sx={{
							color: (theme) =>
								online
									? theme.palette.success.main
									: theme.palette.error.main,
						}}>
						{" "}
						{online ? "Online" : "Offline"}
					</Typography>
				</Stack>
				<Stack direction="row" gap={1} sx={{ width: "100%" }}>
					<Box>
						<Button
							color="primary"
							variant="contained"
							onClick={onDetailsClick}>
							View details
						</Button>
					</Box>
					<Box>
						<OpenInMapButton sensor={sensor} />
					</Box>
				</Stack>
			</Stack>
		</Paper>
	);
}

export function generateSensorCardTitle(
	sensor: Sensor | null,
): string | undefined {
	return sensor
		? `${
				sensor.type
					? `${sensor.type === "android" ? "Android" : "Pi"}`
					: "Sensor"
		  } (${sensor.id})`
		: undefined;
}

export function OpenInMapButton({ sensor }: { sensor: Sensor }) {
	const shakemapURL = new URL(shakemapOrigin);
	shakemapURL.searchParams.set("sensor_id", sensor.id + "");
	return (
		<Button
			href={shakemapURL.toString()}
			target="_blank"
			startIcon={<ExternalLinkIcon />}
			color="primary"
			variant="outlined">
			Open in map
		</Button>
	);
}
