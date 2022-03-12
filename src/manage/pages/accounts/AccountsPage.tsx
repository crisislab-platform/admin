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
import { useEffect, useState } from "react";

import { AccountsList } from "./AccountsList";
import { Outlet } from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Role } from "../../../types";
import { makeFetchUsers } from "./api";
import { roles } from "../../../utils";
import useAuth from "../../../auth/useAuth";
import { useQuery } from "react-query";

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
	const accountsQuery = useQuery("accounts", makeFetchUsers(user.token));

	const duplicateEmail = accountsQuery.isSuccess
		? !!accountsQuery.data.find((account) => account.email === email)
		: false;

	const hasDangerousPermissions =
		selectedRoles.includes("users:write") ||
		selectedRoles.includes("sensors:write");

	function onSubmit() {
		onClose();
	}

	return (
		<Dialog fullWidth open={open} onClose={onClose}>
			<DialogTitle>Create account</DialogTitle>
			<DialogContent>
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
					options={roles}
					multiple
					id="roles"
					filterSelectedOptions
					renderInput={(params) => (
						<TextField
							{...params}
							label="Roles"
							margin="dense"
							fullWidth
						/>
					)}
				/>
				{hasDangerousPermissions && (
					<Alert severity="warning">
						<AlertTitle>
							You are granting this account dangerous permissions.
						</AlertTitle>
						{selectedRoles.includes("users:write") &&
							"This account will be able to create, modify, or delete any account, including their own."}
						<br />
						{selectedRoles.includes("sensors:write") &&
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
							sx={{ ml: "auto" }}
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
			<Grid item xs={12} md={6} p={2}>
				<Outlet />
			</Grid>
		</Grid>
	);
}
