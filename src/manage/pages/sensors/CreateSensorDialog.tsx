import {
	Alert,
	AlertTitle,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	FormControlLabel,
	InputLabel,
	Link,
	MenuItem,
	Select,
	Stack,
	Switch,
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
	const [name, setName] = useState<string | undefined>();
	const [menuType, setMenuType] = useState<SensorType>("Raspberry Shake 4D");
	const [otherType, setOtherType] = useState<string | undefined>();
	const [enableLocation, setEnableLocation] = useState(false);
	const [location, setLocation] = useState<[number, number]>([
		174.8, -41.325,
	]);
	const [elevation, setElevation] = useState<number | undefined>();
	const [totalFloors, setTotalFloors] = useState<number | undefined>();
	const [onFloor, setOnFloor] = useState<number | undefined>();
	const [errors, setErrors] = useState<[string, string][]>([]);

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
			enqueueSnackbar(`Failed to create new sensor: ${error}`, {
				variant: "error",
			});
		},
		onSuccess: () => {
			enqueueSnackbar(
				`Created new sensor. Changes may take up to a minute to be reflected everywhere.`,
				{
					variant: "success",
				},
			);
		},
	});

	function onSubmit() {
		setErrors([]);
		let newErrors: typeof errors = [];
		let type = menuType;
		if (menuType === "__other") {
			type = otherType;
		}
		if (!type || type.length === 0) {
			newErrors.push([
				"Make sure to choose a sensor type.",
				"If you select 'other', make sure to enter a value in the text box provided.",
			]);
		}
		console.log(type, newErrors);
		if (newErrors.length > 0) {
			setErrors(newErrors);
		} else {
			let ids = Object.keys(sensorsQuery.data);
			ids.sort();
			const id = Number(ids.at(-1)) + 1;

			mutation.mutate({
				id,
				name,
				type,
				elevation,
				longitude: enableLocation ? location[0] : undefined,
				latitude: enableLocation ? location[1] : undefined,
				total_floors: totalFloors,
				on_floor: onFloor,
			});
			onClose();
		}
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
					<Alert severity="info">
						<AlertTitle>
							Changes may take up to a minute to be reflected
							everywhere.
						</AlertTitle>
						If the new sensor disappears, don't worry. The data is
						stored and will show up soon.
					</Alert>
					{errors.length > 0 && (
						<>
							<Stack gap={1}>
								{errors.map((error) => (
									<Alert severity="error">
										<AlertTitle>{error[0]}</AlertTitle>
										{error[1]}
									</Alert>
								))}
							</Stack>
							<Divider />
						</>
					)}
					<Stack gap={1}>
						<Typography variant="subtitle1">
							General information
						</Typography>
						<TextField
							value={name}
							onChange={(event) => setName(event.target.value)}
							autoFocus
							margin="dense"
							id="sensor-name"
							name="sensor-name"
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
								value={menuType}
								label="Age"
								onChange={(event) =>
									setMenuType(
										event.target.value as SensorType,
									)
								}>
								<MenuItem value="Raspberry Shake 4D">
									Raspberry Shake 4D
								</MenuItem>
								<MenuItem value="Raspberry Shake 3D">
									Raspberry Shake 3D
								</MenuItem>
								<MenuItem value="Raspberry Shake 1D">
									Raspberry Shake 1D
								</MenuItem>
								<MenuItem value="Raspberry Boom">
									Raspberry Boom
								</MenuItem>
								<MenuItem value="Raspberry Shake And Boom">
									Raspberry Shake And Boom
								</MenuItem>
								<MenuItem value="Android phone">
									Android phone
								</MenuItem>
								<MenuItem value="__other">Other</MenuItem>
							</Select>
						</FormControl>
						{menuType === "__other" && (
							<TextField
								value={otherType}
								onChange={(event) =>
									setOtherType(event.target.value)
								}
								margin="dense"
								id="other-type-text-field"
								name="other-type"
								label="Custom sensor type"
								type="text"
								fullWidth
								variant="standard"
								required
							/>
						)}
					</Stack>

					<Divider />
					<Stack gap={1}>
						<Typography variant="subtitle1">Location</Typography>
						<TextField
							value={elevation}
							onChange={(event) =>
								setElevation(
									event.target.value
										? Number(event.target.value)
										: undefined,
								)
							}
							margin="dense"
							id="elevation-textbox"
							name="elevation"
							label="Elevation (meters above sea level)"
							type="number"
							fullWidth
							variant="outlined"
						/>
						<TextField
							value={onFloor}
							onChange={(event) =>
								setOnFloor(
									event.target.value
										? Number(event.target.value)
										: undefined,
								)
							}
							margin="dense"
							id="on-floor-textbox"
							name="on-floor"
							label="Floor of building that sensor is on (basement is level 0)"
							type="number"
							fullWidth
							variant="outlined"
						/>
						<TextField
							value={totalFloors}
							onChange={(event) =>
								setTotalFloors(
									event.target.value
										? Number(event.target.value)
										: undefined,
								)
							}
							margin="dense"
							id="total-floors-textbox"
							name="total-floors"
							label="Total number of floors in building (excluding basement)"
							type="number"
							fullWidth
							variant="outlined"
						/>
						<FormControlLabel
							control={
								<Switch
									checked={enableLocation}
									onChange={(event) =>
										setEnableLocation(event.target.checked)
									}
								/>
							}
							label="Enable manual position"
						/>
						{enableLocation && (
							<>
								<Typography variant="body1">
									The position of the sensor will be
									automatically determined using the{" "}
									<Link href="https://en.wikipedia.org/wiki/Wi-Fi_positioning_system">
										Wi-Fi positioning system
									</Link>{" "}
									which is usually more accurate than the
									location that your brower can work out. If
									the sensor will be in a location without
									many nearby Wi-Fi networks, or only a few
									very new networks (which may not have been
									mapped yet), you can manually set the
									position.
								</Typography>
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
										id="longitude-textbox"
										name="longitude-textbox"
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
										id="latitude-textbox"
										name="latitude-textbox"
										label="Latitude"
										type="number"
										fullWidth
										variant="outlined"
										required
									/>
								</Stack>
							</>
						)}
					</Stack>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={onSubmit}>Create</Button>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
}
