import { Button, Link, Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import PasswordIcon from "@mui/icons-material/Password";
import { titleSuffix } from "./utils";
import { useSnackbar } from "notistack";

export default function PasswordResetFinishPage() {
	useEffect(() => {
		document.title = `Choose a new password${titleSuffix}`;
	}, []);

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const navigate = useNavigate();

	function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const password = data.get("password");
		if (!password) {
			enqueueSnackbar("Please provide a password.", {
				variant: "warning",
			});
		} else {
			enqueueSnackbar("Password updated.", {
				variant: "success",
			});
			navigate("../login");
		}
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
				Chose your new password below.
			</Typography>
			<form action="#" onSubmit={onSubmit}>
				<Stack gap={2}>
					<TextField
						name="password"
						required
						label="New password"
						type="password"
					/>
					<Button
						variant="contained"
						type="submit"
						color="secondary"
						endIcon={<PasswordIcon />}>
						Save new password
					</Button>
				</Stack>
			</form>
			<Link component={RouterLink} to="../login">
				← Back to login
			</Link>
		</Stack>
	);
}
