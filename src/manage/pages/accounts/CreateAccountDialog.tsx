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
	Divider,
	Stack,
	TextField,
} from "@mui/material";
import { generateAvatar, roles } from "../../../utils";
import { makeCreateAccount, makeFetchAccounts } from "../../../api";
import { useMutation, useQuery, useQueryClient } from "react-query";

import useAuth from "../../../auth/useAuth";
import { useSnackbar } from "notistack";
import { useState } from "react";

export function CreateAccountDialog({
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
		onError: (error, newAccount, context) => {
			queryClient.setQueryData(
				"accounts",
				(context as { previousAccounts: Account[] }).previousAccounts,
			);
			enqueueSnackbar(`Failed to create new account: ${error}`, {
				variant: "error",
			});
		},
		onSuccess: () => {
			enqueueSnackbar(
				`Created new account. Changes may take up to a minute to be reflected everywhere.`,
				{
					variant: "success",
				},
			);
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
		let newErrors: typeof errors = [];
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
				<Stack gap={2}>
					<Alert severity="info">
						<AlertTitle>
							Changes may take up to a minute to be reflected
							everywhere.
						</AlertTitle>
						If the new account disappears, don't worry. The data is
						stored and will show up soon.
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
					<Stack gap={1}>
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
								<AlertTitle>
									Email address already in use.
								</AlertTitle>
								Another account is already using the email
								address {email}. Either choose a different email
								address or remove the account that is currently
								using this email address.
							</Alert>
						)}
					</Stack>
					<Stack gap={1}>
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
									You are granting this account dangerous
									permissions.
								</AlertTitle>
								{hasUsersWrite &&
									"This account will be able to create, modify, or delete any account, including their own."}
								<br />
								{hasSensorsWrite &&
									"This account will be able to create, modify, or delete any sensor."}
							</Alert>
						)}
					</Stack>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={onSubmit}>Create</Button>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
}
