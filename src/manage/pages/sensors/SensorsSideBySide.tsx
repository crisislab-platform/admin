import { Stack, TextField } from "@mui/material";
import { useMemo, useState } from "react";
import { LiveDataGraphs } from "../../../components";

export function SensorsSideBySide() {
	const [sensor1Raw, setSensor1Raw] = useState("2");
	const [sensor2Raw, setSensor2Raw] = useState("4");

	const sensor1ID = useMemo(() => Number.parseInt(sensor1Raw), [sensor1Raw]);
	const sensor2ID = useMemo(() => Number.parseInt(sensor2Raw), [sensor2Raw]);

	return (
		<Stack direction="row" sx={{ p: 2 }}>
			<Stack sx={{ width: "50%", height: "100%" }} gap={1}>
				<TextField
					label="First sensor ID"
					value={sensor1Raw}
					onChange={(ev) => setSensor1Raw(ev.target.value)}
				/>
				<LiveDataGraphs sensorID={sensor1ID} height={600} />
			</Stack>
			<Stack sx={{ width: "50%", height: "100%" }} gap={1}>
				<TextField
					label="Second sensor ID"
					value={sensor2Raw}
					onChange={(ev) => setSensor2Raw(ev.target.value)}
				/>
				<LiveDataGraphs
					sensorID={sensor2ID}
					height={600}
					extraFlags={{ "axis-side": "right" }}
				/>
			</Stack>
		</Stack>
	);
}
