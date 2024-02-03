import { SensorID } from "../types";
import { APIOrigin } from "../utils";

const liveDataOrigin = APIOrigin;

export function LiveDataGraphs({
	sensorID,
	height,
	extraFlags,
}: {
	sensorID: SensorID;
	height: number;
	extraFlags?: Record<string, string>;
}) {
	if (typeof sensorID !== "number") return null;
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
