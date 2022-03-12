import {
	Alert,
	AlertTitle,
	Avatar,
	Box,
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
	Typography,
} from "@mui/material";
import { makeDeleteAccount, makeFetchAccounts } from "./api";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { Account } from "../../../types";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { LoadingSpinner } from "../../../components";
import useAuth from "../../../auth/useAuth";
import { useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useState } from "react";

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

	if (editMode) {
		return (
			<Stack>
				<Stack direction="row">
					<Button
						sx={{ mb: 2, ml: "auto" }}
						variant="outlined"
						onClick={() => setEditMode(false)}
						startIcon={<CloseIcon />}>
						Stop editing
					</Button>
				</Stack>
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
