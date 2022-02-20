import { Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LinkWithQuery } from "../components";
import { LoadingButton } from "@mui/lab";
import { titleSuffix, useAuth, useGetQueryParam } from "./utils";
import { useSnackbar } from "notistack";
import { useState } from "react";

export default function PasswordResetFinishPage() {
	useEffect(() => {
		document.title = `Choose a new password${titleSuffix}`;
	}, []);

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const navigate = useNavigate();
	const token = useGetQueryParam("token");
	const { status, updatePassword } = useAuth();

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const password = data.get("password");
		if (!password) {
			enqueueSnackbar("Please provide a password.", {
				variant: "warning",
			});
		} else if (!token) {
			enqueueSnackbar("Please make sure that there is a token.", {
				variant: "warning",
			});
		} else {
			const succeeded = await updatePassword(password.toString(), token);
			if (succeeded) {
				navigate("../login");
			}
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
					<LoadingButton
						loading={status === "loading"}
						variant="contained"
						type="submit"
						color="secondary">
						Save new password
					</LoadingButton>
				</Stack>
			</form>
			<LinkWithQuery to="../login">← Back to login</LinkWithQuery>
		</Stack>
	);
}
