import { Autocomplete, Stack, TextField } from "@mui/material";
import { useMemo, useState } from "react";
import { LiveDataGraphs } from "../../../components";
import { useQuery } from "react-query";
import useAuth from "../../../auth/useAuth";
import { makeFetchSensors } from "../../../api";
import { Sensor } from "../../../types";

export function SensorsSideBySide() {
	const { user } = useAuth();
	const sensorsQuery = useQuery("sensors", makeFetchSensors(user?.token));
	const [sensor1, setSensor1] = useState<{ id: number; label: string }>({
		id: 2,
		label: "Choose a sensor (#2 currently)",
	});
	const [sensor2, setSensor2] = useState<{ id: number; label: string }>({
		id: 4,
		label: "Choose a sensor (#4 currently)",
	});

	const sensorOptions = useMemo(
		() =>
			sensorsQuery?.data?.sensors
				? Object.values(sensorsQuery.data.sensors).map((sensor) => ({
						label: `#${sensor.id}${
							sensor.secondary_id ? ` ${sensor.secondary_id}` : ""
						}${sensor.name ? ` "${sensor.name}"` : ""}${
							sensor.type ? ` ${sensor.type}` : ""
						}`,
						id: sensor.id,
				  }))
				: [],
		[sensorsQuery.data],
	);

	return (
		<Stack direction="row" sx={{ p: 2 }}>
			<Stack sx={{ width: "50%", height: "100%" }} gap={1}>
				<Autocomplete
					disabled={!sensorsQuery.isFetched}
					options={sensorOptions}
					value={sensor1}
					onChange={(_, value) => setSensor1(value)}
					renderInput={(params) => (
						<TextField {...params} label="First sensor" />
					)}
				/>
				<LiveDataGraphs sensorID={sensor1.id} height={600} />
			</Stack>
			<Stack sx={{ width: "50%", height: "100%" }} gap={1}>
				<Autocomplete
					disabled={!sensorsQuery.isFetched}
					options={sensorOptions}
					value={sensor2}
					onChange={(_, value) => setSensor2(value)}
					renderInput={(params) => (
						<TextField {...params} label="Second sensor" />
					)}
				/>
				<LiveDataGraphs
					sensorID={sensor2.id}
					height={600}
					extraFlags={{ "y-axis-side": "right" }}
				/>
			</Stack>
		</Stack>
	);
}
