import {
	Autocomplete,
	Box,
	InputAdornment,
	ListItem,
	Stack,
	TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { LiveDataGraphs, SensorStatusIcon } from "../../../components";
import { useQuery } from "react-query";
import useAuth from "../../../auth/useAuth";
import { makeFetchSensors } from "../../../api";
import { Sensor } from "../../../types";

const renderAutocompleteOption = (props, option) => (
	<ListItem {...props}>
		<SensorStatusIcon online={option.online} />
		<Box sx={{ ml: 1 }} component="span">
			{option.label}
		</Box>
	</ListItem>
);

export function SensorsSideBySide() {
	const { user } = useAuth();
	const sensorsQuery = useQuery("sensors", makeFetchSensors(user?.token));
	const [sensor1, setSensor1] = useState<{
		id: number;
		label: string;
		online?: boolean;
	} | null>(null);
	const [sensor2, setSensor2] = useState<{
		id: number;
		label: string;
		online?: boolean;
	} | null>(null);

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
						online: sensor.online,
				  }))
				: [],
		[sensorsQuery.data],
	);

	useEffect(() => {
		// Load in default sensors
		if (!sensorOptions) return;
		if (sensor1 === null)
			setSensor1(sensorOptions.find((s) => s.id === 2) ?? null);
		if (sensor2 === null)
			setSensor2(sensorOptions.find((s) => s.id === 4) ?? null);
	}, [sensorOptions]);

	return (
		<Stack direction="row" sx={{ p: 2 }}>
			<Stack sx={{ width: "50%", height: "100%" }} gap={1}>
				<Autocomplete
					disabled={!sensorsQuery.isFetched}
					options={sensorOptions}
					value={sensor1}
					onChange={(_, value) => setSensor1(value)}
					renderInput={(params) => (
						<TextField
							{...params}
							label={
								sensorsQuery.isFetched
									? "First sensor"
									: "Loading..."
							}
							InputProps={{
								...params.InputProps,
								startAdornment: (
									<InputAdornment
										position="start"
										sx={{ ml: 1 }}>
										<SensorStatusIcon
											online={sensor1?.online}
										/>
									</InputAdornment>
								),
							}}
						/>
					)}
					renderOption={renderAutocompleteOption}
				/>
				<LiveDataGraphs sensorID={sensor1?.id} height={600} />
			</Stack>
			<Stack sx={{ width: "50%", height: "100%" }} gap={1}>
				<Autocomplete
					disabled={!sensorsQuery.isFetched}
					options={sensorOptions}
					value={sensor2}
					onChange={(_, value) => setSensor2(value)}
					renderInput={(params) => (
						<TextField
							{...params}
							label={
								sensorsQuery.isFetched
									? "Second sensor"
									: "Loading..."
							}
							InputProps={{
								...params.InputProps,
								startAdornment: (
									<InputAdornment
										position="start"
										sx={{ ml: 1 }}>
										<SensorStatusIcon
											online={sensor2?.online}
										/>
									</InputAdornment>
								),
							}}
						/>
					)}
					renderOption={renderAutocompleteOption}
				/>
				<LiveDataGraphs
					sensorID={sensor2?.id}
					height={600}
					extraFlags={{ "y-axis-side": "right" }}
				/>
			</Stack>
		</Stack>
	);
}
