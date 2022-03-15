import { SensorID } from "../types";

export function LiveDataGraphs({ sensorID }: { sensorID: SensorID }) {
	return (
		<iframe
			src={`https://ingest-worker.benhong.workers.dev/consume/${sensorID}`}
			height={512}
		/>
	);
}
