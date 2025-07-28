import {
	Alert,
	AlertTitle,
	AppBar,
	Button,
	Chip,
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
	Typography,
} from "@mui/material";
import { ReactElement, Ref, forwardRef, useMemo, useState } from "react";
import { TransitionProps } from "@mui/material/transitions";
import { ConfigurableSensorType } from "../../../types";
import { makeFetchSensorTypes, deleteSensorType, queryClient } from "../../../api";
import { useMutation, useQuery } from "react-query";
import {
	LoadingSpinner,
	useNavigateWithQuery,
} from "../../../components";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import useAuth from "../../../auth/useAuth";
import { useParams } from "react-router";
import { useSnackbar } from "notistack";
import { useOnMobile, userHasPermission } from "../../../utils";
import { EditSensorTypeForm } from "./EditSensorTypeForm";

const SlideUpTransition = forwardRef(function Transition(
	props: TransitionProps & {
		children: ReactElement;
	},
	ref: Ref<unknown>,
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

export function SensorTypePanel() {
	const { user } = useAuth();
	const sensorTypesQuery = useQuery("sensor-types", makeFetchSensorTypes(user?.token));
	const { sensorTypeName: rawSensorTypeName } = useParams();

	const [editMode, setEditMode] = useState(false);
	const [deletionConfirmModalOpen, setDeletionConfirmModalOpen] = useState(false);
	const { enqueueSnackbar } = useSnackbar();
	const onMobile = useOnMobile();
	const navigateWithQuery = useNavigateWithQuery();

	const mutation = useMutation(
		(name: string) => deleteSensorType(user!.token, name),
		{
			onSuccess: () => {
				queryClient.invalidateQueries("sensor-types");
				enqueueSnackbar("Sensor type deleted");
				navigateWithQuery("/manage/sensor-types");
			},
			onError: (error) => {
				enqueueSnackbar(`Failed to delete sensor type: ${error}`, {
					variant: "error",
				});
			},
		}
	);

	const sensorTypeName = rawSensorTypeName ? decodeURIComponent(rawSensorTypeName) : null;

	const activeSensorType: ConfigurableSensorType | null = useMemo(() => {
		if (!sensorTypeName || !sensorTypesQuery.data) return null;

		return sensorTypesQuery.data.find(st => st.name === sensorTypeName) ?? null;
	}, [sensorTypeName, sensorTypesQuery.data]);

	if (sensorTypesQuery.isLoading) {
		return <LoadingSpinner message="Loading sensor type details" />;
	}
	if (sensorTypesQuery.isError) {
		return (
			<Alert severity="error" sx={{ width: "100%" }}>
				<AlertTitle>Error loading sensor type details.</AlertTitle>
				{sensorTypesQuery.error + ""}
			</Alert>
		);
	}

	function exitEditMode() {
		setEditMode(false);
	}

	function onDeletionConfirmModalClose() {
		setDeletionConfirmModalOpen(false);
	}

	function deleteSensorTypeAction() {
		if (!activeSensorType) return;
		mutation.mutate(activeSensorType.name);
		onDeletionConfirmModalClose();
	}

	function onDialogClose() {
		navigateWithQuery("/manage/sensor-types");
	}

	let layout = !activeSensorType ? (
		<Alert severity="error" sx={{ width: "100%" }}>
			<AlertTitle>No matching sensor type found.</AlertTitle>
			If you copied the URL from somewhere, make sure that you didn't miss
			any characters.
		</Alert>
	) : (
		<Stack sx={{ p: onMobile ? 2 : 1, minHeight: "100%" }}>
			<Stack
				justifyContent="flex-end"
				direction="row"
				gap={1}
				flexWrap="wrap"
				sx={{ mb: 2 }}>
				{userHasPermission(user, "sensors:write") && (
					<>
						<Button
							variant="outlined"
							color="error"
							startIcon={<DeleteIcon />}
							onClick={() => setDeletionConfirmModalOpen(true)}>
							Delete sensor type
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
										sensor type "{activeSensorType.name}"? This action
										cannot be undone.
									</DialogContentText>
									<DialogContentText>
										Note: This will only work if no sensors are
										currently using this sensor type.
									</DialogContentText>
								</Stack>
							</DialogContent>
							<DialogActions>
								<Button color="error" onClick={deleteSensorTypeAction}>
									Delete
								</Button>
								<Button onClick={onDeletionConfirmModalClose}>
									Cancel
								</Button>
							</DialogActions>
						</Dialog>
						<Button
							variant="outlined"
							onClick={() => setEditMode(true)}
							startIcon={<EditIcon />}>
							Edit sensor type
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
						You may not be able to see all sensor type details.
					</Alert>
				)}

				<Paper
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 2,
						p: 2,
						width: "100%",
					}}
					variant="outlined">
					<Typography variant="h5" component="h2">
						{activeSensorType.name}
					</Typography>

					<Stack gap={1}>
						<Typography variant="h6">Channels</Typography>
						{!activeSensorType.channels || !Array.isArray(activeSensorType.channels) || activeSensorType.channels.length === 0 ? (
							<Alert severity="warning">
								<AlertTitle>No channels defined</AlertTitle>
								{!activeSensorType.channels || !Array.isArray(activeSensorType.channels) ? (
									"Channel data is malformed. This may indicate an outdated server."
								) : (
									"This sensor type has no channels configured."
								)}
							</Alert>
						) : (
							<Stack gap={1}>
								{activeSensorType.channels.map((channel, index) => {
									// Handle malformed channel data
									if (!channel || typeof channel !== 'object') {
										return (
											<Alert key={index} severity="error" size="small">
												Invalid channel data: {String(channel)}
											</Alert>
										);
									}
									
									const channelId = channel.id || 'unknown';
									const channelName = channel.name || 'Unknown Channel';
									
									return (
										<Stack
											key={channelId + index}
											direction="row"
											alignItems="center"
											gap={1}>
											<Chip
												label={channelId}
												size="small"
												variant="outlined"
												sx={{ fontFamily: "monospace", minWidth: "60px" }}
											/>
											<Typography>{channelName}</Typography>
										</Stack>
									);
								})}
							</Stack>
						)}
					</Stack>
				</Paper>
			</Stack>
		</Stack>
	);

	if (activeSensorType && editMode) {
		layout = (
			<Stack sx={{ p: onMobile ? 2 : 1 }}>
				<Stack direction="row">
					<Button
						sx={{ mb: 2, ml: "auto" }}
						variant="outlined"
						color="warning"
						onClick={exitEditMode}
						startIcon={<CloseIcon />}>
						Cancel editing
					</Button>
				</Stack>
				<EditSensorTypeForm
					exitEditMode={exitEditMode}
					activeSensorType={activeSensorType}
				/>
			</Stack>
		);
	}

	if (onMobile) {
		return (
			<Dialog
				fullScreen
				open
				onClose={onDialogClose}
				TransitionComponent={SlideUpTransition}>
				<AppBar sx={{ position: "relative" }}>
					<Toolbar>
						<IconButton
							edge="start"
							color="inherit"
							onClick={onDialogClose}
							aria-label="close">
							<CloseIcon />
						</IconButton>
						<Typography
							sx={{ ml: 2, flex: 1 }}
							variant="h6"
							component="div">
							{editMode
								? "Editing sensor type"
								: "Sensor type details"}
						</Typography>
					</Toolbar>
				</AppBar>
				{layout}
			</Dialog>
		);
	}

	return layout;
}