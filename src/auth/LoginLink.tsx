import { FormEvent, useEffect, useState } from "react";
import { Alert, Stack, TextField, Typography } from "@mui/material";
import { showErrorSnackbar, titleSuffix } from "./utils";

import { LinkWithQuery } from "../components";
import { LoadingButton } from "@mui/lab";
import MagicIcon from "@mui/icons-material/AutoFixHigh";
import useAuth from "./useAuth";
import { useSnackbar } from "notistack";

export default function MagicLinkPage() {
	useEffect(() => {
		document.title = `Request a login link${titleSuffix}`;
	}, []);

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const [sent, setSent] = useState<false | string>(false);
	const { sendLink } = useAuth();
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const email = data.get("email");
		if (!email) {
			enqueueSnackbar("Please provide an email address.", {
				variant: "warning",
			});
		} else {
			setLoading(true);
			const success = await sendLink(
				email.toString().toLowerCase(),
				"sign-in",
			);
			if (success) {
				setSent(email.toString().toLowerCase());
			}
			setLoading(false);
		}
	}

	if (sent !== false) {
		return (
			<Stack gap={2} sx={{ width: "100%", mt: 2 }}>
				<Typography variant="body1" sx={{ textAlign: "center" }}>
					An email with a login link has been sent to {sent}.
				</Typography>
				<Typography variant="body1">
					If you don't see it, make sure to check your junk/spam
					folder.
				</Typography>
				<LinkWithQuery to="/auth/login" className="arrow-back">
					Back to login
				</LinkWithQuery>
			</Stack>
		);
	}

	return (
		<Stack gap={2} sx={{ width: "100%", mt: 2 }}>
			<Alert severity="warning">
				Login links are disabled at the moment. Ask Zade to reset your
				password.
			</Alert>
			<Typography
				variant="h4"
				component="h2"
				sx={{ textAlign: "center" }}>
				Get a login link
			</Typography>
			<Typography variant="body1" sx={{ textAlign: "center" }}>
				Enter your email address to request a login link.
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
						disabled
						loading={loading}
						variant="contained"
						type="submit"
						color="secondary"
						endIcon={<MagicIcon />}>
						Send the link
					</LoadingButton>
				</Stack>
			</form>
			<LinkWithQuery to="/auth/login" className="arrow-back">
				Back to login
			</LinkWithQuery>
		</Stack>
	);
}
