import {
	Dialog,
	DialogContent,
	DialogTitle,
	Stack,
	TextField,
	Typography,Button
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useState, FormEvent } from "react";
import useAuth from "../../../auth/useAuth";
import { Account } from "../../../types";

export function ChangePasswordDialog({
	open,
	onClose,
	changingAccount,
}: {
	open: boolean;
	onClose: () => void;
	changingAccount: Account;
}) {
	const { changePassword, user } = useAuth();

	const ownAccount = user?.id === changingAccount.id;
	const { enqueueSnackbar } = useSnackbar();
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const password = data.get("password");
		if (!password) {
			enqueueSnackbar("Please provide a password.", {
				variant: "warning",
			});
		} else {
			setLoading(true);
			await navigator.clipboard.writeText(password.toString());
			const worked = await changePassword({
				newPassword: password.toString(),
				accountID: changingAccount.id,
			});
			if (worked) {
				onClose();
			}
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Change{ownAccount ? " my" : ""} password</DialogTitle>
			<DialogContent
				sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
				<Typography>
					Changing password for{" "}
					{ownAccount ? "current user: " : "other account: "}
					<strong>{changingAccount.email}</strong>
					(#{changingAccount.id})
				</Typography>
				<form action="#" onSubmit={onSubmit}>
					<Stack gap={2}>
						<TextField
							name="password"
							required
							label="New password"
							type="password"
							autoComplete="new-password"
						/>
						<Button
							loading={loading}
							variant="contained"
							type="submit"
							color="secondary">
							Save & copy new password
						</Button>
					</Stack>
				</form>
			</DialogContent>
		</Dialog>
	);
}
