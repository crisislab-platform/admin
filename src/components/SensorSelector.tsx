import {
	Autocomplete,
	Box,
	InputAdornment,
	ListItem,
	TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { makeFetchSensors } from "../api";
import useAuth from "../auth/useAuth";
import { Sensor } from "../types";
import { SensorStatusIcon } from "./BasicSensorInfo";

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
	defaultSensorID = null
}: {
	label: string;
	sensor: Sensor | null;
	onChange: (sensor: Sensor) => void;
	defaultSensorID?: number|null;
	onLoaded?: (
		sensors: Awaited<
			ReturnType<ReturnType<typeof makeFetchSensors>>
		>["sensors"],
	) => void;
}) {
	const { user } = useAuth();
	const sensorsQuery = useQuery("sensors", makeFetchSensors(user?.token));
	const [sensorOptions, setSensorOptions] = useState<ReturnType<typeof simplifySensor>[]>([])

	/* This effect needs to fire before the computed data is given to the
		autocomplete component, otherwise the autocomplete will automatically
		select a default value, and overwrite the one selected by the user,
		if that selection is set in the onLoad callback. */
	useEffect(() => {
		if (!sensorsQuery?.data?.sensors) return;

		console.log("Default sensor id: ", defaultSensorID)
		
		if ((defaultSensorID!==null) && (sensor===null)){
			const sensor = sensorsQuery.data?.sensors?.[defaultSensorID];
			if (sensor) {
				console.log(`Setting default sensor selector sensor to #${defaultSensorID}`)
				onChange(sensor);
			}
		}

		onLoaded?.(sensorsQuery?.data?.sensors)

		setSensorOptions(Object.values(sensorsQuery.data.sensors).map(simplifySensor));
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
			renderInput={({InputProps, ...params}) => (
				<TextField
					{...params}
					label={sensorsQuery.isFetched ? label : "Loading..."}
					slotProps={{input:{
						...InputProps,
						startAdornment: (
							<InputAdornment position="start" sx={{ ml: 1 }}>
								<SensorStatusIcon online={sensor?.online} />
							</InputAdornment>
						),
					}}}
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
