import { Alert, AlertTitle, Button, Stack, TextField } from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { LoadingSpinner } from "../components/index";
import { Sensor } from "../types";
import { generateSensorSetupCommand } from "../utils";
import { makeGetSensorToken } from "../api";
import useAuth from "../auth/useAuth";
import { useMemo } from "react";
import { useQuery } from "react-query";

export function SensorSetupCommand({ sensor }: { sensor: Sensor }) {
	const { user } = useAuth();
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
		<Stack>
			<TextField
				id="setup-command-read-only-input"
				label="Setup command"
				value={setupCommand}
				InputProps={{
					readOnly: true,
				}}
				variant="standard"
			/>
			{"clipboard" in navigator && (
				<Button
					onClick={() => {
						try {
							navigator.clipboard.writeText(setupCommand);
						} catch {}
					}}
					startIcon={<ContentCopyIcon />}>
					Copy setup command
				</Button>
			)}
		</Stack>
	);
}
