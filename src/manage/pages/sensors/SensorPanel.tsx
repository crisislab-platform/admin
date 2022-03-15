import { Account, Role, Sensor, SensorID } from "../../../types";
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
	Slide,
	Stack,
	TextField,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import {
	BasicSensorInfo,
	LoadingSpinner,
	useNavigateWithQuery,
} from "../../../components";
import { ReactElement, Ref, forwardRef, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { LiveDataGraphs } from "../../../components";
import SaveIcon from "@mui/icons-material/Save";
import { TransitionProps } from "@mui/material/transitions";
import { makeFetchSensors } from "../../../api";
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
	// const mutation = useMutation(makeDeleteSensor(user && user.token), {
	// 	onMutate: async (sensorToDelete: Sensor) => {
	// 		// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
	// 		await queryClient.cancelQueries("sensors");

	// 		// Snapshot the previous value
	// 		const previousSensors = queryClient.getQueryData("sensors");

	// 		// Optimistically update to the new value

	// 		queryClient.setQueryData(
	// 			"sensors",
	// 			(oldSensors: Record<SensorID, Sensor>) =>
	// 				Object.values(oldSensors).filter(
	// 					(sensor) => sensor.id !== sensorToDelete.id,
	// 				),
	// 		);

	// 		// Return a context object with the snapshotted value
	// 		return { previousSensors };
	// 	},
	// 	onError: (error, newSensor, context) => {
	// 		queryClient.setQueryData(
	// 			"sensors",
	// 			(context as { previousSensors: Sensor[] }).previousSensors,
	// 		);
	// 		enqueueSnackbar(`Failed to delete sensor: ${error}`, {
	// 			variant: "error",
	// 		});
	// 	},
	// 	onSuccess: () => {
	// 		enqueueSnackbar(
	// 			`Deleted sensor. Changes may take up to a minute to be reflected everywhere.`,
	// 			{
	// 				variant: "success",
	// 			},
	// 		);
	// 	},
	// });

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
		console.log(sensorsQuery.data);
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
		// mutation.mutate(activeSensor);
		onDeletionConfirmModalClose();
	}

	function onDialogCLose() {
		navigateWithQuery("..");
	}

	let layout = (
		<Stack sx={{ p: onMobile ? 2 : 0, minHeight: "100%" }}>
			{user && !!user.roles.find((role) => role.raw === "sensors:write") && (
				<Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
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
				<Typography variant="h2">#{activeSensor.id}</Typography>
				{activeSensor.name && (
					<Typography variant="subtitle1">
						"{activeSensor.name}"
					</Typography>
				)}
				<BasicSensorInfo sensor={activeSensor} />
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
				{/* <EditUserInfo exitEditMode={exitEditMode} account={account} /> */}
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

// function EditUserInfo({
// 	exitEditMode,
// 	account,
// }: {
// 	exitEditMode: () => void;
// 	account: Account;
// }) {
// 	const { user } = useAuth();

// 	const [errors, setErrors] = useState<[string, string][]>([]);
// 	const { enqueueSnackbar } = useSnackbar();
// 	const accountsQuery = useQuery("accounts", makeFetchAccounts(user.token));
// 	const queryClient = useQueryClient();

// 	const [name, setName] = useState(account.name ? account.name : "");
// 	const [email, setEmail] = useState(account.email ? account.email : "");
// 	const [selectedRoles, setSelectedRoles] = useState<Role[]>(
// 		account.roles ? account.roles : [],
// 	);
// 	const mutation = useMutation(makeEditAccount(user.token), {
// 		onMutate: async (newAccount) => {
// 			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
// 			await queryClient.cancelQueries("accounts");

// 			// Snapshot the previous value
// 			const previousAccounts = queryClient.getQueryData("accounts");

// 			// Optimistically update to the new value

// 			queryClient.setQueryData("accounts", (oldAccounts: Account[]) => {
// 				let newAccounts = [
// 					...oldAccounts.filter(
// 						(account) => account.email !== newAccount.email,
// 					),
// 					{
// 						...newAccount,
// 						picture: generateAvatar(newAccount.email),
// 					},
// 				];
// 				newAccounts.sort(function (a, b) {
// 					const textA = a.email.toLowerCase();
// 					const textB = b.email.toLowerCase();
// 					return textA < textB ? -1 : textA > textB ? 1 : 0;
// 				});
// 				return newAccounts;
// 			});

// 			// Return a context object with the snapshotted value
// 			return { previousAccounts };
// 		},
// 		onError: (error, newAccount, context) => {
// 			queryClient.setQueryData(
// 				"accounts",
// 				(context as { previousAccounts: Account[] }).previousAccounts,
// 			);
// 			enqueueSnackbar(`Failed to modify account: ${error}`, {
// 				variant: "error",
// 			});
// 		},
// 		onSuccess: () => {
// 			enqueueSnackbar(
// 				`Modified account successfully. Changes may take up to a minute to be reflected everywhere.`,
// 				{
// 					variant: "success",
// 				},
// 			);
// 		},
// 	});

// 	useEffect(() => {
// 		setEmail(account.email);
// 		setName(account.name);
// 		setSelectedRoles(account.roles);
// 	}, [account]);

// 	const duplicateEmail = accountsQuery.isSuccess
// 		? !!accountsQuery.data.find(
// 				(filterAccount) =>
// 					filterAccount.email === email &&
// 					filterAccount.email !== account.email,
// 		  )
// 		: false;

// 	const hasUsersWrite = !!selectedRoles.find(
// 		(role) => role.raw === "users:write",
// 	);
// 	const hasSensorsWrite = !!selectedRoles.find(
// 		(role) => role.raw === "sensors:write",
// 	);

// 	function onSubmit() {
// 		setErrors([]);
// 		let newErrors: [string, string][] = [];
// 		if (!/^\S+@\S+$/.test(email)) {
// 			newErrors.push([
// 				"Please enter a valid email address.",
// 				"Email addresses usually have an @ in them and are over 5 characters long.",
// 			]);
// 		}
// 		setErrors(newErrors);
// 		if (newErrors.length === 0 && !duplicateEmail) {
// 			mutation.mutate({ name, email, roles: selectedRoles });
// 			exitEditMode();
// 		}
// 	}

// 	return (
// 		<Stack gap={1}>
// 			<Alert severity="info">
// 				<AlertTitle>
// 					Changes may take up to a minute to be reflected everywhere.
// 				</AlertTitle>
// 				If the updated account information disappears, don't worry. The
// 				data is stored and will show up soon.
// 			</Alert>
// 			{errors.length > 0 &&
// 				errors.map((error) => (
// 					<Alert severity="error">
// 						<AlertTitle>{error[0]}</AlertTitle>
// 						{error[1]}
// 					</Alert>
// 				))}
// 			<TextField
// 				value={name}
// 				onChange={(event) => setName(event.target.value)}
// 				autoFocus
// 				margin="dense"
// 				id="name"
// 				label="Full name"
// 				type="text"
// 				fullWidth
// 				variant="standard"
// 			/>
// 			<TextField
// 				disabled
// 				error={duplicateEmail}
// 				value={email}
// 				onChange={(event) => setEmail(event.target.value)}
// 				required
// 				margin="dense"
// 				id="email"
// 				label="Email address"
// 				type="email"
// 				fullWidth
// 				variant="standard"
// 			/>

// 			<Stack direction="row">
// 				<Button
// 					sx={{ mb: 2, mt: 2, ml: "auto" }}
// 					variant="outlined"
// 					onClick={onSubmit}
// 					startIcon={<SaveIcon />}>
// 					Save changes
// 				</Button>
// 			</Stack>
// 		</Stack>
// 	);
// }
