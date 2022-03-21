import {
	Alert,
	AlertTitle,
	IconButton,
	Stack,
	TextField,
	Tooltip,
} from "@mui/material";
import { MouseEvent, useMemo } from "react";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { LoadingSpinner } from "../components/index";
import { Sensor } from "../types";
import { generateSensorSetupCommand } from "../utils";
import { makeGetSensorToken } from "../api";
import useAuth from "../auth/useAuth";
import { useQuery } from "react-query";
import { useSnackbar } from "notistack";

export function SensorSetupCommand({ sensor }: { sensor: Sensor }) {
	const { user } = useAuth();
	const { enqueueSnackbar } = useSnackbar();
	const sensorTokenQuery = useQuery(
		["sensor-token", sensor.id],
		makeGetSensorToken(sensor.id, user && user.token),
	);

	const setupCommand = useMemo<null | string>(() => {
		if (!sensorTokenQuery.isSuccess) return null;
		return generateSensorSetupCommand(sensorTokenQuery.data.token);
	}, [sensorTokenQuery.isSuccess]);

	if (sensorTokenQuery.isLoading) {
		return <LoadingSpinner message="Loading sensor token" />;
	}
	if (sensorTokenQuery.isError) {
		return (
			<Alert severity="error">
				<AlertTitle>Error loading sensor token.</AlertTitle>
				The sensor token is required to generate the setup command.
				<br />
				{sensorTokenQuery.error + ""}
			</Alert>
		);
	}
	return (
		<Stack
			direction="row"
			gap={1}
			alignItems="center"
			sx={{ width: "100%" }}>
			<TextField
				onClick={(event) => (event.target as HTMLInputElement).select()}
				id="setup-command-read-only-input"
				label="Setup command"
				value={setupCommand}
				InputProps={{
					readOnly: true,
				}}
				variant="filled"
				fullWidth
			/>
			{"clipboard" in navigator && (
				<span>
					<Tooltip title="Copy setup command">
						<IconButton
							onClick={async () => {
								try {
									await navigator.clipboard.writeText(
										setupCommand,
									);
									enqueueSnackbar("Copied setup command.", {
										variant: "success",
									});
								} catch {
									enqueueSnackbar(
										"Failed to copy setup command.",
										{ variant: "error" },
									);
								}
							}}>
							<ContentCopyIcon />
						</IconButton>
					</Tooltip>
				</span>
			)}
		</Stack>
	);
}
