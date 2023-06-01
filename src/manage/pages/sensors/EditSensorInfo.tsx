import { Sensor, SensorID, SensorType } from "../../../types";
import {
	Alert,
	AlertTitle,
	Checkbox,
	Box,
	Button,
	FormControl,
	FormControlLabel,
	InputLabel,
	Link,
	MenuItem,
	Select,
	Stack,
	Switch,
	TextField,
	Tooltip,
	Typography,
	ToggleButtonGroup,
	ToggleButton,
	FormLabel,
} from "@mui/material";

import { useEffect, useState } from "react";
import { defaultPosition, sensorMenuTypes } from "../../../utils";
import { makeEditSensor, makeFetchSensors } from "../../../api";
import { useMutation, useQuery, useQueryClient } from "react-query";

import MyLocationIcon from "@mui/icons-material/MyLocation";
import SaveIcon from "@mui/icons-material/Save";
import useAuth from "../../../auth/useAuth";
import { useSnackbar } from "notistack";

export function EditSensorInfo({
	exitEditMode,
	activeSensor,
}: {
	exitEditMode: () => void;
	activeSensor: Sensor;
}) {
	const { user } = useAuth();
	const [name, setName] = useState<string>(
		activeSensor.name ? activeSensor.name : "",
	);
	const [contactEmail, setContactEmail] = useState<string>(
		activeSensor.contact_email ? activeSensor.contact_email : "",
	);
	const [secondaryID, setSecondaryID] = useState<string>(
		activeSensor.secondary_id ? activeSensor.secondary_id : "",
	);
	const [menuType, setMenuType] = useState<SensorType>(
		sensorMenuTypes.includes(activeSensor.type) ? activeSensor.type : "__other",
	);
	const [otherType, setOtherType] = useState<string>(
		sensorMenuTypes.includes(activeSensor.type) ? "" : activeSensor.type,
	);
	const [enableLocation, setEnableLocation] = useState(false);
	const [location, setLocation] = useState<[number, number]>([
		activeSensor?.location?.coordinates?.[0] || defaultPosition[0],
		activeSensor?.location?.coordinates?.[1] || defaultPosition[1],
	]);
	const [elevation, setElevation] = useState<number>(
		activeSensor.elevation ? activeSensor.elevation : 0,
	);
	const [totalFloors, setTotalFloors] = useState<number>(
		activeSensor.total_floors ? activeSensor.total_floors : 0,
	);
	const [onFloor, setOnFloor] = useState<number>(
		activeSensor.on_floor ? activeSensor.on_floor : 0,
	);
	const [errors, setErrors] = useState<[string, string][]>([]);
	const [IPAddress, setIPAddress] = useState<string>("");
	const [port, setPort] = useState<number | undefined>(undefined);
	const [online, setOnline] = useState<boolean | undefined>(undefined);

	const { enqueueSnackbar } = useSnackbar();
	const queryClient = useQueryClient();
	const sensorsQuery = useQuery("sensors", makeFetchSensors(user?.token));

	const mutation = useMutation(makeEditSensor(user?.token), {
		onMutate: async (newSensor) => {
			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries("sensors");

			// Snapshot the previous value
			const previousSensors = queryClient.getQueryData("sensors");

			// Optimistically update to the new value
			queryClient.setQueryData(
				"sensors",
				(oldSensors: {
					sensors: Record<SensorID, Sensor>;
					timestamp: number;
				}) => ({
					...oldSensors,
					sensors: {
						...oldSensors.sensors,
						[newSensor.id]: newSensor,
					},
				}),
			);

			// Return a context object with the snapshotted value
			return { previousSensors };
		},
		onError: (error, newSensor, context) => {
			queryClient.setQueryData(
				"sensors",
				(
					context as {
						previousSensors: {
							sensors: Record<SensorID, Sensor>;
							timestamp: number;
						};
					}
				).previousSensors,
			);
			enqueueSnackbar(`Failed to modify sensor: ${error}`, {
				variant: "error",
			});
		},
		onSuccess: () => {
			enqueueSnackbar(
				"Updated sensor. Changes may take up to a minute to be reflected everywhere.",
				{
					variant: "success",
				},
			);
		},
	});

	useEffect(() => {
		setName(activeSensor.name ? activeSensor.name : "");
		setContactEmail(
			activeSensor.contact_email ? activeSensor.contact_email : "",
		);
		setSecondaryID(activeSensor.secondary_id ? activeSensor.secondary_id : "");
		setMenuType(
			sensorMenuTypes.includes(activeSensor.type)
				? activeSensor.type
				: "__other",
		);
		setOtherType(
			sensorMenuTypes.includes(activeSensor.type) ? "" : activeSensor.type,
		);
		setLocation([
			activeSensor?.location?.coordinates?.[0] || defaultPosition[0],
			activeSensor?.location?.coordinates?.[1] || defaultPosition[1],
		]);
		setElevation(activeSensor.elevation ? activeSensor.elevation : 0);
		setTotalFloors(activeSensor.total_floors ? activeSensor.total_floors : 0);
		setOnFloor(activeSensor.on_floor ? activeSensor.on_floor : 0);
		setIPAddress(activeSensor.ip);
		setPort(activeSensor.port ? activeSensor.port : null);
		setOnline(activeSensor.online);
	}, [activeSensor]);

	function onSubmit() {
		if (!sensorsQuery.isSuccess) return;
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
		if (newErrors.length > 0) {
			setErrors(newErrors);
		} else {
			mutation.mutate({
				id: activeSensor.id,
				name,
				type,
				elevation,
				location: enableLocation
					? {
							type: "Point",
							coordinates: location,
					  }
					: undefined,
				total_floors: totalFloors,
				on_floor: onFloor,
				secondary_id: secondaryID,
				port,
				ip: IPAddress,
				online,
				contact_email: contactEmail
			});

			exitEditMode();
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
		<Stack gap={1}>
			<Typography>
				ID: <strong>{activeSensor.id}</strong>
			</Typography>
			<Alert severity="info">
				<AlertTitle>
					Changes may take up to a minute to be reflected everywhere.
				</AlertTitle>
				If the updated account information disappears, don't worry. The data is
				stored and will show up soon.
			</Alert>
			{errors.length > 0 && (
				<Stack gap={1}>
					{errors.map((error) => (
						<Alert severity="error">
							<AlertTitle>{error[0]}</AlertTitle>
							{error[1]}
						</Alert>
					))}
				</Stack>
			)}
			<Stack>
				<FormLabel htmlFor="edit-connection-status">
					Connection status
				</FormLabel>
				<ToggleButtonGroup
					id="edit-connection-status"
					value={online}
					exclusive
					onChange={(event, value) => {
						/**
						 * Clicking it while selected 'de-toggles' the value by trying to set it to null,
						 * so we just ignore it if it's null.
						 */
						if (value !== null) {
							setOnline(value);
						}
					}}
					aria-label="Connection status"
				>
					<ToggleButton value={true}>Online</ToggleButton>
					<ToggleButton value={false}>Offline</ToggleButton>
				</ToggleButtonGroup>
			</Stack>
			<Stack gap={1}>
				<Typography variant="subtitle1">General information</Typography>
				<TextField
					InputLabelProps={{ shrink: true }}
					value={name}
					onChange={(event) => setName(event.target.value)}
					autoFocus
					margin="dense"
					id="edit-sensor-name"
					name="edit-sensor-name"
					label="Sensor name"
					type="text"
					fullWidth
					variant="standard"
				/>
				<TextField
					value={contactEmail}
					onChange={(event) => setContactEmail(event.target.value)}
					margin="dense"
					id="edit-sensor-contact-email"
					name="edit-sensor-contact-email"
					label="Contact email"
					type="email"
					fullWidth
					variant="standard"
				/>
				<TextField
					InputLabelProps={{ shrink: true }}
					value={secondaryID}
					onChange={(event) => setSecondaryID(event.target.value)}
					margin="dense"
					id="edit-sensor-secondary-id"
					name="edit-sensor-secondary-id"
					label="Secondary ID"
					type="text"
					fullWidth
					variant="standard"
					helperText="This is just for reference. Use the autogenerated ID for queries."
				/>
				<FormControl fullWidth variant="standard" required>
					<InputLabel id="edit-sensor-type-select-label" shrink>
						Sensor type
					</InputLabel>
					<Select
						labelId="edit-sensor-type-select-label"
						id="edit-sensor-type-select"
						value={menuType}
						label="Age"
						onChange={(event) => setMenuType(event.target.value as SensorType)}
					>
						{sensorMenuTypes.map((type) => (
							<MenuItem value={type} key={type}>
								{type}
							</MenuItem>
						))}
						<MenuItem value="__other">Other</MenuItem>
					</Select>
				</FormControl>
				{menuType === "__other" && (
					<TextField
						InputLabelProps={{ shrink: true }}
						value={otherType}
						onChange={(event) => setOtherType(event.target.value)}
						margin="dense"
						id="edit-other-type-text-field"
						name="edit-other-type"
						label="Custom sensor type"
						type="text"
						fullWidth
						variant="standard"
						required
					/>
				)}
			</Stack>

			<Typography variant="subtitle1">Network</Typography>
			<Stack direction="row" gap={1}>
				<TextField
					value={IPAddress}
					onChange={(event) => setIPAddress(event.target.value)}
					margin="dense"
					id="edit-ip-textbox"
					name="edit-ip-textbox"
					label="IP Address"
					type="text"
					fullWidth
					variant="outlined"
				/>
				<TextField
					value={port}
					onChange={(event) => {
						try {
							setPort(
								event.target.value ? Number(event.target.value) : undefined,
							);
						} catch (e) {
							setPort(undefined);
						}
					}}
					margin="dense"
					id="edit-port-textbox"
					name="edit-port-textbox"
					label="Port"
					type="number"
					variant="outlined"
				/>
			</Stack>
			<Stack gap={1}>
				<Typography variant="subtitle1">Location</Typography>
				<TextField
					InputLabelProps={{ shrink: true }}
					value={elevation}
					onChange={(event) =>
						setElevation(
							event.target.value ? Number(event.target.value) : undefined,
						)
					}
					margin="dense"
					id="edit-elevation-textbox"
					name="edit-elevation"
					label="Elevation (meters above sea level)"
					type="text"
					inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
					fullWidth
					variant="outlined"
				/>
				<TextField
					InputLabelProps={{ shrink: true }}
					value={onFloor}
					onChange={(event) =>
						setOnFloor(
							event.target.value ? Number(event.target.value) : undefined,
						)
					}
					margin="dense"
					id="edit-on-floor-textbox"
					name="edit-on-floor"
					label="Floor of building that sensor is on (basement is level 0)"
					type="text"
					inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
					fullWidth
					variant="outlined"
				/>
				<TextField
					InputLabelProps={{ shrink: true }}
					value={totalFloors}
					onChange={(event) =>
						setTotalFloors(
							event.target.value ? Number(event.target.value) : undefined,
						)
					}
					margin="dense"
					id="edit-total-floors-textbox"
					name="edit-total-floors"
					label="Total number of floors in building (excluding basement)"
					type="text"
					inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
					fullWidth
					variant="outlined"
				/>
				<FormControlLabel
					control={
						<Switch
							checked={enableLocation}
							onChange={(event) => setEnableLocation(event.target.checked)}
						/>
					}
					label="Enable manual position"
				/>
				{enableLocation && (
					<>
						<Typography variant="body1">
							The position of the sensor will be automatically determined using
							the{" "}
							<Link href="https://en.wikipedia.org/wiki/Wi-Fi_positioning_system">
								Wi-Fi positioning system
							</Link>{" "}
							which is usually more accurate than the location that your brower
							can work out. If the sensor will be in a location without many
							nearby Wi-Fi networks, or only a few very new networks (which may
							not have been mapped yet), you can manually set the position.
						</Typography>
						{navigator.geolocation && (
							<Box>
								<Button
									startIcon={<MyLocationIcon />}
									variant="outlined"
									onClick={getLocationOfDevice}
								>
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
								id="edit-longitude-textbox"
								name="edit-longitude-textbox"
								label="Longitude"
								type="text"
								inputProps={{
									inputMode: "numeric",
									pattern: "[0-9]*",
								}}
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
								id="edit-latitude-textbox"
								name="edit-latitude-textbox"
								label="Latitude"
								type="text"
								inputProps={{
									inputMode: "numeric",
									pattern: "[0-9]*",
								}}
								fullWidth
								variant="outlined"
								required
							/>
						</Stack>
					</>
				)}

				<Button
					sx={{ mb: 2, mt: 2, ml: "auto" }}
					variant="outlined"
					onClick={onSubmit}
					startIcon={<SaveIcon />}
				>
					Save changes
				</Button>
			</Stack>
		</Stack>
	);
}
