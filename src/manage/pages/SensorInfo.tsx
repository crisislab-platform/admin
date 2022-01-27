import { Alert, AlertTitle, Fab, Tooltip } from "@mui/material";
import {
	BasicSensorInfo,
	LoadingSpinner,
	MissingPermission,
	useUser,
} from "../../components";
import { useEffect, useState } from "react";

import ReloadIcon from "@mui/icons-material/Refresh";
import { Sensor } from "../../types";
import { sensorsAPIBase } from "../../utils";
import { useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

export function SensorInfo() {
	const { sensorID } = useParams();
	const user = useUser();
	const [sensor, setSensor] = useState<null | Sensor>(null);
	const [error, setError] = useState<null | [string, Error]>(null);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	async function loadSensorInfo() {
		if (!user.isLoggedIn) {
			return enqueueSnackbar(
				"You must be logged in to view sensor info",
				{ variant: "warning" },
			);
		}
		const snack = enqueueSnackbar("Loading sensor info...", {
			variant: "info",
			persist: true,
		});
		try {
			const res = await fetch(`${sensorsAPIBase}/sensors/${sensorID}`, {
				headers: user.JWT
					? { Authorization: `Bearer ${user.JWT}` }
					: undefined,
			});
			const data = await res.json();
			setSensor(data);
			closeSnackbar(snack);
			enqueueSnackbar("Loaded sensor info!", { variant: "success" });
		} catch (e) {
			closeSnackbar(snack);
			enqueueSnackbar("Failed to load sensor info.", {
				variant: "error",
			});
			setError(["Failed to load sensor information.", e]);
		}
	}
	useEffect(() => {
		console.log("Something happened!");
		if (user.isLoggedIn) {
			loadSensorInfo();
		}
	}, [user.isLoggedIn, sensorID]);

	return (
		<>
			{user.isLoggedIn ? (
				sensor ? (
					<>
						<BasicSensorInfo sensor={sensor} />
					</>
				) : error ? (
					<Alert severity="error">
						<AlertTitle>{error[0]}</AlertTitle>
						{error[1] + ""}
					</Alert>
				) : (
					<LoadingSpinner message="Loading sensor info" />
				)
			) : (
				<MissingPermission permission="sensors:read" />
			)}
			<Tooltip title="Reload sensor info" placement="left">
				<span>
					<Fab
						color="primary"
						disabled={!user.isLoggedIn}
						onClick={() => {
							console.log("Fab clicked");
							setSensor(null);
							setError(null);
							loadSensorInfo();
						}}
						sx={{
							position: "fixed",
							right: (theme) => theme.spacing(2),
							bottom: (theme) => theme.spacing(2),
						}}>
						<ReloadIcon />
					</Fab>
				</span>
			</Tooltip>
		</>
	);
}
