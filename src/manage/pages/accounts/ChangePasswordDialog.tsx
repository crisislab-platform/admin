import {
	Dialog,
	DialogContent,
	DialogTitle,
	Stack,
	TextField,
	Typography,Button
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState, FormEvent } from "react";
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
	const { changePassword, forceReauth, user } = useAuth();

	const ownAccount = user?.id === changingAccount.id;
	const { enqueueSnackbar } = useSnackbar();
	const [loading, setLoading] = useState(false);
	const [copyFailed, setCopyFailed] = useState(false);
	const [reauthOnClose, setReauthOnClose] = useState(false);

	useEffect(() => {
		if (open) {
			setCopyFailed(false);
			setReauthOnClose(false);
		}
	}, [open, changingAccount.id]);

	function closeDialog(shouldReauth = reauthOnClose) {
		onClose();
		if (shouldReauth) {
			forceReauth();
		}
	}

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const password = data.get("password");
		if (!password) {
			enqueueSnackbar("Please provide a password.", {
				variant: "warning",
			});
			return;
		}

		const newPassword = password.toString();
		setLoading(true);
		try {
			const worked = await changePassword({
				newPassword,
				accountID: changingAccount.id,
			});

			if (!worked) return;
			setReauthOnClose(ownAccount);

			try {
				await navigator.clipboard.writeText(newPassword);
				setCopyFailed(false);
				enqueueSnackbar("Password copied to clipboard.", {
					variant: "success",
				});
			} catch (error) {
				console.warn("Failed to copy password", error);
				setCopyFailed(true);
				enqueueSnackbar(
					"Password changed, but couldn't copy it. The password is visible so you can copy it manually before closing this dialog.",
					{ variant: "warning", autoHideDuration: 8000 },
				);
				return;
			}

			closeDialog(ownAccount);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onClose={() => closeDialog()}>
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
							type={copyFailed ? "text" : "password"}
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
