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
	ListItemText,
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
	userHasPermission,
} from "../../../utils";
import {
	getRefreshToken,
	makeDeleteAccount,
	makeEditAccount,
	makeFetchAccounts,
} from "../../../api";
import { useMutation, useQuery, useQueryClient } from "react-query";
import PasswordIcon from "@mui/icons-material/Password";

import CachedIcon from "@mui/icons-material/Cached";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { TransitionProps } from "@mui/material/transitions";
import useAuth from "../../../auth/useAuth";
import { useParams } from "react-router";
import { useSnackbar } from "notistack";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

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
	const [changePasswordOpen, setChangePasswordOpen] = useState(false);
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
			enqueueSnackbar("Deleted account");
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
				<AlertTitle>Error loading account details.</AlertTitle>
				{accountsQuery.error + ""}
			</Alert>
		);
	}

	const account = (accountsQuery.data ?? []).find(
		(account) => account.email === accountID,
	);

	function exitEditMode() {
		setEditMode(false);
	}

	function onDeletionConfirmModalClose() {
		setDeletionConfirmModalOpen(false);
	}

	function deleteAccount() {
		if (!account) return;

		mutation.mutate(account);
		onDeletionConfirmModalClose();
	}

	function onDialogCLose() {
		navigateWithQuery("/manage/accounts");
	}

	let layout = !account ? (
		<Alert severity="error">
			<AlertTitle>No matching account found.</AlertTitle>
			If you copied the URL from somewhere, make sure that you didn't miss
			any characters.
		</Alert>
	) : (
		<Stack sx={{ p: onMobile ? 2 : 0 }}>
			{userHasPermission(user, "users:write") && (
				<Stack
					justifyContent="flex-end"
					direction="row"
					gap={1}
					flexWrap="wrap"
					sx={{ mb: 2 }}>
					{userHasPermission(user, "users:issue_refresh_token") && (
						<Button
							startIcon={<CachedIcon />}
							variant="outlined"
							onClick={async () => {
								try {
									if (!user) return;

									// Create refresh token
									const tokenData = await getRefreshToken(
										user.token,
										account.email,
									);
									await navigator.clipboard.writeText(
										tokenData.token,
									);
									enqueueSnackbar(
										`Copied refresh token for ${tokenData.email}. Old refresh tokens won't work now.`,
										{ variant: "success" },
									);
								} catch (err) {
									enqueueSnackbar(err, { variant: "error" });
								}
							}}>
							Get refresh token
						</Button>
					)}
					<Button
						variant="outlined"
						startIcon={<PasswordIcon />}
						onClick={(event) => {
							setChangePasswordOpen(true);
						}}>
						Change password
					</Button>
					<ChangePasswordDialog
						open={changePasswordOpen}
						onClose={() => setChangePasswordOpen(false)}
						changingAccount={account}
					/>

					<Button
						disabled={account.email === user?.email}
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
	if (account && editMode) {
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
	const { user, setUser } = useAuth();

	const [errors, setErrors] = useState<[string, string][]>([]);
	const { enqueueSnackbar } = useSnackbar();
	const accountsQuery = useQuery("accounts", makeFetchAccounts(user?.token), {
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
						picture: generateAvatar(newAccount.email ?? ""),
					},
				];
				newAccounts.sort(function (a, b) {
					const textA = a?.email?.toLowerCase() ?? "";
					const textB = b?.email?.toLowerCase() ?? "";
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
		onSuccess: (data) => {
			enqueueSnackbar("Account modified");
			// Also on confirm, update the auth user if it was them that was edited
			if (user && user?.email === data.email) {
				// This is so cursed, but it means that the token is safe.
				// This should also trigger an effect to save this value to localStorage.
				setUser({ ...data, token: user.token });
			}
		},
	});

	useEffect(() => {
		setEmail(account.email);
		setName(account.name ?? "");
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
					setSelectedRoles(newValue ?? []);
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
