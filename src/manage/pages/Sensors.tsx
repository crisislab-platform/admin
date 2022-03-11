import { Fab, List, ListItem, Tooltip } from "@mui/material";
import { LoadingSpinner, SensorCard } from "../../components";
import { useEffect, useState } from "react";

import ReloadIcon from "@mui/icons-material/Refresh";
import { Sensor } from "../../types";
import { sensorsAPIBase } from "../../utils";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

export function Sensors() {
	const navigate = useNavigate();
	const [sensors, setSensors] = useState<null | Sensor[]>(null);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	async function loadSensorLocations() {
		const snack = enqueueSnackbar("Loading sensor locations...", {
			variant: "info",
			persist: true,
		});
		try {
			const res = await fetch(sensorsAPIBase);
			const data = await res.json();
			closeSnackbar(snack);
			enqueueSnackbar("Loaded sensor locations!", {
				variant: "success",
			});
			setSensors(data.sensors);
		} catch (e) {
			closeSnackbar(snack);
			console.info("Failed to load sensor locations. Error: ", e);
			enqueueSnackbar("Failed to load sensor locations!", {
				variant: "error",
			});
		}
	}
	useEffect(() => {
		loadSensorLocations();
	}, [enqueueSnackbar, closeSnackbar, setSensors]);

	return (
		<>
			{sensors ? (
				<List
					disablePadding
					sx={{
						display: "flex",
						flexDirection: "row",
						flexWrap: "wrap",
						gap: 2,
					}}>
					{sensors.map((sensor) => (
						<ListItem
							key={sensor.id}
							disablePadding
							sx={{ flex: "0" }}>
							<SensorCard
								sensor={sensor}
								onDetailsClick={() =>
									navigate(`./${sensor.id}`)
								}
							/>
						</ListItem>
					))}
				</List>
			) : (
				<LoadingSpinner message="Loading sensors" />
			)}
			<Tooltip title="Reload sensor list" placement="left">
				<Fab
					color="primary"
					onClick={() => {
						setSensors(null);
						loadSensorLocations();
					}}
					sx={{
						position: "fixed",
						right: (theme) => theme.spacing(2),
						bottom: (theme) => theme.spacing(2),
					}}>
					<ReloadIcon />
				</Fab>
			</Tooltip>
		</>
	);
}
