import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { SensorImage, SensorStatusText, statusColour } from "./BasicSensorInfo";

import LaunchIcon from "@mui/icons-material/Launch";
import { Sensor } from "../types";
import { mapURL } from "../utils";

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
				<SensorImage sensor={sensor} />
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
						<Button
							endIcon={<LaunchIcon />}
							href={`${mapURL}/sensor/${sensor.id}`}
							target="_blank"
							color="primary"
							variant="outlined">
							Open in map
						</Button>
					</Box>
				</Stack>
			</Stack>
		</Paper>
	);
}
