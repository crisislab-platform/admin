import { Link } from "@mui/material";
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
	const liveDataURL = `${liveDataOrigin}/consume/${sensorID}?sort-channels=id${
		extraFlags
			? "&" +
			  Object.entries(extraFlags)
					.map(([k, v]) => `${k}=${v}`)
					.join("&")
			: ""
	}`;
	return (
		<>
			<Link
				target="_blank"
				href={liveDataURL}
				sx={{
					"&::after": { content: `" →"` },
				}}>
				View expanded
			</Link>
			<iframe
				style={{
					width: "100%",
					border: 0,
				}}
				height={height}
				src={liveDataURL}
			/>
		</>
	);
}
