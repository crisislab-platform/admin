import { Stack, Typography } from "@mui/material";

import { LiveDataGraphs } from "../../components";
import { useParams } from "react-router-dom";

export function SensorInfo() {
	const { sensorID } = useParams();
	return (
		<Stack>
			<Typography variant="h5">Sensor #{sensorID}</Typography>
			<LiveDataGraphs sensorID={sensorID} />
		</Stack>
	);
}
