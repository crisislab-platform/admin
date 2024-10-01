import {
	Autocomplete,
	Box,
	InputAdornment,
	ListItem,
	TextField,
} from "@mui/material";
import { SensorStatusIcon } from "./BasicSensorInfo";
import useAuth from "../auth/useAuth";
import { useQuery } from "react-query";
import { makeFetchSensors } from "../api";
import { useEffect, useMemo } from "react";
import { Sensor } from "../types";

function simplifySensor(sensor: Sensor | null) {
	return sensor === null
		? null
		: {
				label: `#${sensor.id}${
					sensor.secondary_id ? ` ${sensor.secondary_id}` : ""
				}${sensor.name ? ` "${sensor.name}"` : ""}${
					sensor.type ? ` ${sensor.type}` : ""
				}`,
				id: sensor.id,
				online: sensor.online,
		  };
}

export function SensorSelector({
	label,
	sensor,
	onChange,
	onLoaded,
}: {
	label: string;
	sensor: Sensor | null;
	onChange: (sensor: Sensor) => void;
	onLoaded?: (
		sensors: Awaited<
			ReturnType<ReturnType<typeof makeFetchSensors>>
		>["sensors"],
	) => void;
}) {
	const { user } = useAuth();
	const sensorsQuery = useQuery("sensors", makeFetchSensors(user?.token));

	const sensorOptions = useMemo(
		() =>
			sensorsQuery?.data?.sensors
				? Object.values(sensorsQuery.data.sensors).map(simplifySensor)
				: [],
		[sensorsQuery.data],
	);

	useEffect(() => {
		if (sensorsQuery?.data?.sensors) onLoaded?.(sensorsQuery.data.sensors);
	}, [sensorsQuery.data]);

	return (
		<Autocomplete
			disabled={!sensorsQuery.isFetched}
			options={sensorOptions}
			value={simplifySensor(sensor)}
			onChange={(_, value) => {
				if (!value) return;

				const sensor = sensorsQuery.data?.sensors?.[value.id];

				if (!sensor) return;

				onChange(sensor);
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					label={sensorsQuery.isFetched ? label : "Loading..."}
					InputProps={{
						...params.InputProps,
						startAdornment: (
							<InputAdornment position="start" sx={{ ml: 1 }}>
								<SensorStatusIcon online={sensor?.online} />
							</InputAdornment>
						),
					}}
				/>
			)}
			renderOption={(props, option) => (
				<ListItem {...props}>
					<SensorStatusIcon online={option?.online} />
					<Box sx={{ ml: 1 }} component="span">
						{option?.label}
					</Box>
				</ListItem>
			)}
		/>
	);
}
