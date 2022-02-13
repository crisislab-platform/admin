import { Button, Link, Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import LoginIcon from "@mui/icons-material/VpnKey";
import { titleSuffix } from "./utils";
import { useSnackbar } from "notistack";

export default function LoginPage() {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	useEffect(() => {
		document.title = `Login${titleSuffix}`;
	}, []);

	function onSubmit(e: FormEvent<HTMLFormElement>) {
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
			enqueueSnackbar("Logged in.", {
				variant: "success",
			});
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
					<Button
						variant="contained"
						type="submit"
						color="secondary"
						endIcon={<LoginIcon />}>
						Login
					</Button>
				</Stack>
			</form>
			<Link component={RouterLink} to="../password-reset-start">
				Reset password →
			</Link>
			<Link component={RouterLink} to="../magic-link">
				Get a magic link →
			</Link>
			<Link component={RouterLink} to="../register">
				Register →
			</Link>
		</Stack>
	);
}
