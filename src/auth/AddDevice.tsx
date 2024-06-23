import { Alert, AlertTitle, Stack, TextField, Typography } from "@mui/material";
import { titleSuffix, useGetQueryParam } from "./utils";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import useAuth from "./useAuth";
import { PasskeyIcon } from "./PasskeyIcon";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { browserSupportsWebAuthn } from "@simplewebauthn/browser";

const variantTitles = {
	register: "Setup login",
	"additional-device": "Add extra login device",
	recover: "Recover account",
};

export function AddDevicePage({
	variant,
}: {
	variant: "register" | "additional-device" | "recover";
}) {
	const { enqueueSnackbar } = useSnackbar();
	const { loading, addDevice } = useAuth();
	const [deviceName, setDeviceName] = useState("");

	const variantTitle = variantTitles[variant];

	useEffect(() => {
		document.title = `${variantTitle}${titleSuffix}`;
	}, [variantTitle]);

	const token = useGetQueryParam("add_device_token");
	// Tokens look like <base64 email>_<base64 expiry>_<random chars>
	const emailAddress = useMemo(() => {
		if (token) {
			try {
				return atob(token?.split("_")[0]);
			} catch (err) {
				console.warn(
					"Error parsing email from add device token: ",
					err,
				);
			}
		}

		return null;
	}, [token]);
	const tokenExpires = useMemo(() => {
		if (token) {
			try {
				return Number(atob(token?.split("_")[1]));
			} catch (err) {
				console.warn(
					"Error parsing expiry from add device token: ",
					err,
				);
			}
		}
		return null;
	}, [token]);

	async function onClick(e: MouseEvent) {
		e.preventDefault();
		const nickname = deviceName.trim();

		if (!nickname) {
			enqueueSnackbar("Please choose a device nickname", {
				variant: "warning",
			});
		} else {
			await addDevice({
				deviceName: nickname,
				token,
			});
		}
	}

	return (
		<>
			<Typography variant="h5" component="h2" sx={{ pt: 1 }}>
				{variantTitle}
			</Typography>
			{!browserSupportsWebAuthn() ? (
				<Alert severity="error">
					<AlertTitle>Unsupported browser</AlertTitle>
					Your browser or device doesn't support passkeys (AKA
					webauthn). Try with a different browser or a newer device.
				</Alert>
			) : !token || !emailAddress || !tokenExpires ? (
				<Alert severity="error">
					<AlertTitle>Malformed token</AlertTitle>
					Try asking the person who sent you this link for a new one
				</Alert>
			) : tokenExpires < Date.now() ? (
				<Alert severity="error">
					<AlertTitle>Expire token</AlertTitle>
					This token has run out of time to be used in. Try asking the
					person who sent you this link for a new one. Make sure you
					don't take too long to use it.
				</Alert>
			) : (
				<>
					<Typography variant="subtitle2" sx={{ pb: 3 }}>
						{emailAddress}
					</Typography>
					<Stack gap={1} sx={{ width: "100%" }}>
						<TextField
							value={deviceName}
							onChange={(e) => setDeviceName(e.target.value)}
							name="device-name"
							required
							label="Choose a device nickname"
							placeholder="John's µPad Ultra"
						/>
						<LoadingButton
							onClick={onClick}
							loading={loading}
							variant="contained"
							type="submit"
							color="secondary"
							startIcon={<PasskeyIcon />}>
							Register this device
						</LoadingButton>
					</Stack>
				</>
			)}
		</>
	);
}
