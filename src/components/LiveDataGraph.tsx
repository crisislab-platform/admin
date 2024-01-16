import { Paper } from "@mui/material";
import { SensorID } from "../types";

const liveDataOrigin = "https://crisislab-data.massey.ac.nz";

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
				src={`${liveDataOrigin}/consume/${sensorID}?sort-channels=id`}
			/>
		</Paper>
	);
}
