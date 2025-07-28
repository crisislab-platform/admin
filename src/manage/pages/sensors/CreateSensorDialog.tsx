import {
	Alert,
	AlertTitle,
	Autocomplete,
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Link,
	Stack,
	TextField,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { makeCreateSensor, makeFetchSensors, makeFetchSensorTypes } from "../../../api";
import { Sensor, SensorID, SensorType, ConfigurableSensorType } from "../../../types";
import {
	defaultPosition,
	getNextSensorID,
	sensorMenuTypes,
} from "../../../utils";
import { CreateSensorTypeForm } from "../sensor-types/CreateSensorTypeForm";

import { OpenInNew, Settings } from "@mui/icons-material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { useSnackbar } from "notistack";
import { FormEvent, useState } from "react";
import useAuth from "../../../auth/useAuth";
import { SensorImage } from "../../../components/BasicSensorInfo";

export function CreateSensorDialog({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const { user } = useAuth();
	const [name, setName] = useState<string>("");
	const [contactEmail, setContactEmail] = useState<string>("");
	const [secondaryID, setSecondaryID] = useState<string>("");
	const [selectedType, setSelectedType] = useState<string>("Raspberry Shake 4D");
	const [location, setLocation] = useState<[number, number]>(defaultPosition);
	const [errors, setErrors] = useState<[string, string][]>([]);
	const [IPAddress, setIPAddress] = useState<string>();
	const [showCreateSensorType, setShowCreateSensorType] = useState(false);

	const { enqueueSnackbar } = useSnackbar();
	const queryClient = useQueryClient();
	const sensorsQuery = useQuery("sensors", makeFetchSensors(user?.token));
	const sensorTypesQuery = useQuery("sensor-types", makeFetchSensorTypes(user?.token));
	const mutation = useMutation(makeCreateSensor(user?.token), {
		onError: (error) => {
			enqueueSnackbar(`Failed to create new sensor: ${error}`, {
				variant: "error",
			});
		},
		onSuccess: (data) => {
			// Refetch sensors to get updated list
			queryClient.invalidateQueries("sensors");
			enqueueSnackbar("Sensor created", {
				variant: "success",
			});
		},
	});

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!sensorsQuery.isSuccess) return;
		setErrors([]);
		let newErrors: typeof errors = [];
		
		const validTypes = [
			...(sensorTypesQuery.data?.map(st => st.name) || []),
			...sensorMenuTypes
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
			const id = getNextSensorID(sensorsQuery.data.sensors);
			
			// Use type_fk for configurable sensor types, type for legacy
			const isConfigurableType = sensorTypesQuery.data?.some(st => st.name === selectedType);
			
			mutation.mutate({
				id,
				name,
				contact_email: contactEmail,
				type: isConfigurableType ? undefined : selectedType,
				type_fk: isConfigurableType ? selectedType : undefined,
				location,
				secondary_id: secondaryID,
				ip: IPAddress,
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
			<form onSubmit={onSubmit}>
				<DialogTitle>Create new sensor</DialogTitle>
				<DialogContent>
					<Stack gap={2}>
						<Link
							href="https://docs.google.com/document/d/1l8SA2pNLpueWjAy0l3gStlXXv-Tw3wwl3vfgqVdrA8s/edit?usp=sharing"
							target="_blank"
							sx={{ display: "flex", alignItems: "center" }}>
							How to set up a sensor{"  "}
							<OpenInNew fontSize="small"  />
						</Link>
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

						<TextField
							value={name}
							onChange={(event) => setName(event.target.value)}
							margin="dense"
							id="sensor-name"
							name="sensor-name"
							label="Sensor name"
							type="text"
							placeholder="Steve Job's sensor"
							fullWidth
						/>
						<TextField
							value={contactEmail}
							onChange={(event) =>
								setContactEmail(event.target.value)
							}
							margin="dense"
							id="sensor-contact-email"
							name="sensor-contact-email"
							label="Contact email"
							type="email"
							placeholder="sensor-host@gmail.com"
							fullWidth
						/>
						<TextField
							InputLabelProps={{ shrink: true }}
							value={secondaryID}
							onChange={(event) =>
								setSecondaryID(event.target.value)
							}
							margin="dense"
							id="sensor-secondary-id"
							name="sensor-secondary-id"
							label="Station ID"
							type="text"
							placeholder="AM.R1234.00"
							fullWidth
							autoFocus
							required
						/>
						<Stack gap={1}>
							<Autocomplete
								options={[
									...(sensorTypesQuery.data?.map(st => st.name) || []),
									...sensorMenuTypes
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

						<TextField
							required
							value={IPAddress}
							onChange={(event) =>
								setIPAddress(event.target.value)
							}
							margin="dense"
							id="ip-textbox"
							name="ip-textbox"
							label="IP Address"
							type="text"
							fullWidth
							helperText="Use the ZeroTier IP"
						/>

						<Stack gap={1}>
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
									id="latitude-textbox"
									name="latitude-textbox"
									label="Latitude"
									type="number"
									fullWidth
									required
								/>
							</Stack>
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
								required
							/>

							{navigator.geolocation && (
								<Box>
									<Button
										startIcon={<MyLocationIcon />}
										onClick={getLocationOfDevice}
										variant="outlined">
										Use my location
									</Button>
								</Box>
							)}
						</Stack>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button type="submit">Create</Button>
					<Button
						onClick={onClose}
						disabled={!sensorsQuery.isSuccess}>
						Close
					</Button>
				</DialogActions>
			</form>
			
			<CreateSensorTypeForm
				open={showCreateSensorType}
				onClose={() => setShowCreateSensorType(false)}
				onCreate={() => {
					// Refetch sensor types to update the dropdown
					sensorTypesQuery.refetch();
				}}
			/>
		</Dialog>
	);
}
