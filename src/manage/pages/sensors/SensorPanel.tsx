import { Account, Role, Sensor, SensorID, SensorType } from "../../../types";
import {
	Alert,
	AlertTitle,
	AppBar,
	Avatar,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	FormControl,
	FormControlLabel,
	IconButton,
	InputLabel,
	Link,
	MenuItem,
	Select,
	Slide,
	Stack,
	Switch,
	TextField,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import {
	LoadingSpinner,
	SensorImage,
	SensorSetupCommand,
	SensorStatusText,
	useNavigateWithQuery,
} from "../../../components";
import { ReactElement, Ref, forwardRef, useEffect, useState } from "react";
import { defaultPosition, sensorMenuTypes } from "../../../utils";
import {
	makeDeleteSensor,
	makeEditSensor,
	makeFetchSensors,
	makeGetSensorToken,
} from "../../../api";
import { useMutation, useQuery, useQueryClient } from "react-query";

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { LiveDataGraphs } from "../../../components";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SaveIcon from "@mui/icons-material/Save";
import { TransitionProps } from "@mui/material/transitions";
import useAuth from "../../../auth/useAuth";
import { useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

const SlideUpTransition = forwardRef(function Transition(
	props: TransitionProps & {
		children: ReactElement;
	},
	ref: Ref<unknown>,
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

export function SensorPanel() {
	const { user } = useAuth();
	const sensorsQuery = useQuery(
		"sensors",
		makeFetchSensors(user && user.token),
	);
	const { sensorID: rawSensorID } = useParams();

	const [editMode, setEditMode] = useState(false);
	const [deletionConfirmModalOpen, setDeletionConfirmModalOpen] =
		useState(false);
	const { enqueueSnackbar } = useSnackbar();
	const theme = useTheme();
	const onMobile = useMediaQuery(theme.breakpoints.down("md"));
	const navigateWithQuery = useNavigateWithQuery();

	const queryClient = useQueryClient();
	const mutation = useMutation(makeDeleteSensor(user && user.token), {
		onMutate: async (sensorToDelete: Sensor) => {
			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries("sensors");

			// Snapshot the previous value
			const previousSensors = queryClient.getQueryData("sensors");

			// Optimistically update to the new value

			queryClient.setQueryData(
				"sensors",
				(oldSensors: Record<SensorID, Sensor>) => {
					delete oldSensors[sensorToDelete.id];
					console.log(sensorToDelete.id in oldSensors);
					return oldSensors;
				},
			);

			// Return a context object with the snapshotted value
			return { previousSensors };
		},
		onError: (error, newSensor, context) => {
			queryClient.setQueryData(
				"sensors",
				(context as { previousSensors: Sensor[] }).previousSensors,
			);
			enqueueSnackbar(`Failed to delete sensor: ${error}`, {
				variant: "error",
			});
		},
		onSuccess: () => {
			enqueueSnackbar(
				`Deleted sensor. Changes may take up to a minute to be reflected everywhere.`,
				{
					variant: "success",
				},
			);
		},
	});

	if (sensorsQuery.isLoading) {
		return <LoadingSpinner message="Loading sensor details" />;
	}
	if (sensorsQuery.isError) {
		return (
			<Alert severity="error">
				<AlertTitle>Error loading sensor details.</AlertTitle>
				{sensorsQuery.error}
			</Alert>
		);
	}
	let sensorID: SensorID | null = null;
	let activeSensor: Sensor;
	try {
		sensorID = Number(rawSensorID);
		activeSensor = sensorsQuery.data.sensors[sensorID];
	} catch (error) {}

	if (!activeSensor) {
		return (
			<Alert severity="warning">
				<AlertTitle>No matching sensor found.</AlertTitle>
				If you copied the URL from somewhere, make sure that you didin't
				miss any characters.
			</Alert>
		);
	}

	function exitEditMode() {
		setEditMode(false);
	}

	function onDeletionConfirmModalClose() {
		setDeletionConfirmModalOpen(false);
	}

	function deleteSensor() {
		mutation.mutate(activeSensor);
		onDeletionConfirmModalClose();
	}

	function onDialogCLose() {
		navigateWithQuery("..");
	}

	let layout = (
		<Stack sx={{ p: onMobile ? 2 : 0, minHeight: "100%" }}>
			{user && !!user.roles.find((role) => role.raw === "sensors:write") && (
				<Stack
					justifyContent="flex-end"
					direction="row"
					gap={1}
					flexWrap="wrap"
					sx={{ mb: 2 }}>
					<Button
						variant="outlined"
						color="error"
						startIcon={<DeleteIcon />}
						onClick={() => setDeletionConfirmModalOpen(true)}>
						Delete sensor
					</Button>
					<Dialog
						fullWidth
						open={deletionConfirmModalOpen}
						onClose={onDeletionConfirmModalClose}>
						<DialogTitle>Confirm deletion</DialogTitle>
						<DialogContent>
							<Stack gap={1}>
								<Alert severity="info">
									<AlertTitle>
										Changes may take up to a minute to be
										reflected everywhere.
									</AlertTitle>
									If the deleted sensor reappears, don't
									worry. The stored data has been removed and
									will stop showing up soon.
								</Alert>
								<DialogContentText>
									Are you sure that you want to delete the
									sensor {activeSensor.id}? It will be gone
									forever with no way of recovering it.
								</DialogContentText>
							</Stack>
						</DialogContent>
						<DialogActions>
							<Button color="error" onClick={deleteSensor}>
								Delete
							</Button>
							<Button onClick={onDeletionConfirmModalClose}>
								Close
							</Button>
						</DialogActions>
					</Dialog>
					<Button
						variant="outlined"
						onClick={() => setEditMode(true)}
						startIcon={<EditIcon />}>
						Edit sensor details
					</Button>
				</Stack>
			)}
			<Stack alignItems="center" gap={2}>
				<Avatar sx={{ width: 160, height: 160 }}>
					<SensorImage size={120} sensor={activeSensor} />
				</Avatar>
				<Typography variant="h2">#{activeSensor.id}</Typography>
				{activeSensor.name && (
					<Typography variant="subtitle1">
						"{activeSensor.name}"
					</Typography>
				)}
				<SensorStatusText online={activeSensor.online} />
				<SensorSetupCommand sensor={activeSensor} />
				<LiveDataGraphs sensorID={sensorID} height={600} />
			</Stack>
		</Stack>
	);
	if (editMode) {
		layout = (
			<Stack sx={{ p: onMobile ? 2 : 0 }}>
				<Stack direction="row">
					<Button
						sx={{ mb: 2, ml: "auto" }}
						variant="outlined"
						color="warning"
						onClick={exitEditMode}
						startIcon={<CloseIcon />}>
						Stop editing (discard changes)
					</Button>
				</Stack>
				<EditSensorInfo
					exitEditMode={exitEditMode}
					activeSensor={activeSensor}
				/>
			</Stack>
		);
	}

	if (onMobile) {
		return (
			<Dialog
				fullScreen
				open
				onClose={onDialogCLose}
				TransitionComponent={SlideUpTransition}>
				<AppBar sx={{ position: "relative" }}>
					<Toolbar>
						<IconButton
							edge="start"
							color="inherit"
							onClick={onDialogCLose}
							aria-label="close">
							<CloseIcon />
						</IconButton>
						<Typography
							sx={{ ml: 2, flex: 1 }}
							variant="h6"
							component="div">
							{editMode
								? "Editing sensor information"
								: "Sensor information"}
						</Typography>
					</Toolbar>
				</AppBar>
				{layout}
			</Dialog>
		);
	}

	return layout;
}

function EditSensorInfo({
	exitEditMode,
	activeSensor,
}: {
	exitEditMode: () => void;
	activeSensor: Sensor;
}) {
	const { user } = useAuth();
	const [name, setName] = useState<string | undefined>(activeSensor.name);
	const [menuType, setMenuType] = useState<SensorType>(
		sensorMenuTypes.includes(activeSensor.type)
			? activeSensor.type
			: "__other",
	);
	const [otherType, setOtherType] = useState<string | undefined>(
		sensorMenuTypes.includes(activeSensor.type)
			? undefined
			: activeSensor.type,
	);
	const [enableLocation, setEnableLocation] = useState(false);
	const [location, setLocation] = useState<[number, number]>([
		activeSensor.longitude || defaultPosition[0],
		activeSensor.latitude || defaultPosition[1],
	]);
	const [elevation, setElevation] = useState<number | undefined>(
		activeSensor.elevation,
	);
	const [totalFloors, setTotalFloors] = useState<number | undefined>(
		activeSensor.total_floors,
	);
	const [onFloor, setOnFloor] = useState<number | undefined>(
		activeSensor.on_floor,
	);
	const [errors, setErrors] = useState<[string, string][]>([]);

	const { enqueueSnackbar } = useSnackbar();
	const queryClient = useQueryClient();
	const sensorsQuery = useQuery(
		"sensors",
		makeFetchSensors(user && user.token),
	);
	const mutation = useMutation(makeEditSensor(user && user.token), {
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
			enqueueSnackbar(`Failed to modify sensor: ${error}`, {
				variant: "error",
			});
		},
		onSuccess: () => {
			enqueueSnackbar(
				`Updated sensor. Changes may take up to a minute to be reflected everywhere.`,
				{
					variant: "success",
				},
			);
		},
	});

	useEffect(() => {
		setName(activeSensor.name);
		setMenuType(
			sensorMenuTypes.includes(activeSensor.type)
				? activeSensor.type
				: "__other",
		);
		setOtherType(
			sensorMenuTypes.includes(activeSensor.type)
				? undefined
				: activeSensor.type,
		);
		setLocation([
			activeSensor.longitude || defaultPosition[0],
			activeSensor.latitude || defaultPosition[1],
		]);
		setElevation(activeSensor.elevation);
		setTotalFloors(activeSensor.total_floors);
		setOnFloor(activeSensor.on_floor);
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
			let ids = Object.keys(sensorsQuery.data.sensors);
			ids.sort();
			const id = Number(ids[ids.length - 1]) + 1;
			console.log(id);
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
			<Alert severity="info">
				<AlertTitle>
					Changes may take up to a minute to be reflected everywhere.
				</AlertTitle>
				If the updated account information disappears, don't worry. The
				data is stored and will show up soon.
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
				<Typography variant="subtitle1">General information</Typography>
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
							setMenuType(event.target.value as SensorType)
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
						value={otherType}
						onChange={(event) => setOtherType(event.target.value)}
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
							The position of the sensor will be automatically
							determined using the{" "}
							<Link href="https://en.wikipedia.org/wiki/Wi-Fi_positioning_system">
								Wi-Fi positioning system
							</Link>{" "}
							which is usually more accurate than the location
							that your brower can work out. If the sensor will be
							in a location without many nearby Wi-Fi networks, or
							only a few very new networks (which may not have
							been mapped yet), you can manually set the position.
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
			<Stack direction="row">
				<Button
					sx={{ mb: 2, mt: 2, ml: "auto" }}
					variant="outlined"
					onClick={onSubmit}
					startIcon={<SaveIcon />}>
					Save changes
				</Button>
			</Stack>
		</Stack>
	);
}
