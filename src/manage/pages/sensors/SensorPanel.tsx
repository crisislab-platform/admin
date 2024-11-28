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
	Link,
	Paper,
	Slide,
	Stack,
	Toolbar,
	Tooltip,
	Typography,
} from "@mui/material";
import {
	LoadingSpinner,
	SensorImage,
	SensorStatusText,
	useNavigateWithQuery,
} from "../../../components";
import { ReactElement, Ref, forwardRef, useMemo, useState } from "react";

import { makeDeleteSensor, makeFetchSensors } from "../../../api";
import { useMutation, useQuery, useQueryClient } from "react-query";

import FileDownloadIcon from "@mui/icons-material/FileDownload";
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
import { mapURL, useOnMobile, userHasPermission } from "../../../utils";

const listFormatter = new Intl.ListFormat("en");

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
	const onMobile = useOnMobile();
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
				(sensors: {
					sensors: Record<SensorID, Sensor>;
					timestamp: number;
				}) => {
					delete sensors.sensors[sensorToDelete.id];
					return sensors;
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
			enqueueSnackbar("Sensor deleted");
		},
	});

	const sensorID: SensorID | null = useMemo(() => {
		try {
			const id = Number(rawSensorID);
			return id;
		} catch (err) {
			console.warn("Error parsing sensor ID", err);
		}
		return null;
	}, [rawSensorID]);

	const activeSensor: Sensor | null = useMemo(() => {
		if (!sensorID || !sensorsQuery.data) return null;

		return sensorsQuery.data.sensors[sensorID] ?? null;
	}, [sensorID, sensorsQuery.data]);

	const duplicateIPs = useMemo(() => {
		if (!sensorsQuery?.data?.sensors) return [];
		if (!activeSensor) return [];
		if (!activeSensor.ip) return [];
		const dupes = Object.values(sensorsQuery.data.sensors).filter(
			(s) => s.ip === activeSensor.ip && s.id !== activeSensor.id,
		);
		return dupes;
	}, [sensorsQuery.data, activeSensor]);

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

	function exitEditMode() {
		setEditMode(false);
	}

	function onDeletionConfirmModalClose() {
		setDeletionConfirmModalOpen(false);
	}

	function deleteSensor() {
		if (!activeSensor) return;
		mutation.mutate(activeSensor);
		onDeletionConfirmModalClose();
	}

	function onDialogCLose() {
		navigateWithQuery("/manage/sensors");
	}

	let layout = !activeSensor ? (
		<Alert severity="error" sx={{ width: "100%" }}>
			<AlertTitle>No matching sensor found.</AlertTitle>
			If you copied the URL from somewhere, make sure that you didn't miss
			any characters.
		</Alert>
	) : (
		<Stack sx={{ p: onMobile ? 2 : 0, minHeight: "100%" }}>
			<Stack
				justifyContent="flex-end"
				direction="row"
				gap={1}
				flexWrap="wrap"
				sx={{ mb: 2 }}>
				{userHasPermission(user, "sensor-data:bulk-export") && (
					<Button
						variant="outlined"
						onClick={() =>
							navigateWithQuery(
								`/manage/data-export?export_data_sensor_id=${sensorID}`,
								{
									replace: false,
								},
							)
						}
						startIcon={<FileDownloadIcon />}>
						Export data
					</Button>
				)}
				{userHasPermission(user, "sensors:write") && (
					<>
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
									<DialogContentText>
										Are you sure that you want to delete the
										sensor {activeSensor.id}? It will be
										gone forever with no way of recovering
										it.
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
					</>
				)}
			</Stack>

			<Stack alignItems="center" gap={2}>
				{(!user || !userHasPermission(user, "sensors:read")) && (
					<Alert severity="info" sx={{ width: "100%" }}>
						<AlertTitle>
							{!user
								? "You're not logged in"
								: "You have limited permissions"}
						</AlertTitle>
						Lots of the fields here will look blank because you
						don't have permission to see them. Make sure you're
						logged in with an account that has permission to view
						sensor details.
					</Alert>
				)}
				{duplicateIPs.length > 0 && (
					<Alert severity="error" sx={{ width: "100%" }}>
						<AlertTitle>Duplicate IP!</AlertTitle>
						This sensor has the same IP address set as{" "}
						{listFormatter.format(
							duplicateIPs.map((s) => `#${s.id}`),
						)}
						!
						<br />
						This means that weird glitches will occur, e.g. it
						showing as online, but the graph view saying it's
						offline.
					</Alert>
				)}

				<Paper
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 0.1,
						p: 2,
						width: "100%",
					}}
					variant="outlined">
					<Link
						href={`${mapURL}/sensor/${activeSensor.id}`}
						sx={{ "&::after": { content: `" →"` } }}>
						View on shakemap
					</Link>
					<Typography>
						Name: {activeSensor.name && activeSensor.name}
					</Typography>

					<Typography>
						Contact email:{" "}
						{activeSensor.contact_email &&
							activeSensor.contact_email}
					</Typography>

					<Typography>
						ID: <strong>{activeSensor.id}</strong>
					</Typography>

					<Typography>
						RS Station:{" "}
						<strong>
							{activeSensor.secondary_id &&
								activeSensor.secondary_id}
						</strong>
					</Typography>

					{activeSensor.ip ? (
						<Typography>
							IP: <strong>{activeSensor.ip}</strong>
						</Typography>
					) : (
						<Alert severity="warning">
							<AlertTitle>No IP address set!</AlertTitle>
							This means this sensor will always show as offline
							and it's data won't be received, even if it seems
							fine in rs.local.
						</Alert>
					)}

					<SensorStatusText online={activeSensor.online} addLabel />

					<Stack direction="row" gap={1} alignItems="center">
						Type:
						<SensorImage sensor={activeSensor} />
						{activeSensor.type && (
							<Typography>{activeSensor.type}</Typography>
						)}
					</Stack>

					<Stack direction="row" gap={1} alignItems="center">
						<Typography>
							Latitude:{" "}
							<strong>
								{activeSensor?.location?.[1] || "Unknown"}
							</strong>
						</Typography>
						<Typography>
							Longitude:{" "}
							<strong>
								{activeSensor?.location?.[0] || "Unknown"}
							</strong>
						</Typography>

						<Tooltip title="Copy coordinates">
							<IconButton
								onClick={async () => {
									try {
										await navigator.clipboard.writeText(
											`${
												activeSensor?.location?.[0] ||
												"Unknown"
											}, ${
												activeSensor?.location?.[1] ||
												"Unknown"
											}`,
										);
										enqueueSnackbar(
											"Copied sensor coordinates.",
											{
												variant: "success",
											},
										);
									} catch {
										enqueueSnackbar(
											"Failed to copy sensor coordinates.",
											{
												variant: "error",
											},
										);
									}
								}}>
								<ContentCopyIcon
									sx={{
										width: (theme) => theme.spacing(2.5),
										height: (theme) => theme.spacing(2.5),
									}}
								/>
							</IconButton>
						</Tooltip>
					</Stack>
				</Paper>
				<Paper variant="outlined" sx={{ width: "100%", p: 1 }}>
					{sensorID && (
						<LiveDataGraphs
							sensorID={sensorID}
							height={600}
							extraFlags={{
								"show-raw-channel-names": "yes",
							}}
						/>
					)}
				</Paper>
			</Stack>
		</Stack>
	);
	if (activeSensor && editMode) {
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
