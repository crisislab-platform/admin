import { Account, Role } from "../../../types";
import {
	Alert,
	AlertTitle,
	Autocomplete,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	Stack,
	TextField,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { makeCreateAccount, makeFetchAccounts } from "../../../api";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { AccountsList } from "./AccountsList";
import { Outlet } from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { roles } from "../../../utils";
import useAuth from "../../../auth/useAuth";
import { useSnackbar } from "notistack";
import { useState } from "react";

export function AccountsPage() {
	// emFkZUB2aWdnZXJzLm5ldA==
	const theme = useTheme();
	const onMobile = useMediaQuery(theme.breakpoints.down("md"));
	const [createAccountPopupOpen, setCreateAccountPopupOpen] = useState(false);

	function onCreateAccountPopupClose() {
		setCreateAccountPopupOpen(false);
	}

	return (
		<Grid container sx={{ w: "100%", h: "100%", flex: 1 }}>
			<Grid item xs={12} md={6}>
				<Stack>
					<Stack direction="row" sx={{ pt: 1 }}>
						<Button
							sx={{ ml: "auto", mr: onMobile ? 1 : 0 }}
							variant="contained"
							startIcon={<PersonAddIcon />}
							onClick={() => setCreateAccountPopupOpen(true)}>
							Create account
						</Button>
						<CreateAccountDialog
							open={createAccountPopupOpen}
							onClose={onCreateAccountPopupClose}
						/>
					</Stack>
					<AccountsList />
				</Stack>
			</Grid>
			<Grid item xs={12} md={6} p={1}>
				<Outlet />
			</Grid>
		</Grid>
	);
}

function CreateAccountDialog({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const { user } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
	const [errors, setErrors] = useState<[string, string][]>([]);
	const { enqueueSnackbar } = useSnackbar();
	const accountsQuery = useQuery("accounts", makeFetchAccounts(user.token));
	const queryClient = useQueryClient();
	const mutation = useMutation(makeCreateAccount(user.token), {
		onMutate: async (newAccount) => {
			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries("accounts");

			// Snapshot the previous value
			const previousAccounts = queryClient.getQueryData("accounts");

			// Optimistically update to the new value

			queryClient.setQueryData("accounts", (oldAccounts: Account[]) => [
				...oldAccounts,
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
				`Failed to create new account (email: ${email}): ${error}.`,
				{
					variant: "error",
				},
			);
		},
		onSuccess: () => {
			enqueueSnackbar(`Created new account (email: ${email}).`, {
				variant: "success",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries("accounts");
		},
	});

	const duplicateEmail = accountsQuery.isSuccess
		? !!accountsQuery.data.find((account) => account.email === email)
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
			onClose();
		}
	}

	return (
		<Dialog fullWidth open={open} onClose={onClose}>
			<DialogTitle>Create account</DialogTitle>
			<DialogContent>
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
						Another account is already using the email address{" "}
						{email}. Either choose a different email address or
						remove the account that is currently using this email
						address.
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
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Close</Button>
				<Button onClick={onSubmit}>Create</Button>
			</DialogActions>
		</Dialog>
	);
}
