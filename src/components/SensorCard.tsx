import { Box, Button, Paper, Stack, Typography } from "@mui/material";

import AndroidIcon from "@mui/icons-material/PhoneAndroid";
import MapIcon from "@mui/icons-material/Map";
import PiIcon from "@mui/icons-material/RouterOutlined";
import { Sensor } from "../types";
import { SensorStatusText } from "./BasicSensorInfo";
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
				{sensor.type &&
				sensor.type.toLowerCase().includes("android") ? (
					<AndroidIcon />
				) : (
					<PiIcon />
				)}
				<Typography variant="h6">{sensor.type || "Sensor"}</Typography>
			</Stack>
			{sensor.name && (
				<Typography variant="body1">
					{'"'}
					{sensor.name}
					{'"'}
				</Typography>
			)}
			<Stack sx={{ marginTop: "auto" }} gap={0.5}>
				<SensorStatusText online={sensor.online} />
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
