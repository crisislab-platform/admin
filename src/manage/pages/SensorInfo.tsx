import { LiveDataGraphs } from "../../components";
import { useParams } from "react-router-dom";

export function SensorInfo() {
	const { sensorID } = useParams();
	return <LiveDataGraphs sensorID={sensorID} />;
}
