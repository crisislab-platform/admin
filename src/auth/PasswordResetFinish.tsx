import { FormEvent, useEffect, useState } from "react";
import { Stack, TextField, Typography } from "@mui/material";
import { titleSuffix, useGetQueryParam } from "./utils";

import { LinkWithQuery } from "../components";
import { LoadingButton } from "@mui/lab";
import useAuth from "./useAuth";
import { useSnackbar } from "notistack";

export default function PasswordResetFinishPage({
	variant,
}: {
	variant: "welcome" | "reset";
}) {
	const welcome = variant === "welcome";
	useEffect(() => {
		document.title = welcome
			? `Let's get you set up!${titleSuffix}`
			: `Choose a new password${titleSuffix}`;
	}, []);

	const { enqueueSnackbar } = useSnackbar();
	const token = useGetQueryParam("token");
	const { resetPassword } = useAuth();
	const [loading, setLoading] = useState(false);

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
			setLoading(true);
			await resetPassword(password.toString(), token);
			setLoading(false);
		}
	}

	return (
		<Stack gap={2} sx={{ width: "100%", mt: 2 }}>
			<Typography
				variant="h4"
				component="h2"
				sx={{ textAlign: "center" }}>
				{welcome ? "Welcome!" : "Reset password"}
			</Typography>
			<Typography variant="body1" sx={{ textAlign: "center" }}>
				{welcome
					? "Finish setting up your account by choosing a"
					: "Chose your"}{" "}
				new password below.
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
						loading={loading}
						variant="contained"
						type="submit"
						color="secondary">
						Save new password
					</LoadingButton>
				</Stack>
			</form>
			<LinkWithQuery to="/auth/login">← Back to login</LinkWithQuery>
		</Stack>
	);
}
