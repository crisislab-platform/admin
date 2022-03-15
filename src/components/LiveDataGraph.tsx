import { SensorID } from "../types";

export function LiveDataGraphs({
	sensorID,
	height,
}: {
	sensorID: SensorID;
	height: number;
}) {
	return (
		<iframe
			style={{
				width: "100%",
				paddingInline: "10px",
			}}
			height={height}
			frameBorder={0}
			src={`https://ingest-worker.benhong.workers.dev/consume/${sensorID}`}
		/>
	);
}
