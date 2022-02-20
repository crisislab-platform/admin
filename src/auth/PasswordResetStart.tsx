import { Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { LinkWithQuery } from "../components";
import { titleSuffix, useAuth } from "./utils";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";

export default function PasswordResetStartPage() {
	useEffect(() => {
		document.title = `Request a password reset${titleSuffix}`;
	}, []);
	const { sendPasswordResetLink, status } = useAuth();

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const [sent, setSent] = useState<false | string>(false);

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const email = data.get("email");
		if (!email) {
			enqueueSnackbar("Please provide an email address.", {
				variant: "warning",
			});
		} else {
			const success = await sendPasswordResetLink(email.toString());
			if (success) {
				setSent(email.toString());
			}
		}
	}

	if (sent !== false) {
		return (
			<Stack gap={2} sx={{ width: "100%", mt: 2 }}>
				<Typography variant="body1" sx={{ textAlign: "center" }}>
					Password reset email sent to {sent}.
				</Typography>
				<Typography variant="body1">
					If you don't see it, make sure to check your junk/spam
					folder.
				</Typography>
				<LinkWithQuery to="../login">← Back to login</LinkWithQuery>
			</Stack>
		);
	}

	return (
		<Stack gap={2} sx={{ width: "100%", mt: 2 }}>
			<Typography
				variant="h4"
				component="h2"
				sx={{ textAlign: "center" }}>
				Reset password
			</Typography>
			<Typography variant="body1" sx={{ textAlign: "center" }}>
				Enter your email address to request a password reset link.
			</Typography>
			<form action="#" onSubmit={onSubmit}>
				<Stack gap={2}>
					<TextField
						name="email"
						required
						label="Email address"
						placeholder="john@doe.net"
						type="email"
					/>
					<LoadingButton
						loading={status === "loading"}
						variant="contained"
						type="submit"
						color="secondary">
						Reset password
					</LoadingButton>
				</Stack>
			</form>
			<LinkWithQuery to="../login">← Back to login</LinkWithQuery>
		</Stack>
	);
}
