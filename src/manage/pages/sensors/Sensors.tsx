import {
	Alert,
	AlertTitle,
	Box,
	Fab,
	List,
	ListItem,
	Tooltip,
} from "@mui/material";
import { LoadingSpinner, SensorCard } from "../../../components";
import { useQuery, useQueryClient } from "react-query";

import ReloadIcon from "@mui/icons-material/Refresh";
import { makeFetchSensors } from "../../../api";
import useAuth from "../../../auth/useAuth";
import { useNavigate } from "react-router-dom";

export function Sensors() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const sensorsQuery = useQuery("sensors", makeFetchSensors(user.token));
	const queryClient = useQueryClient();

	if (sensorsQuery.isLoading) {
		return <LoadingSpinner message="Loading sensors" />;
	}

	if (sensorsQuery.isError) {
		return (
			<Alert severity="error">
				<AlertTitle>An error occured while loading sensors.</AlertTitle>
				{sensorsQuery.error + ""}
			</Alert>
		);
	}

	return (
		<Box p={2}>
			<List
				disablePadding
				sx={{
					display: "flex",
					flexDirection: "row",
					flexWrap: "wrap",
					gap: 2,
				}}>
				{Object.values(sensorsQuery.data.sensors).map((sensor) => (
					<ListItem key={sensor.id} disablePadding sx={{ flex: "0" }}>
						<SensorCard
							sensor={sensor}
							onDetailsClick={() => navigate(`./${sensor.id}`)}
						/>
					</ListItem>
				))}
			</List>

			<Tooltip title="Reload sensor list" placement="left">
				<Fab
					color="primary"
					onClick={() => queryClient.invalidateQueries("sensors")}
					sx={{
						position: "fixed",
						right: (theme) => theme.spacing(2),
						bottom: (theme) => theme.spacing(2),
					}}>
					<ReloadIcon />
				</Fab>
			</Tooltip>
		</Box>
	);
}
