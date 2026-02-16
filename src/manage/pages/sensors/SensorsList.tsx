import {
	Alert,
	AlertTitle,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from "@mui/material";
import { useParams } from "react-router";
import {
	LinkWithQuery,
	LoadingSpinner,
	SensorImage,
} from "../../../components";
import { FilterRule, Sensor, SensorID, SensorSortKey } from "../../../types";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { makeFetchSensors } from "../../../api";
import useAuth from "../../../auth/useAuth";

export function SensorsList({
	sortKey,
	sortAscending,
	filterRules,
}: {
	sortKey: SensorSortKey;
	sortAscending: boolean;
	filterRules: FilterRule<Sensor>[];
}) {
	const { user } = useAuth();
	const { sensorID: rawSensorID } = useParams();
	const sensorsQuery = useQuery("sensors", makeFetchSensors(user?.token));
	const filteredSensors = useMemo<null | Sensor[]>(() => {
		// Make sure that the data is loaded
		if (!sensorsQuery.isSuccess) return null;

		let sensors = Object.values(sensorsQuery.data.sensors);

		// Only filter if there are things to filter by
		if (filterRules.length === 0) return sensors;

		// Apply all filter rules
		for (const filterRule of filterRules) {
			sensors = sensors.filter((sensor) => {
				if (!(filterRule.property in sensor)) return false;

				let keep = false;

				switch (filterRule.operation) {
					case "equals":
						// Make sure to cast property & value to strings
						keep =
							(sensor[filterRule.property] + "").toLowerCase() ===
							filterRule.value;
						break;
					case "includes":
						// Make sure to cast property & value to strings
						keep = (sensor[filterRule.property] + "")
							.toLowerCase()
							.includes(filterRule.value);
						break;
					case "greater-than":
						keep =
							(sensor[filterRule.property] ?? 0) >
							filterRule.value;
						break;
					case "less-than":
						keep =
							(sensor[filterRule.property] ?? 0) <
							filterRule.value;
						break;
					default:
						// If for some reason there isn't an operation, keep the sensor
						keep = true;
						break;
				}

				// Apply negative rules
				if (filterRule.reversed) {
					keep = !keep;
				}

				return keep;
			});
		}

		return sensors;
	}, [sensorsQuery.data, filterRules]);
	const sortedSensors = useMemo<null | Sensor[]>(() => {
		// Make sure that the data is loaded
		if (!filteredSensors) return null;

		// Create copy of filtered sensors
		let sensors = [...filteredSensors];

		// Sort
		sensors.sort((a, b) => {
			// Normalise the sort values
			let aSortValue = a[sortKey];
			if (typeof aSortValue === "string") {
				aSortValue = aSortValue.trim().toLowerCase();
			}
			let bSortValue = b[sortKey];
			if (typeof bSortValue === "string") {
				bSortValue = bSortValue.trim().toLowerCase();
			}

			const aGreaterThanB = sortAscending ? 1 : -1;
			const aLessThanB = sortAscending ? -1 : 1;

			// If and and b are falsey a...
			if (!(bSortValue || aSortValue)) {
				return 0;
			}
			// If a is falsey and b is not...
			if (!aSortValue && !!bSortValue) {
				return aLessThanB;
			}
			// If b is falsey and a is not...
			if (!bSortValue && !!aSortValue) {
				return aGreaterThanB;
			}

			// Reduce type checks below
			aSortValue ??= 0;
			bSortValue ??= 0;

			// If a is greater than b
			if (aSortValue > bSortValue) {
				return aGreaterThanB;
			}
			// If a is less than b
			if (aSortValue < bSortValue) {
				return aLessThanB;
			}
			// a must be equal to b
			return 0;
		});

		return sensors;
	}, [filteredSensors, sortKey, sortAscending]);

	let sensorID: SensorID | null = null;
	try {
		sensorID = Number(rawSensorID);
	} catch (error) {}

	if (sensorsQuery.isLoading) {
		return <LoadingSpinner addPadding message="Loading sensors" />;
	}

	if (sensorsQuery.isError) {
		return (
			<Alert severity="error" sx={{ m: 2 }}>
				<AlertTitle>Failed to load sensors.</AlertTitle>
				{(sensorsQuery.error as any)?.message ||
					sensorsQuery.error + ""}
			</Alert>
		);
	}

	return (
		<List sx={{ maxHeight: "100%", overflow: "auto" }}>
			{sortedSensors?.map((sensor) => {
				const sensorIDText = `#${sensor.id}${
					sensor.type ? ` - ${sensor.type}` : ""
				}`;
				return (
					<ListItemButton
						key={sensor.id}
						component={LinkWithQuery}
						to={`/manage/sensors/${sensor.id}`}
						selected={sensorID === sensor.id}>
						<ListItemIcon>
							<SensorImage sensor={sensor} showStatusColour />
						</ListItemIcon>
						<ListItemText
							primary={
								sensor.secondary_id
									? `${sensor.secondary_id}`
									: sensorIDText
							}
							secondary={
								sensor.secondary_id ? sensorIDText : undefined
							}
						/>
					</ListItemButton>
				);
			})}
		</List>
	);
}
