import { FormEvent, useEffect } from "react";
import { Stack, TextField, Typography } from "@mui/material";

import { LinkWithQuery } from "../components";
import { LoadingButton } from "@mui/lab";
import LoginIcon from "@mui/icons-material/VpnKey";
import { titleSuffix } from "./utils";
import useAuth from "./useAuth";
import { useSnackbar } from "notistack";

export default function LoginPage() {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const { login, loading } = useAuth();

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
			await login(email.toString(), password.toString());
		}
	}

	return (
		<Stack gap={2} sx={{ width: "100%", mt: 2 }}>
			<Typography variant="h4" component="h2" sx={{ textAlign: "center" }}>
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
						loading={loading}
						variant="contained"
						type="submit"
						color="secondary"
						endIcon={<LoginIcon />}
					>
						Login
					</LoadingButton>
				</Stack>
			</form>
			<LinkWithQuery to="/auth/password-reset-start" className="arrow-forwards">
				Reset password
			</LinkWithQuery>
			<LinkWithQuery to="/auth/login-link" className="arrow-forwards">
				Get a login link
			</LinkWithQuery>
			<LinkWithQuery to="/auth/register" className="arrow-forwards">
				Register
			</LinkWithQuery>
		</Stack>
	);
}
