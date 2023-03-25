import { Sensor, SensorID } from "../../../types";
import {
	Alert,
	AlertTitle,
	AppBar,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Paper,
	Slide,
	Stack,
	Toolbar,
	Tooltip,
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
import { ReactElement, Ref, forwardRef, useState } from "react";

import { makeDeleteSensor, makeFetchSensors } from "../../../api";
import { useMutation, useQuery, useQueryClient } from "react-query";

import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { LiveDataGraphs } from "../../../components";
import { TransitionProps } from "@mui/material/transitions";
import useAuth from "../../../auth/useAuth";
import { useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { EditSensorInfo } from "./EditSensorInfo";

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
	const sensorsQuery = useQuery("sensors", makeFetchSensors(user?.token));
	const { sensorID: rawSensorID } = useParams();

	const [editMode, setEditMode] = useState(false);
	const [deletionConfirmModalOpen, setDeletionConfirmModalOpen] =
		useState(false);
	const { enqueueSnackbar } = useSnackbar();
	const theme = useTheme();
	const onMobile = useMediaQuery(theme.breakpoints.down("md"));
	const navigateWithQuery = useNavigateWithQuery();

	const queryClient = useQueryClient();
	const mutation = useMutation(makeDeleteSensor(user?.token), {
		onMutate: async (sensorToDelete: Sensor) => {
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
				}) => {
					let newSensors = oldSensors;
					newSensors.sensors[sensorToDelete.id] = undefined;
					return newSensors;
				},
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
			enqueueSnackbar(`Failed to delete sensor: ${error}`, {
				variant: "error",
			});
		},
		onSuccess: () => {
			enqueueSnackbar(
				"Deleted sensor. Changes may take up to a minute to be reflected everywhere.",
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
			<Alert severity="error" sx={{ width: "100%" }}>
				<>
					<AlertTitle>Error loading sensor details.</AlertTitle>
					{sensorsQuery.error}
				</>
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
			<Alert severity="warning" sx={{ width: "100%" }}>
				<AlertTitle>No matching sensor found.</AlertTitle>
				If you copied the URL from somewhere, make sure that you didin't miss
				any characters.
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
		navigateWithQuery("/manage/sensors");
	}

	let layout = (
		<Stack sx={{ p: onMobile ? 2 : 0, minHeight: "100%" }}>
			{user && !!user.roles.find((role) => role.raw === "sensors:write") && (
				<Stack
					justifyContent="flex-end"
					direction="row"
					gap={1}
					flexWrap="wrap"
					sx={{ mb: 2 }}
				>
					<Button
						variant="outlined"
						color="error"
						startIcon={<DeleteIcon />}
						onClick={() => setDeletionConfirmModalOpen(true)}
					>
						Delete sensor
					</Button>
					<Dialog
						fullWidth
						open={deletionConfirmModalOpen}
						onClose={onDeletionConfirmModalClose}
					>
						<DialogTitle>Confirm deletion</DialogTitle>
						<DialogContent>
							<Stack gap={1}>
								<Alert severity="info">
									<AlertTitle>
										Changes may take up to a minute to be reflected everywhere.
									</AlertTitle>
									If the deleted sensor reappears, don't worry. The stored data
									has been removed and will stop showing up soon.
								</Alert>
								<DialogContentText>
									Are you sure that you want to delete the sensor{" "}
									{activeSensor.id}? It will be gone forever with no way of
									recovering it.
								</DialogContentText>
							</Stack>
						</DialogContent>
						<DialogActions>
							<Button color="error" onClick={deleteSensor}>
								Delete
							</Button>
							<Button onClick={onDeletionConfirmModalClose}>Close</Button>
						</DialogActions>
					</Dialog>
					<Button
						variant="outlined"
						onClick={() => setEditMode(true)}
						startIcon={<EditIcon />}
					>
						Edit sensor details
					</Button>
				</Stack>
			)}
			<Stack alignItems="center" gap={2}>
				<Paper
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 0.1,
						p: 2,
						width: "100%",
					}}
					variant="outlined"
				>
					{activeSensor.name && (
						<Typography>Name: {activeSensor.name}</Typography>
					)}
					{activeSensor.contact_email && (
						<Typography>Contact: {activeSensor.contact_email}</Typography>
					)}
					<Typography>
						ID: <strong>{activeSensor.id}</strong>
					</Typography>

					{activeSensor.secondary_id && (
						<Typography>
							RS Station: <strong>{activeSensor.secondary_id}</strong>
						</Typography>
					)}
					<Typography>
						IP:{" "}
						{activeSensor.ip ? (
							<>
								{" "}
								<strong>{activeSensor.ip}</strong>
								{activeSensor.port && ":"}
							</>
						) : (
							activeSensor.port && activeSensor.port
						)}
					</Typography>
					<SensorStatusText online={activeSensor.online} addLabel />
					{activeSensor.type && (
						<Stack direction="row" gap={1} alignItems="center">
							Type:
							<SensorImage sensor={activeSensor} />
							<Typography>{activeSensor.type}</Typography>
						</Stack>
					)}
					<Typography>
						Has randomised public location:{" "}
						<strong>{activeSensor.publicLocation ? "Yes" : "No"}</strong>
					</Typography>
					<Stack direction="row" gap={1} alignItems="center">
						<Typography>
							Longitude:{" "}
							<strong>
								{activeSensor?.location?.coordinates?.[0] || "Unknown"}
							</strong>
						</Typography>
						<Typography>
							Latitude:{" "}
							<strong>
								{activeSensor?.location?.coordinates?.[1] || "Unknown"}
							</strong>
						</Typography>
						<Tooltip title="Copy coordinates">
							<IconButton
								onClick={async () => {
									try {
										await navigator.clipboard.writeText(
											`${
												activeSensor?.location?.coordinates?.[0] || "Unknown"
											}, ${
												activeSensor?.location?.coordinates?.[1] || "Unknown"
											}`,
										);
										enqueueSnackbar("Copied sensor coordinates.", {
											variant: "success",
										});
									} catch {
										enqueueSnackbar("Failed to copy sensor coordinates.", {
											variant: "error",
										});
									}
								}}
							>
								<ContentCopyIcon
									sx={{
										width: (theme) => theme.spacing(2.5),
										height: (theme) => theme.spacing(2.5),
									}}
								/>
							</IconButton>
						</Tooltip>
					</Stack>
					{!!activeSensor.elevation && (
						<Typography>
							Elevation: <strong>{activeSensor.elevation}</strong>
						</Typography>
					)}
					{!!(activeSensor.total_floors || activeSensor.on_floor) && (
						<Stack direction="row" gap={1} alignItems="center">
							<Typography>
								Building floors:{" "}
								<strong>{activeSensor.total_floors || "Unknown"}</strong>
							</Typography>
							<Typography>
								Sensor's floor:{" "}
								<strong>{activeSensor.on_floor || "Unknown"}</strong>
							</Typography>
						</Stack>
					)}

					{!activeSensor.online && <SensorSetupCommand sensor={activeSensor} />}
				</Paper>

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
						startIcon={<CloseIcon />}
					>
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
				TransitionComponent={SlideUpTransition}
			>
				<AppBar sx={{ position: "relative" }}>
					<Toolbar>
						<IconButton
							edge="start"
							color="inherit"
							onClick={onDialogCLose}
							aria-label="close"
						>
							<CloseIcon />
						</IconButton>
						<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
							{editMode ? "Editing sensor information" : "Sensor information"}
						</Typography>
					</Toolbar>
				</AppBar>
				{layout}
			</Dialog>
		);
	}

	return layout;
}
