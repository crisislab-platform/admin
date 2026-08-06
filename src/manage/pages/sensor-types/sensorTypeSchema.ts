import {
	createSensorType,
	queryClient,
	updateSensorType,
} from "../../../api";
import { CreateAndEditThingsSchema } from "../../../components/CreateAndEditForms";
import { createElement } from "react";
import { ChannelEditor } from "./ChannelEditor";

export interface SensorTypeFormData {
	name: string;
	response?: string | null;
	channels: { id: string; name: string }[];
}

export const getCreateAndEditSensorTypeSchema = (
	token: string,
	disableName = false,
): CreateAndEditThingsSchema<SensorTypeFormData, string> => ({
	async handleCreateSubmit(data) {
		let success = false;
		try {
			await queryClient.getMutationCache().build(queryClient, {
				mutationFn: () => {
					return createSensorType(token, data.name, {
						channels: data.channels,
						response: data.response ?? null,
					});
				},
				onSuccess() {
					queryClient.invalidateQueries(["sensor-types"]);
					success = true;
				},
				onError(error) {
					console.error("Mutation failed:", error);
					success = false;
				},
			}).execute();
		} catch {
			return false;
		}

		return success;
	},
	async handleEditSubmit(id, data) {
		let success = false;
		try {
			await queryClient.getMutationCache().build(queryClient, {
				mutationFn: () => {
					return updateSensorType(token, id, {
						channels: data.channels,
						response: data.response ?? null,
					});
				},
				onSuccess() {
					queryClient.invalidateQueries(["sensor-types"]);
					success = true;
				},
				onError(error) {
					console.error("Mutation failed:", error);
					success = false;
				},
			}).execute();
		} catch {
			return false;
		}

		return success;
	},
	fields: {
		name: {
			label: "Sensor Type Name",
			type: "text",
			disabled: disableName,
			placeholder: "Raspberry Shake 4D",
			validate: (state) => {
				const name = state.name.value;
				if (!name || name.length < 1) return false;
				return true;
			},
		},
		response: {
			label: "Sensor response (SeisComP XML format)",
			placeholder: "Upload response XML",
			type: "text-file-upload",
			optional: true,
			default: null,
		},
		channels: {
			label: "Channels",
			type: "custom",
			validate: (state) => {
				const channels = state.channels.value;
				if (!channels || !Array.isArray(channels) || channels.length === 0) {
					return false;
				}
				
				// Check each channel has valid id and name
				for (const channel of channels) {
					if (!channel.id || !channel.name) return false;
					if (channel.id.length < 1 || channel.id.length > 3) return false;
					if (!/^[a-zA-Z0-9]+$/.test(channel.id)) return false;
				}
				
				// Check for duplicate IDs
				const ids = channels.map(c => c.id);
				if (new Set(ids).size !== ids.length) return false;
				
				return true;
			},
			default: [{ id: "EHZ", name: "Z-axis Acceleration" }],
			render: ({ value, onChange, disabled, error }) =>
				createElement(ChannelEditor, {
					channels: value ?? [],
					onChange,
					disabled,
					error,
				}),
		},
	},
});
