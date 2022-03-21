import { Paper } from "@mui/material";
import { SensorID } from "../types";

export function LiveDataGraphs({
	sensorID,
	height,
}: {
	sensorID: SensorID;
	height: number;
}) {
	return (
		<Paper variant="outlined" sx={{ width: "100%", p: 1 }}>
			<iframe
				style={{
					width: "100%",
					paddingInline: "10px",
				}}
				height={height}
				frameBorder={0}
				src={`https://ingest-worker.benhong.workers.dev/consume/${sensorID}`}
			/>
		</Paper>
	);
}
