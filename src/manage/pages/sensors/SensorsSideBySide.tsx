import { Stack, TextField } from "@mui/material";
import { useState } from "react";
import { LiveDataGraphs } from "../../../components";

export function SensorsSideBySide() {
	const [sensor1, setSensor1] = useState("2");
	const [sensor2, setSensor2] = useState("4");

	return (
		<Stack direction="row" sx={{ p: 2 }} gap={2}>
			<Stack sx={{ width: "50%" }} gap={1}>
				<TextField
					label="First sensor ID"
					value={sensor1}
					onChange={(ev) => setSensor1(ev.target.value)}
				/>
				<LiveDataGraphs sensorID={Number.parseInt(sensor1)} height={580} />
			</Stack>
			<Stack sx={{ width: "50%" }} gap={1}>
				<TextField
					label="Second sensor ID"
					value={sensor2}
					onChange={(ev) => setSensor2(ev.target.value)}
				/>
				<LiveDataGraphs sensorID={Number.parseInt(sensor2)} height={580} />
			</Stack>
		</Stack>
	);
}
