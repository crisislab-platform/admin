import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Stack,
	TextField,
} from "@mui/material";
import { useState } from "react";
import { ChannelEditor, Channel } from "./ChannelEditor";
import { createSensorType, queryClient } from "../../../api";
import useAuth from "../../../auth/useAuth";
import { useSnackbar } from "notistack";

interface CreateSensorTypeFormProps {
	open: boolean;
	onClose: () => void;
	onCreate?: () => void;
}

export function CreateSensorTypeForm({
	open,
	onClose,
	onCreate,
}: CreateSensorTypeFormProps) {
	const { user } = useAuth();
	const { enqueueSnackbar } = useSnackbar();
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("");
	const [nameTouched, setNameTouched] = useState(false);
	const [channels, setChannels] = useState<Channel[]>([
		{ id: "EHZ", name: "Z-axis Acceleration" }
	]);

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

		console.log("Submitting sensor type:", { name, channels });
		setLoading(true);
		try {
			const result = await createSensorType(user!.token, name, { channels });
			console.log("Create result:", result);
			await queryClient.invalidateQueries("sensor-types");
			enqueueSnackbar("Sensor type created successfully");
			
			// Reset form
			setName("");
			setNameTouched(false);
			setChannels([{ id: "EHZ", name: "Z-axis Acceleration" }]);
			
			onClose();
			onCreate?.();
		} catch (error) {
			enqueueSnackbar(`Failed to create sensor type: ${error}`, {
				variant: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		if (!loading) {
			// Reset form on close
			setName("");
			setNameTouched(false);
			setChannels([{ id: "EHZ", name: "Z-axis Acceleration" }]);
			onClose();
		}
	};

	const isValid = validateForm();

	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
			<DialogTitle>Create New Sensor Type</DialogTitle>
			<DialogContent>
				<Stack gap={3} sx={{ pt: 1 }}>
					<TextField
						label="Sensor Type Name"
						placeholder="Raspberry Shake 4D"
						value={name}
						onChange={(e) => setName(e.target.value)}
						onBlur={() => setNameTouched(true)}
						disabled={loading}
						error={nameTouched && (!name || name.length < 1)}
						helperText={nameTouched && (!name || name.length < 1) ? "Name is required" : ""}
						fullWidth
						autoFocus
					/>

					<ChannelEditor
						channels={channels}
						onChange={setChannels}
						disabled={loading}
						error={!isValid}
					/>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} disabled={loading}>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={handleSubmit}
					disabled={!isValid || loading}>
					Create Sensor Type
				</Button>
			</DialogActions>
		</Dialog>
	);
}