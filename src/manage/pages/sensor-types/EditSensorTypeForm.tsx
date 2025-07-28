import { Button, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { ConfigurableSensorType } from "../../../types";
import { ChannelEditor, Channel } from "./ChannelEditor";
import { updateSensorType, queryClient } from "../../../api";
import useAuth from "../../../auth/useAuth";
import { useSnackbar } from "notistack";

interface EditSensorTypeFormProps {
	activeSensorType: ConfigurableSensorType;
	exitEditMode: () => void;
}

export function EditSensorTypeForm({
	activeSensorType,
	exitEditMode,
}: EditSensorTypeFormProps) {
	const { user } = useAuth();
	const { enqueueSnackbar } = useSnackbar();
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState(activeSensorType.name);
	const [nameTouched, setNameTouched] = useState(false);
	const [channels, setChannels] = useState<Channel[]>(activeSensorType.channels);

	const validateForm = () => {
		if (!name || name.length < 1) return false;
		if (!channels || channels.length === 0) return false;
		
		for (const channel of channels) {
			if (!channel.id || !channel.name) return false;
			if (channel.id.length < 1 || channel.id.length > 3) return false;
			if (!/^[a-zA-Z0-9]+$/.test(channel.id)) return false;
		}
		
		// Check for duplicate IDs
		const ids = channels.map(c => c.id);
		if (new Set(ids).size !== ids.length) return false;
		
		return true;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			enqueueSnackbar("Please fix validation errors", { variant: "error" });
			return;
		}

		setLoading(true);
		try {
			await updateSensorType(user!.token, name, { channels });
			await queryClient.invalidateQueries("sensor-types");
			enqueueSnackbar("Sensor type updated successfully");
			exitEditMode();
		} catch (error) {
			enqueueSnackbar(`Failed to update sensor type: ${error}`, {
				variant: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	const isValid = validateForm();
	const hasChanges = 
		name !== activeSensorType.name ||
		JSON.stringify(channels) !== JSON.stringify(activeSensorType.channels);

	return (
		<Stack gap={3}>
			<TextField
				label="Sensor Type Name"
				value={name}
				onChange={(e) => setName(e.target.value)}
				onBlur={() => setNameTouched(true)}
				disabled={loading}
				error={nameTouched && (!name || name.length < 1)}
				helperText={nameTouched && (!name || name.length < 1) ? "Name is required" : ""}
				fullWidth
			/>

			<ChannelEditor
				channels={channels}
				onChange={setChannels}
				disabled={loading}
				error={!isValid}
			/>

			<Stack direction="row" gap={2} justifyContent="flex-end">
				<Button
					onClick={exitEditMode}
					disabled={loading}>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={handleSubmit}
					disabled={!isValid || !hasChanges || loading}>
					Save Changes
				</Button>
			</Stack>
		</Stack>
	);
}