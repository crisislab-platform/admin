import { Box, Button, Paper, Stack, Typography } from "@mui/material";

import AndroidIcon from "@mui/icons-material/PhoneAndroid";
import MapIcon from "@mui/icons-material/Map";
import PiIcon from "@mui/icons-material/RouterOutlined";
import { Sensor } from "../types";
import { SensorStatusIcon } from "./BasicSensorInfo";
import { useNavigate } from "react-router-dom";

export function SensorCard({
	sensor,
	onDetailsClick,
}: {
	sensor: Sensor;
	onDetailsClick?: () => void;
}) {
	return (
		<Paper
			variant="outlined"
			sx={{
				width: "310px",
				p: 1,
				borderColor: "rgba(0,0,0,0.25)",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				gap: 0.5,
			}}>
			<Stack direction="row" alignItems="center" gap={0.5}>
				{sensor.type === "android" ? <AndroidIcon /> : <PiIcon />}
				<Typography variant="h6">
					{generateSensorCardTitle(sensor)}
				</Typography>
			</Stack>
			{sensor.name && (
				<Typography variant="body1">{sensor.name}</Typography>
			)}
			{sensor.type && (
				<Typography variant="body2">{sensor.type}</Typography>
			)}
			<Stack
				direction="row"
				gap={1}
				alignItems="center"
				sx={{ marginTop: "auto" }}>
				<SensorStatusIcon online={sensor.online} />
				<Typography
					variant="button"
					sx={{
						color: (theme) =>
							sensor.online
								? theme.palette.success.main
								: theme.palette.error.main,
					}}>
					{" "}
					{sensor.online ? "Online" : "Offline"}
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
	const navigate = useNavigate();
	const href = `/map?sensor_id=${sensor.id}`;
	return (
		<Button
			startIcon={<MapIcon />}
			href={href}
			onClick={(event) => {
				event.preventDefault();
				navigate(href);
			}}
			// target="_blank"
			color="primary"
			variant="outlined">
			Open in map
		</Button>
	);
}
