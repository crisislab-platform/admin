import {
	Alert,
	AlertTitle,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from "@mui/material";
import { LoadingSpinner, SensorImage } from "../../../components";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Sensor, SensorID, SensorSortKey } from "../../../types";

import { makeFetchSensors } from "../../../api";
import useAuth from "../../../auth/useAuth";
import { useMemo } from "react";
import { useQuery } from "react-query";

export function SensorsList({
	sortKey,
	sortAscending,
}: {
	sortKey: SensorSortKey;
	sortAscending: boolean;
}) {
	const { user } = useAuth();
	const { sensorID: rawSensorID } = useParams();
	const sensorsQuery = useQuery(
		"sensors",
		makeFetchSensors(user && user.token),
	);
	const sortedSensors = useMemo<null | Sensor[]>(() => {
		if (!sensorsQuery.isSuccess) return null;

		let sensors = Object.values(sensorsQuery.data.sensors);

		sensors.sort((a, b) => {
			// Noramalise the sort values
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
			if (!bSortValue && !aSortValue) {
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
	}, [sensorsQuery.data, sortKey, sortAscending]);

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
			{sortedSensors.map((sensor) => {
				const sensorIDText = `Sensor #${sensor.id}`;
				return (
					<ListItemButton
						key={sensor.id}
						component={RouterLink}
						to={`./${sensor.id}`}
						selected={sensorID === sensor.id}>
						<ListItemIcon>
							<SensorImage sensor={sensor} showStatusColour />
						</ListItemIcon>
						<ListItemText
							primary={
								sensor.name ? `"${sensor.name}"` : sensorIDText
							}
							secondary={sensor.name ? sensorIDText : undefined}
						/>
					</ListItemButton>
				);
			})}
		</List>
	);
}
