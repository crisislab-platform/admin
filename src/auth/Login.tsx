import { Alert, AlertTitle, Stack, TextField, Typography } from "@mui/material";
import { LinkWithQuery } from "../components";
import { titleSuffix, useGetQueryParam } from "./utils";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import useAuth from "./useAuth";
import { PasskeyIcon } from "./PasskeyIcon";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";

export function LoginPage() {
	const { enqueueSnackbar } = useSnackbar();
	const { loading, login } = useAuth();
	const [email, setEmail] = useState("");

	useEffect(() => {
		document.title = `Login${titleSuffix}`;
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
			<Stack gap={1} sx={{ width: "100%", mb: 3 }}>
				<TextField
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					name="email"
					required
					label="Account email"
					placeholder="john@joe.net"
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
			<LinkWithQuery
				to="/auth/help-locked-out"
				className="arrow-forwards">
				I'm locked out
			</LinkWithQuery>
		</>
	);
}
