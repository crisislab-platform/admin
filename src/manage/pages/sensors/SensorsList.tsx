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

import { SensorID } from "../../../types";
import { makeFetchSensors } from "../../../api";
import useAuth from "../../../auth/useAuth";
import { useQuery } from "react-query";

export function SensorsList() {
	const { user } = useAuth();
	const { sensorID: rawSensorID } = useParams();
	const sensorsQuery = useQuery(
		"sensors",
		makeFetchSensors(user && user.token),
	);

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
			{Object.values(sensorsQuery.data.sensors).map((sensor) => {
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
