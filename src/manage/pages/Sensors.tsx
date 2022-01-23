import {
	BasicSensorInfo,
	LoadingSpinner,
	MobileDialog,
	OpenInMapButton,
	SensorCard,
	generateSensorCardTitle,
	useUser,
} from "../../components";
import {
	Box,
	Fab,
	List,
	ListItem,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";

import ReloadIcon from "@mui/icons-material/Refresh";
import { Sensor } from "../../types";
import { sensorsAPIBase } from "../../utils";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

export function Sensors() {
	const user = useUser();
	const navigate = useNavigate();
	const theme = useTheme();
	const onMobile = useMediaQuery(theme.breakpoints.down("lg"));
	const [sensors, setSensors] = useState<null | Sensor[]>(null);
	const [selectedSensor, setSelectedSensor] = useState<null | Sensor>(null);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	async function loadSensorLocations() {
		const snack = enqueueSnackbar("Loading sensor locations...", {
			variant: "info",
			persist: true,
		});
		try {
			const res = await fetch(`${sensorsAPIBase}/sensors`);
			const data = await res.json();
			console.log(data);

			closeSnackbar(snack);
			enqueueSnackbar("Loaded sensor locations!", {
				variant: "success",
			});
			setSensors(data.sensors);
		} catch (e) {
			closeSnackbar(snack);
			console.log("Failed to load sensor locations. Error: ", e);
			enqueueSnackbar("Failed to load sensor locations!", {
				variant: "error",
			});
		}
	}
	useEffect(() => {
		loadSensorLocations();
	}, [enqueueSnackbar, closeSnackbar, setSensors]);

	const sensorList = sensors ? (
		<List
			disablePadding
			sx={{
				display: "flex",
				flexDirection: "row",
				flexWrap: "wrap",
				gap: 2,
			}}>
			{sensors.map((sensor) => (
				<ListItem key={sensor.id} disablePadding sx={{ flex: "0" }}>
					<SensorCard
						sensor={sensor}
						onDetailsClick={() => navigate(`./${sensor.id}`)}
					/>
				</ListItem>
			))}
		</List>
	) : (
		<LoadingSpinner message="Loading sensors" />
	);

	const sensorInfo = selectedSensor ? (
		<>
			<Box sx={{ mb: 1 }}>
				<OpenInMapButton sensor={selectedSensor} />
			</Box>
			<BasicSensorInfo sensor={selectedSensor} />
		</>
	) : (
		<Typography>
			Press "view details" on a sensor to view information about it.
		</Typography>
	);

	return onMobile ? (
		<>
			{sensorList}
			<MobileDialog
				open={!!selectedSensor}
				onClose={() => setSelectedSensor(null)}
				title={generateSensorCardTitle(selectedSensor)}>
				{sensorInfo}
			</MobileDialog>
		</>
	) : (
		<>
			{sensorList}
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
