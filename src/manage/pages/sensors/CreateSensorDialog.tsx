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
	InputLabel,
	Link,
	MenuItem,
	Select,
	Stack,
	TextField,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { makeCreateSensor, makeFetchSensors } from "../../../api";
import { Sensor, SensorID, SensorType } from "../../../types";
import {
	defaultPosition,
	getNextSensorID,
	sensorMenuTypes,
} from "../../../utils";

import { OpenInNew } from "@mui/icons-material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { useSnackbar } from "notistack";
import { FormEvent, useState } from "react";
import useAuth from "../../../auth/useAuth";

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
	const [menuType, setMenuType] = useState<SensorType>("Raspberry Shake 4D");
	const [otherType, setOtherType] = useState<string>("");
	const [location, setLocation] = useState<[number, number]>(defaultPosition);
	const [errors, setErrors] = useState<[string, string][]>([]);
	const [IPAddress, setIPAddress] = useState<string>();

	const { enqueueSnackbar } = useSnackbar();
	const queryClient = useQueryClient();
	const sensorsQuery = useQuery("sensors", makeFetchSensors(user?.token));
	const mutation = useMutation(makeCreateSensor(user?.token), {
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
			enqueueSnackbar(`Failed to create new sensor: ${error}`, {
				variant: "error",
			});
		},
		onSuccess: (data) => {
			// Update with the new ID from the server
			queryClient.setQueryData(
				"sensors",
				(oldSensors: {
					sensors: Record<SensorID, Sensor>;
					timestamp: number;
				}) => ({
					...oldSensors,
					sensors: {
						...oldSensors.sensors,
						[data.id]: data,
					},
				}),
			);
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
			const id = getNextSensorID(sensorsQuery.data.sensors);
			mutation.mutate({
				id,
				name,
				contact_email: contactEmail,
				type,
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
						<FormControl fullWidth required>
							<InputLabel
								id="edit-sensor-type-select-label"
								shrink>
								Sensor type
							</InputLabel>
							<Select
								labelId="edit-sensor-type-select-label"
								id="edit-sensor-type-select"
								value={menuType}
								label="Sensor type"
								onChange={(event) =>
									setMenuType(
										event.target.value as SensorType,
									)
								}>
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
								onChange={(event) =>
									setOtherType(event.target.value)
								}
								margin="dense"
								id="edit-other-type-text-field"
								name="edit-other-type"
								label="Custom sensor type"
								type="text"
								fullWidth
								required
							/>
						)}

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
		</Dialog>
	);
}
