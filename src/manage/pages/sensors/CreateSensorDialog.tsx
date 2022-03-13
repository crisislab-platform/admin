import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { Sensor, SensorID, SensorType } from "../../../types";
import { makeCreateSensor, makeFetchSensors } from "../../../api";
import { useMutation, useQuery, useQueryClient } from "react-query";

import MyLocationIcon from "@mui/icons-material/MyLocation";
import useAuth from "../../../auth/useAuth";
import { useSnackbar } from "notistack";
import { useState } from "react";

export function CreateSensorDialog({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const { user } = useAuth();
	const [name, setName] = useState<string>();
	const [type, setType] = useState<SensorType>("raspberry-shake");
	const [location, setLocation] = useState<[number, number]>([
		174.8, -41.325,
	]);
	const [id, setID] = useState<SensorID>(Number.MAX_SAFE_INTEGER);
	const [elevation, setElevation] = useState<number>();
	const [totalFloors, setTotalFloors] = useState<number>();
	const [onFloor, setOnFloor] = useState<number>();
	const { enqueueSnackbar } = useSnackbar();
	const queryClient = useQueryClient();
	const sensorsQuery = useQuery("sensors", makeFetchSensors(user.token));
	const mutation = useMutation(makeCreateSensor(user.token), {
		onMutate: async (newSensor) => {
			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries("sensors");

			// Snapshot the previous value
			const previousSensors = queryClient.getQueryData("sensors");

			// Optimistically update to the new value

			queryClient.setQueryData(
				"sensors",
				(oldSensors: Record<SensorID, Sensor>) => ({
					...oldSensors,
					[newSensor.id]: newSensor,
				}),
			);

			// Return a context object with the snapshotted value
			return { previousSensors };
		},
		onError: (error, newSensor, context) => {
			queryClient.setQueryData(
				"sensors",
				(context as { previousSensors: Sensor[] }).previousSensors,
			);
			enqueueSnackbar(
				`Failed to create new sensor (id: ${id}): ${error}`,
				{
					variant: "error",
				},
			);
		},
		onSuccess: () => {
			enqueueSnackbar(`Created new sensor (id: ${id}).`, {
				variant: "success",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries("sensors");
		},
	});

	function onSubmit() {
		mutation.mutate({
			id,
			name,
			type,
			elevation,
			longitude: location[0],
			latitude: location[1],
			total_floors: totalFloors,
			on_floor: onFloor,
		});
		onClose();
	}

	function getLocationOfDevice() {
		function onSuccess(position) {
			const latitude = position.coords.latitude;
			const longitude = position.coords.longitude;
			setLocation([longitude, latitude]);
		}
		function onError() {
			enqueueSnackbar("Unable to find your location", {
				variant: "error",
			});
		}
		if (!navigator.geolocation) {
			enqueueSnackbar("Geolocation is not supported by your browser", {
				variant: "warning",
			});
		} else {
			navigator.geolocation.getCurrentPosition(onSuccess, onError);
		}
	}

	return (
		<Dialog open={open} onClose={onClose} fullWidth>
			<DialogTitle>Create new sensor</DialogTitle>
			<DialogContent>
				<Stack gap={2}>
					<Stack gap={1}>
						<Typography variant="subtitle1">
							General information
						</Typography>
						<TextField
							value={name}
							onChange={(event) => setName(event.target.value)}
							autoFocus
							margin="dense"
							id="name"
							label="Sensor name"
							type="text"
							fullWidth
							variant="standard"
						/>
						<FormControl fullWidth variant="standard" required>
							<InputLabel id="sensor-type-select-label">
								Sensor type
							</InputLabel>
							<Select
								labelId="sensor-type-select-label"
								id="sensor-type-select"
								value={type}
								label="Age"
								onChange={(event) =>
									setType(event.target.value as SensorType)
								}>
								<MenuItem value="raspberry-shake">
									Raspberry shake
								</MenuItem>
								<MenuItem value="android">
									Android phone
								</MenuItem>
							</Select>
						</FormControl>
					</Stack>
					<Divider />
					<Stack gap={1}>
						<Typography variant="subtitle1">Position</Typography>
						{navigator.geolocation && (
							<Box>
								<Button
									startIcon={<MyLocationIcon />}
									variant="outlined"
									onClick={getLocationOfDevice}>
									Use my location
								</Button>
							</Box>
						)}
						<Stack direction="row" gap={1}>
							<TextField
								value={location[0]}
								onChange={(event) =>
									setLocation((oldLocation) => [
										Number(event.target.value),
										oldLocation[1],
									])
								}
								margin="dense"
								id="name"
								label="Longitude"
								type="number"
								fullWidth
								variant="outlined"
								required
							/>
							<TextField
								value={location[1]}
								onChange={(event) =>
									setLocation((oldLocation) => [
										oldLocation[0],
										Number(event.target.value),
									])
								}
								margin="dense"
								id="name"
								label="Latitude"
								type="number"
								fullWidth
								variant="outlined"
								required
							/>
						</Stack>
					</Stack>
					<Divider />
					<Stack gap={1}>
						<Typography variant="subtitle1">
							Extra location information
						</Typography>
						<TextField
							value={elevation}
							onChange={(event) =>
								setElevation(Number(event.target.value))
							}
							margin="dense"
							id="name"
							label="Elevation (meters above sea level)"
							type="number"
							fullWidth
							variant="outlined"
						/>
						<TextField
							value={onFloor}
							onChange={(event) =>
								setOnFloor(Number(event.target.value))
							}
							margin="dense"
							id="name"
							label="Floor of building that sensor is on (basement is level 0)"
							type="number"
							fullWidth
							variant="outlined"
						/>
						<TextField
							value={totalFloors}
							onChange={(event) =>
								setTotalFloors(Number(event.target.value))
							}
							margin="dense"
							id="name"
							label="Total number of floors in building (excluding basement)"
							type="number"
							fullWidth
							variant="outlined"
						/>
					</Stack>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button onClick={onSubmit}>Create</Button>
			</DialogActions>
		</Dialog>
	);
}
