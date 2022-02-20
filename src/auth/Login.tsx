import { Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useEffect } from "react";
import { useAuth, titleSuffix } from "./utils";
import { LoadingButton } from "@mui/lab";
import { LinkWithQuery } from "../components";

import LoginIcon from "@mui/icons-material/VpnKey";
import { useSnackbar } from "notistack";

export default function LoginPage() {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const { login, status } = useAuth();

	useEffect(() => {
		document.title = `Login${titleSuffix}`;
	}, []);

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const email = data.get("email");
		const password = data.get("password");
		if (!email) {
			enqueueSnackbar("Please provide an email address.", {
				variant: "warning",
			});
		} else if (!password) {
			enqueueSnackbar("Please provide a password.", {
				variant: "warning",
			});
		} else {
			const succeeded = await login(
				email.toString(),
				password.toString(),
			);
		}
	}

	return (
		<Stack gap={2} sx={{ width: "100%", mt: 2 }}>
			<Typography
				variant="h4"
				component="h2"
				sx={{ textAlign: "center" }}>
				Login
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
					<TextField
						name="password"
						required
						label="Password"
						type="password"
					/>
					<LoadingButton
						loading={status === "loading"}
						variant="contained"
						type="submit"
						color="secondary"
						endIcon={<LoginIcon />}>
						Login
					</LoadingButton>
				</Stack>
			</form>
			<LinkWithQuery to="../password-reset-start">
				Reset password →
			</LinkWithQuery>
			<LinkWithQuery to="../login-link">Get a login link →</LinkWithQuery>
			<LinkWithQuery to="../register">Register →</LinkWithQuery>
		</Stack>
	);
}
