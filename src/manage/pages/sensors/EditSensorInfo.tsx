import {
	Alert,
	AlertTitle,
	Autocomplete,
	Box,
	Button,
	Chip,
	FormLabel,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import { Sensor, } from "../../../types";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { makeEditSensor, makeFetchSensors, makeFetchSensorTypes } from "../../../api";
import { defaultPosition, sensorMenuBuiltinTypes } from "../../../utils";
import { CreateSensorTypeForm } from "../sensor-types/CreateSensorTypeForm";

import { Settings } from "@mui/icons-material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SaveIcon from "@mui/icons-material/Save";
import { useSnackbar } from "notistack";
import useAuth from "../../../auth/useAuth";
import { SensorImage } from "../../../components/BasicSensorInfo";

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
	const [selectedType, setSelectedType] = useState<string>(
		activeSensor.type || activeSensor.type_fk || "",
	);
	const [location, setLocation] = useState<[number, number]>([
		activeSensor?.location?.[0] || defaultPosition[0],
		activeSensor?.location?.[1] || defaultPosition[1],
	]);

	const [errors, setErrors] = useState<[string, string][]>([]);
	const [IPAddress, setIPAddress] = useState<string>("");
	const [port, setPort] = useState<number | undefined>(undefined);
	const [online, setOnline] = useState<boolean | undefined>(undefined);
	const [showCreateSensorType, setShowCreateSensorType] = useState(false);

	const { enqueueSnackbar } = useSnackbar();
	const queryClient = useQueryClient();
	const sensorsQuery = useQuery("sensors", makeFetchSensors(user?.token));
	const sensorTypesQuery = useQuery("sensor-types", makeFetchSensorTypes(user?.token));

	const mutation = useMutation(makeEditSensor(user?.token), {
		onError: (error) => {
			enqueueSnackbar(`Failed to modify sensor: ${error}`, {
				variant: "error",
			});
		},
		onSuccess: () => {
			// Refetch sensors to get updated list
			queryClient.invalidateQueries("sensors");
			enqueueSnackbar("Sensor updated");
		},
	});

	useEffect(() => {
		setName(activeSensor.name ? activeSensor.name : "");
		setContactEmail(
			activeSensor.contact_email ? activeSensor.contact_email : "",
		);
		setSecondaryID(
			activeSensor.secondary_id ? activeSensor.secondary_id : "",
		);
		setSelectedType(activeSensor.type || activeSensor.type_fk || "");
		setLocation([
			activeSensor?.location?.[0] || defaultPosition[0],
			activeSensor?.location?.[1] || defaultPosition[1],
		]);
		setIPAddress(activeSensor.ip ?? "");
		setOnline(activeSensor.online);
	}, [activeSensor]);

	function onSubmit() {
		if (!sensorsQuery.isSuccess) return;
		setErrors([]);
		let newErrors: typeof errors = [];
		
		const validTypes = [
			...(sensorTypesQuery.data?.map(st => st.name) || []),
			...sensorMenuBuiltinTypes
		];
		
		if (!selectedType || selectedType.length === 0) {
			newErrors.push([
				"Make sure to choose a sensor type.",
				"Please select a sensor type from the available options.",
			]);
		} else if (!validTypes.includes(selectedType)) {
			newErrors.push([
				"Invalid sensor type selected.",
				"Please choose from the available sensor types or create a new sensor type first.",
			]);
		}
		if (newErrors.length > 0) {
			setErrors(newErrors);
		} else {
			// Use type_fk for configurable sensor types, type for legacy
			const isConfigurableType = sensorTypesQuery.data?.some(st => st.name === selectedType);
			
			mutation.mutate({
				id: activeSensor.id,
				name,
				type: isConfigurableType ? undefined : selectedType,
				type_fk: isConfigurableType ? selectedType : undefined,
				location,
				secondary_id: secondaryID,
				ip: IPAddress,
				online,
				contact_email: contactEmail,
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
					aria-label="Connection status">
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
				<Stack gap={1}>
					<Autocomplete
						options={[
							...(sensorTypesQuery.data?.map(st => st.name) || []),
							...sensorMenuBuiltinTypes
						]}
						value={selectedType}
						onChange={(event, newValue) => {
							setSelectedType(newValue || "");
						}}
						renderOption={(props, option) => {
							const isConfigurable = sensorTypesQuery.data?.some(st => st.name === option);
							return (
								<Box component="li" {...props} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									{isConfigurable ? (
										<Settings fontSize="small" />
									) : (
										<SensorImage sensor={{ type: option } as any} size={20} />
									)}
									{option}
									{isConfigurable && <Chip label="Custom" size="small" variant="outlined" />}
								</Box>
							);
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Sensor type"
								variant="standard"
								required
								helperText="Select from available sensor types"
							/>
						)}
					/>
					<Button
						variant="outlined"
						size="small"
						onClick={() => setShowCreateSensorType(true)}
						sx={{ alignSelf: "flex-start" }}>
						Create New Sensor Type
					</Button>
				</Stack>
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
				{/* <TextField
					value={port}
					onChange={(event) => {
						try {
							setPort(
								event.target.value
									? Number(event.target.value)
									: undefined,
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
				/> */}
			</Stack>
			<Stack gap={1}>
				<Typography variant="subtitle1">Location</Typography>
				<Stack>
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
					</Stack>
				</Stack>

				<Button
					sx={{ mb: 2, mt: 2, ml: "auto" }}
					variant="outlined"
					onClick={onSubmit}
					startIcon={<SaveIcon />}>
					Save changes
				</Button>
			</Stack>
			
			<CreateSensorTypeForm
				open={showCreateSensorType}
				onClose={() => setShowCreateSensorType(false)}
				onCreate={() => {
					// Refetch sensor types to update the dropdown
					sensorTypesQuery.refetch();
				}}
			/>
		</Stack>
	);
}
