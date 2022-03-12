import { Account, Role } from "../../../types";
import {
	Alert,
	AlertTitle,
	Autocomplete,
	Avatar,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	List,
	ListItem,
	ListItemText,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { makeDeleteAccount, makeEditAccount, makeFetchAccounts } from "./api";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { LoadingSpinner } from "../../../components";
import SaveIcon from "@mui/icons-material/Save";
import { roles } from "../../../utils";
import useAuth from "../../../auth/useAuth";
import { useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

export function AccountPanel() {
	const { user } = useAuth();
	const accountsQuery = useQuery("accounts", makeFetchAccounts(user.token));
	const { accountID: encodedAccountID } = useParams();
	const [editMode, setEditMode] = useState(false);
	const [deletionConfirmModalOpen, setDeletionConfirmModalOpen] =
		useState(false);
	const { enqueueSnackbar } = useSnackbar();

	const queryClient = useQueryClient();
	const mutation = useMutation(makeDeleteAccount(user.token), {
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
			enqueueSnackbar(`Failed to delete account: ${error}.`, {
				variant: "error",
			});
		},
		onSuccess: () => {
			enqueueSnackbar(`Deleted account.`, {
				variant: "success",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries("accounts");
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
				{accountsQuery.error}
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

	if (editMode) {
		return (
			<Stack>
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

	function onDeletionConfirmModalClose() {
		setDeletionConfirmModalOpen(false);
	}

	function deleteAccount() {
		mutation.mutate(account);
		onDeletionConfirmModalClose();
	}

	return (
		<Stack>
			{!!user.roles.find((role) => role.raw === "users:write") && (
				<Stack direction="row" gap={1}>
					<Button
						sx={{ mb: 2, ml: "auto" }}
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
							<DialogContentText>
								Are you sure that you want to delete the account{" "}
								{account.email}? It will be gone forever with no
								way of recovering it.
							</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button onClick={onDeletionConfirmModalClose}>
								Cancel
							</Button>
							<Button color="error" onClick={deleteAccount}>
								Delete
							</Button>
						</DialogActions>
					</Dialog>
					<Button
						sx={{ mb: 2 }}
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

				<Typography variant="h2">
					{account.name || account.email}
				</Typography>
				{account.name && (
					<Typography variant="subtitle1">{account.email}</Typography>
				)}
			</Stack>
			<Typography variant="h6">Roles:</Typography>
			<List>
				{account.roles.map((role) => (
					<ListItem key={role.raw} disableGutters>
						<ListItemText
							primary={role.text + "."}
							secondary={role.raw}
						/>
					</ListItem>
				))}
			</List>
		</Stack>
	);
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
	const accountsQuery = useQuery("accounts", makeFetchAccounts(user.token));
	const queryClient = useQueryClient();

	const [name, setName] = useState(account.name ? account.name : "");
	const [email, setEmail] = useState(account.email ? account.email : "");
	const [selectedRoles, setSelectedRoles] = useState<Role[]>(
		account.roles ? account.roles : [],
	);
	const mutation = useMutation(makeEditAccount(user.token), {
		onMutate: async (newAccount) => {
			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries("accounts");

			// Snapshot the previous value
			const previousAccounts = queryClient.getQueryData("accounts");

			// Optimistically update to the new value

			queryClient.setQueryData("accounts", (oldAccounts: Account[]) => [
				...oldAccounts.filter(
					(account) => account.email !== newAccount.email,
				),
				newAccount,
			]);

			// Return a context object with the snapshotted value
			return { previousAccounts };
		},
		onError: (error, newAccount, context) => {
			queryClient.setQueryData(
				"accounts",
				(context as { previousAccounts: Account[] }).previousAccounts,
			);
			enqueueSnackbar(
				`Failed to modify account (email: ${email}): ${error}.`,
				{
					variant: "error",
				},
			);
		},
		onSuccess: () => {
			enqueueSnackbar(`Modified account (email: ${email}).`, {
				variant: "success",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries("accounts");
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
			mutation.mutate({ name, email, roles: selectedRoles });
			exitEditMode();
		}
	}

	return (
		<Stack>
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
