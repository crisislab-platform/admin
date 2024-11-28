import { Stack } from "@mui/material";
import { useState } from "react";
import { LiveDataGraphs } from "../../../components";
import { Sensor } from "../../../types";
import { SensorSelector } from "../../../components/SensorSelector";

export function SensorsSideBySide() {
	const [sensor1, setSensor1] = useState<Sensor | null>(null);
	const [sensor2, setSensor2] = useState<Sensor | null>(null);

	return (
		<Stack direction="row" sx={{ p: 2 }}>
			<Stack sx={{ width: "50%", height: "100%" }} gap={1}>
				<SensorSelector
					label={"First sensor"}
					sensor={sensor1}
					onChange={setSensor1}
					onLoaded={(sensors) => {
						if (sensor1 === null) setSensor1(sensors[2] ?? null);
					}}
				/>
				{sensor1 && (
					<LiveDataGraphs
						sensorID={sensor1.id}
						height={600}
						extraFlags={{
							"hide-pause-button": "yes",
						}}
					/>
				)}
			</Stack>
			<Stack sx={{ width: "50%", height: "100%" }} gap={1}>
				<SensorSelector
					label={"Second sensor"}
					sensor={sensor2}
					onChange={setSensor2}
					onLoaded={(sensors) => {
						if (sensor2 === null) setSensor2(sensors[4] ?? null);
					}}
				/>
				{sensor2 && (
					<LiveDataGraphs
						sensorID={sensor2.id}
						height={600}
						extraFlags={{
							"y-axis-side": "right",
							"hide-pause-button": "yes",
						}}
					/>
				)}
			</Stack>
		</Stack>
	);
}
