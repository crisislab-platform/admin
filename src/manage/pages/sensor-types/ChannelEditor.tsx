import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	Button,
	IconButton,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { ChangeEvent, useMemo, useState } from "react";

export interface Channel {
	id: string;
	name: string;
}

interface ChannelEditorProps {
	channels: Channel[];
	onChange: (channels: Channel[]) => void;
	disabled?: boolean;
	error?: boolean;
}

export function ChannelEditor({
	channels,
	onChange,
	disabled = false,
	error = false,
}: ChannelEditorProps) {
	// Sanitize channels data to handle malformed input
	const sanitizedChannels = useMemo(() => {
		if (!Array.isArray(channels)) {
			console.warn("ChannelEditor received non-array channels:", channels);
			return [{ id: "", name: "" }];
		}
		
		const validChannels = channels.map((channel, index) => {
			if (!channel || typeof channel !== 'object') {
				console.warn(`Invalid channel at index ${index}:`, channel);
				return { id: "", name: "" };
			}
			
			return {
				id: typeof channel.id === 'string' ? channel.id : String(channel.id || ''),
				name: typeof channel.name === 'string' ? channel.name : String(channel.name || '')
			};
		});
		
		return validChannels.length > 0 ? validChannels : [{ id: "", name: "" }];
	}, [channels]);

	const localChannels = sanitizedChannels;
	const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

	const updateChannels = (newChannels: Channel[]) => {
		onChange(newChannels);
	};

	const addChannel = () => {
		updateChannels([...localChannels, { id: "", name: "" }]);
	};

	const removeChannel = (index: number) => {
		const newChannels = [...localChannels];
		newChannels.splice(index, 1);
		updateChannels(newChannels);
	};

	const updateChannel = (index: number, field: keyof Channel, value: string) => {
		const newChannels = [...localChannels];
		// Auto-uppercase channel IDs
		if (field === 'id') {
			value = value.toUpperCase();
		}
		newChannels[index] = { ...newChannels[index], [field]: value };
		updateChannels(newChannels);
	};

	const makeHandleChannelChange = (index: number, field: keyof Channel) =>
		(event: ChangeEvent<HTMLInputElement>) => {
			updateChannel(index, field, event.target.value);
		};

	const makeHandleChannelBlur = (index: number, field: keyof Channel) =>
		() => {
			const fieldKey = `${index}-${field}`;
			setTouchedFields(prev => new Set([...prev, fieldKey]));
		};

	const getChannelIdError = (channel: Channel, index: number, hasInteracted: boolean): string | null => {
		// Don't show errors until user has interacted with the field
		if (!hasInteracted) return null;
		if (!channel.id) return "Channel ID is required";
		if (channel.id.length < 1 || channel.id.length > 3) {
			return "Channel ID must be 1-3 characters";
		}
		if (!/^[a-zA-Z0-9]+$/.test(channel.id)) {
			return "Channel ID must contain only letters and numbers";
		}
		// Check for duplicates
		const duplicateIndex = localChannels.findIndex(
			(c, i) => i !== index && c.id === channel.id
		);
		if (duplicateIndex !== -1) {
			return "Channel ID must be unique";
		}
		return null;
	};

	return (
		<Stack gap={2}>
			<Typography variant="h6">Channels</Typography>
			
			{localChannels.map((channel, index) => {
				const hasIdInteracted = touchedFields.has(`${index}-id`);
				const hasNameInteracted = touchedFields.has(`${index}-name`);
				const idError = getChannelIdError(channel, index, hasIdInteracted);
				const nameError = hasNameInteracted && !channel.name ? "Display name is required" : null;
				
				return (
					<Stack key={index} direction="row" gap={1} alignItems="start">
						<TextField
							label="Channel ID"
							placeholder="E.g. EHZ"
							value={channel.id}
							onChange={makeHandleChannelChange(index, "id")}
							onBlur={makeHandleChannelBlur(index, "id")}
							disabled={disabled}
							error={Boolean(idError)}
							helperText={idError}
							size="small"
							sx={{ width: "120px" }}
							inputProps={{ maxLength: 3 }}
						/>
						<TextField
							label="Display Name"
							placeholder="E.g. Geophone (Counts)"
							value={channel.name}
							onChange={makeHandleChannelChange(index, "name")}
							onBlur={makeHandleChannelBlur(index, "name")}
							disabled={disabled}
							error={Boolean(nameError)}
							helperText={nameError}
							size="small"
							sx={{ flex: 1 }}
						/>
						<IconButton
							onClick={() => removeChannel(index)}
							disabled={disabled}
							size="small"
							color="error"
							sx={{ mt: 0.5 }}>
							<DeleteIcon />
						</IconButton>
					</Stack>
				);
			})}

			<Button
				startIcon={<AddIcon />}
				onClick={addChannel}
				disabled={disabled}
				variant="outlined"
				size="small"
				sx={{ alignSelf: "flex-start" }}>
				Add Channel
			</Button>

			{error && (
				<Typography color="error" variant="caption">
					Please ensure all channels have valid IDs and names
				</Typography>
			)}
		</Stack>
	);
}
