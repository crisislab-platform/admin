import { Alert, AlertTitle, Stack, TextField, Typography } from "@mui/material";
import { LinkWithQuery } from "../components";
import { authAPIBase, titleSuffix } from "./utils";
import { MouseEvent, useEffect, useState } from "react";
import useAuth from "./useAuth";
import { PasskeyIcon } from "./PasskeyIcon";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import {
	browserSupportsWebAuthn,
	startAuthentication,
} from "@simplewebauthn/browser";

export function LoginPage() {
	const { enqueueSnackbar } = useSnackbar();
	const { loading, login } = useAuth();
	const [email, setEmail] = useState("");

	useEffect(() => {
		document.title = `Login${titleSuffix}`;
	}, []);

	useEffect(() => {
		// Setup conditional UI

		login({ conditionalUI: true });
	}, []);

	async function onClick(e: MouseEvent) {
		e.preventDefault();
		const emailAddress = email.toLowerCase().trim();

		if (!emailAddress) {
			enqueueSnackbar("Please enter your email", {
				variant: "warning",
			});
		} else {
			await login({
				email: emailAddress,
			});
		}
	}

	return (
		<>
			<Typography variant="h5" component="h2" sx={{ pt: 1, pb: 3 }}>
				Login
			</Typography>
			{!browserSupportsWebAuthn() ? (
				<Alert severity="error">
					<AlertTitle>Unsupported browser</AlertTitle>
					Your browser or device doesn't support passkeys (AKA
					webauthn). Try with a different browser or a newer device.
				</Alert>
			) : (
				<Stack gap={1} sx={{ width: "100%", mb: 3 }}>
					<TextField
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						name="email"
						required
						label="Account email"
						placeholder="john@joe.net"
						// This triggers webauthn conditional UI
						autoComplete="email webauthn"
					/>
					<LoadingButton
						onClick={onClick}
						loading={loading}
						variant="contained"
						type="submit"
						color="secondary"
						startIcon={<PasskeyIcon />}>
						Login
					</LoadingButton>
				</Stack>
			)}
			<LinkWithQuery
				to="/auth/help-locked-out"
				className="arrow-forwards">
				I'm locked out
			</LinkWithQuery>
		</>
	);
}
