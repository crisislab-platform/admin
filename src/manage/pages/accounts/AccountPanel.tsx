import { Account, Role } from "../../../types";
import {
	Alert,
	AlertTitle,
	AppBar,
	Autocomplete,
	Avatar,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Slide,
	Stack,
	TextField,
	Toolbar,
	Typography,
} from "@mui/material";
import { LoadingSpinner, useNavigateWithQuery } from "../../../components";
import { ReactElement, Ref, forwardRef, useEffect, useState } from "react";
import {
	accountsQueryStaleTime,
	generateAvatar,
	roles,
	useOnMobile,
} from "../../../utils";
import {
	makeDeleteAccount,
	makeEditAccount,
	makeFetchAccounts,
} from "../../../api";
import { useMutation, useQuery, useQueryClient } from "react-query";

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LinkIcon from "@mui/icons-material/Link";
import LockResetIcon from "@mui/icons-material/LockReset";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import { TransitionProps } from "@mui/material/transitions";
import WaveIcon from "@mui/icons-material/EmojiPeople";
import { sendLink } from "../../../auth/auth";
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

export function AccountPanel() {
	const { user } = useAuth();
	const accountsQuery = useQuery("accounts", makeFetchAccounts(user?.token), {
		staleTime: accountsQueryStaleTime,
	});
	const { accountID: encodedAccountID } = useParams();
	const [editMode, setEditMode] = useState(false);
	const [sendLinkMenuAnchorEl, setSendLinkMenuAnchorEl] =
		useState<null | HTMLElement>(null);
	const sendLinkMenuOpen = Boolean(sendLinkMenuAnchorEl);
	const [deletionConfirmModalOpen, setDeletionConfirmModalOpen] =
		useState(false);
	const { enqueueSnackbar } = useSnackbar();
	const onMobile = useOnMobile();
	const navigateWithQuery = useNavigateWithQuery();

	const queryClient = useQueryClient();
	const mutation = useMutation(makeDeleteAccount(user?.token), {
		onMutate: async (accountToDelete: Account) => {
			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries("accounts");

			// Snapshot the previous value
			const previousAccounts = queryClient.getQueryData("accounts");

			// Optimistically update to the new value

			queryClient.setQueryData("accounts", (oldAccounts: Account[]) =>
				oldAccounts.filter(
					(account) => account.email !== accountToDelete.email,
				),
			);

			// Return a context object with the snapshotted value
			return { previousAccounts };
		},
		onError: (error, newAccount, context) => {
			queryClient.setQueryData(
				"accounts",
				(context as { previousAccounts: Account[] }).previousAccounts,
			);
			enqueueSnackbar(`Failed to delete account: ${error}`, {
				variant: "error",
			});
		},
		onSuccess: () => {
			enqueueSnackbar(
				"Deleted account. Changes may take up to a minute to be reflected everywhere.",
				{
					variant: "success",
				},
			);
		},
	});

	const accountID = encodedAccountID
		? decodeURIComponent(encodedAccountID)
		: null;

	if (accountsQuery.isLoading) {
		return <LoadingSpinner message="Loading account details" />;
	}
	if (accountsQuery.isError) {
		return (
			<Alert severity="error">
				<>
					<AlertTitle>Error loading account details.</AlertTitle>
					{accountsQuery.error}
				</>
			</Alert>
		);
	}

	const account = accountsQuery.data.find(
		(account) => account.email === accountID,
	);

	if (!account) {
		return (
			<Alert severity="warning">
				<AlertTitle>No matching user found.</AlertTitle>
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

	function deleteAccount() {
		mutation.mutate(account);
		onDeletionConfirmModalClose();
	}

	function onSendLinkMenuClose() {
		setSendLinkMenuAnchorEl(null);
	}
	function createOnSendLinkMenuItemClick(
		type: "welcome" | "sign-in" | "reset",
	) {
		return async () => {
			try {
				onSendLinkMenuClose();
				await sendLink(account.email, type);
				enqueueSnackbar(`Sent ${type} link to ${account.email}.`, {
					variant: "success",
				});
			} catch (error) {
				enqueueSnackbar(
					`Error sendding ${type} link to ${account.email}: ${
						error.message || error
					}.`,
					{ variant: "error" },
				);
			}
		};
	}

	function onDialogCLose() {
		navigateWithQuery("/manage/accounts");
	}

	let layout = (
		<Stack sx={{ p: onMobile ? 2 : 0 }}>
			{user &&
				!!user.roles.find((role) => role.raw === "users:write") && (
					<Stack
						justifyContent="flex-end"
						direction="row"
						gap={1}
						flexWrap="wrap"
						sx={{ mb: 2 }}>
						<Button
							variant="outlined"
							startIcon={<SendIcon />}
							onClick={(event) => {
								setSendLinkMenuAnchorEl(event.currentTarget);
							}}
							id="send-link-button"
							aria-controls={
								sendLinkMenuOpen ? "send-link-menu" : undefined
							}
							aria-haspopup="true"
							aria-expanded={
								sendLinkMenuOpen ? "true" : undefined
							}>
							Send link
						</Button>
						<Menu
							id="send-link-menu"
							anchorEl={sendLinkMenuAnchorEl}
							open={sendLinkMenuOpen}
							onClose={onSendLinkMenuClose}
							MenuListProps={{
								"aria-labelledby": "send-link-button",
							}}>
							<MenuItem
								onClick={createOnSendLinkMenuItemClick(
									"welcome",
								)}>
								<ListItemIcon>
									<WaveIcon fontSize="small" />
								</ListItemIcon>
								<ListItemText>Welcome</ListItemText>
							</MenuItem>
							<MenuItem
								onClick={createOnSendLinkMenuItemClick(
									"reset",
								)}>
								<ListItemIcon>
									<LockResetIcon fontSize="small" />
								</ListItemIcon>
								<ListItemText>Reset password</ListItemText>
							</MenuItem>
							<MenuItem
								onClick={createOnSendLinkMenuItemClick(
									"sign-in",
								)}>
								<ListItemIcon>
									<LinkIcon fontSize="small" />
								</ListItemIcon>
								<ListItemText>Login link</ListItemText>
							</MenuItem>
						</Menu>
						<Button
							disabled={account.email === user.email}
							variant="outlined"
							color="error"
							startIcon={<DeleteIcon />}
							onClick={() => setDeletionConfirmModalOpen(true)}>
							Delete account
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
											Changes may take up to a minute to
											be reflected everywhere.
										</AlertTitle>
										If the deleted account reappears, don't
										worry. The stored data has been removed
										and will stop showing up soon.
									</Alert>
									<DialogContentText>
										Are you sure that you want to delete the
										account {account.email}? It will be gone
										forever with no way of recovering it.
									</DialogContentText>
								</Stack>
							</DialogContent>
							<DialogActions>
								<Button color="error" onClick={deleteAccount}>
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
							Edit account details
						</Button>
					</Stack>
				)}
			<Stack alignItems="center" gap={2}>
				<Avatar
					src={account.picture}
					alt={account.name || account.picture}
					sx={{ width: 160, height: 160 }}
				/>
				{account.name && (
					<Typography variant="h2" textAlign="center">
						{account.name}
					</Typography>
				)}
				<Typography variant="subtitle1" textAlign="center">
					{account.email}
				</Typography>
			</Stack>
			<Typography variant="h6">Roles:</Typography>
			<List>
				{account.roles.map((role) => (
					<ListItem key={role.raw} disableGutters>
						<ListItemText
							primary={`${role.text}.`}
							secondary={role.raw}
						/>
					</ListItem>
				))}
			</List>
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
				<EditUserInfo exitEditMode={exitEditMode} account={account} />
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
								? "Editing user information"
								: "User information"}
						</Typography>
					</Toolbar>
				</AppBar>
				{layout}
			</Dialog>
		);
	}

	return layout;
}

function EditUserInfo({
	exitEditMode,
	account,
}: {
	exitEditMode: () => void;
	account: Account;
}) {
	const { user } = useAuth();

	const [errors, setErrors] = useState<[string, string][]>([]);
	const { enqueueSnackbar } = useSnackbar();
	const accountsQuery = useQuery("accounts", makeFetchAccounts(user.token), {
		staleTime: accountsQueryStaleTime,
	});
	const queryClient = useQueryClient();

	const [name, setName] = useState(account.name ? account.name : "");
	const [email, setEmail] = useState(account.email ? account.email : "");
	const [selectedRoles, setSelectedRoles] = useState<Role[]>(
		account.roles ? account.roles : [],
	);
	const mutation = useMutation(makeEditAccount(user?.token), {
		onMutate: async ([oldAccout, newAccount]) => {
			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries("accounts");

			// Snapshot the previous value
			const previousAccounts = queryClient.getQueryData("accounts");

			// Optimistically update to the new value

			queryClient.setQueryData("accounts", (oldAccounts: Account[]) => {
				let newAccounts = [
					...oldAccounts.filter(
						(account) => account.email !== newAccount.email,
					),
					{
						...newAccount,
						picture: generateAvatar(newAccount.email),
					},
				];
				newAccounts.sort(function (a, b) {
					const textA = a.email.toLowerCase();
					const textB = b.email.toLowerCase();
					return textA < textB ? -1 : textA > textB ? 1 : 0;
				});
				return newAccounts;
			});

			// Return a context object with the snapshotted value
			return { previousAccounts };
		},
		onError: (error, [oldAccout, newAccount], context) => {
			queryClient.setQueryData(
				"accounts",
				(context as { previousAccounts: Account[] }).previousAccounts,
			);
			enqueueSnackbar(`Failed to modify account: ${error}`, {
				variant: "error",
			});
		},
		onSuccess: () => {
			enqueueSnackbar(
				"Modified account successfully. Changes may take up to a minute to be reflected everywhere.",
				{
					variant: "success",
				},
			);
		},
	});

	useEffect(() => {
		setEmail(account.email);
		setName(account.name);
		setSelectedRoles(account.roles);
	}, [account]);

	const duplicateEmail = accountsQuery.isSuccess
		? !!accountsQuery.data.find(
				(filterAccount) =>
					filterAccount.email === email &&
					filterAccount.email !== account.email,
		  )
		: false;

	const hasUsersWrite = !!selectedRoles.find(
		(role) => role.raw === "users:write",
	);
	const hasSensorsWrite = !!selectedRoles.find(
		(role) => role.raw === "sensors:write",
	);

	function onSubmit() {
		setErrors([]);
		let newErrors: [string, string][] = [];
		if (!/^\S+@\S+$/.test(email)) {
			newErrors.push([
				"Please enter a valid email address.",
				"Email addresses usually have an @ in them and are over 5 characters long.",
			]);
		}
		setErrors(newErrors);
		if (newErrors.length === 0 && !duplicateEmail) {
			mutation.mutate([account, { name, email, roles: selectedRoles }]);
			exitEditMode();
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
			{errors.length > 0 &&
				errors.map((error) => (
					<Alert severity="error">
						<AlertTitle>{error[0]}</AlertTitle>
						{error[1]}
					</Alert>
				))}
			<TextField
				value={name}
				onChange={(event) => setName(event.target.value)}
				autoFocus
				margin="dense"
				id="name"
				label="Full name"
				type="text"
				fullWidth
				variant="standard"
			/>
			<TextField
				disabled
				error={duplicateEmail}
				value={email}
				onChange={(event) => setEmail(event.target.value)}
				required
				margin="dense"
				id="email"
				label="Email address"
				type="email"
				fullWidth
				variant="standard"
			/>
			{duplicateEmail && (
				<Alert severity="error">
					<AlertTitle>Email address already in use.</AlertTitle>
					Another account is already using the email address {email}.
					Either choose a different email address or remove the
					account that is currently using this email address.
				</Alert>
			)}
			<Autocomplete
				value={selectedRoles}
				onChange={(event, newValue: Role[] | null) => {
					setSelectedRoles(newValue);
				}}
				options={Object.values(roles) as Role[]}
				multiple
				id="roles"
				filterSelectedOptions
				getOptionLabel={(role: Role) => role.text}
				renderInput={(params) => (
					<TextField
						{...params}
						label="Roles"
						margin="dense"
						fullWidth
					/>
				)}
			/>
			{(hasUsersWrite || hasSensorsWrite) && (
				<Alert severity="warning">
					<AlertTitle>
						You are granting this account dangerous permissions.
					</AlertTitle>
					{hasUsersWrite &&
						"This account will be able to create, modify, or delete any account, including their own."}
					<br />
					{hasSensorsWrite &&
						"This account will be able to create, modify, or delete any sensor."}
				</Alert>
			)}
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
