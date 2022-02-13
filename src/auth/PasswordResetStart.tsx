import { Button, Link, Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import PasswordIcon from "@mui/icons-material/Password";
import { titleSuffix } from "./utils";
import { useSnackbar } from "notistack";

export default function PasswordResetStartPage() {
	useEffect(() => {
		document.title = `Request a password reset${titleSuffix}`;
	}, []);

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const [sent, setSent] = useState<false | string>(false);

	function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const email = data.get("email");
		if (!email) {
			enqueueSnackbar("Please provide an email address.", {
				variant: "warning",
			});
		} else {
			enqueueSnackbar("Password reset email sent.", {
				variant: "success",
			});
			setSent(email + "");
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
				<Link component={RouterLink} to="../login">
					← Back to login
				</Link>
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
					<Button
						variant="contained"
						type="submit"
						color="secondary"
						endIcon={<PasswordIcon />}>
						Reset password
					</Button>
				</Stack>
			</form>
			<Link component={RouterLink} to="../login">
				← Back to login
			</Link>
		</Stack>
	);
}
