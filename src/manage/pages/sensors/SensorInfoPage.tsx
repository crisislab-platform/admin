import { Box, Button, Stack, Typography } from "@mui/material";

import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { LiveDataGraphs } from "../../../components";
import { useParams } from "react-router-dom";

export function SensorInfoPage() {
	const { sensorID: rawSensorID } = useParams();
	const sensorID = Number(rawSensorID);
	return (
		<Stack>
			<Typography variant="h5">Sensor #{sensorID}</Typography>
			<Box>
				<Button
					variant="outlined"
					color="primary"
					startIcon={<FullscreenIcon />}
					href={`https://ingest-worker.benhong.workers.dev/consume/${sensorID}`}>
					Open in full-screen
				</Button>
			</Box>
			<LiveDataGraphs sensorID={sensorID} />
		</Stack>
	);
}
