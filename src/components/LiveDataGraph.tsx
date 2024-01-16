import { Paper } from "@mui/material";
import { SensorID } from "../types";

const liveDataOrigin = "https://crisislab-data.massey.ac.nz";

export function LiveDataGraphs({
	sensorID,
	height,
	extraFlags,
}: {
	sensorID: SensorID;
	height: number;
	extraFlags?: Record<string, string>;
}) {
	return (
		<iframe
			style={{
				width: "100%",
			}}
			height={height}
			frameBorder={0}
			src={`${liveDataOrigin}/consume/${sensorID}?sort-channels=id${
				extraFlags
					? "&" +
					  Object.entries(extraFlags)
							.map(([k, v]) => `${k}=${v}`)
							.join("&")
					: ""
			}`}
		/>
	);
}
