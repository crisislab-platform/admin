import {
	createSensorType,
	queryClient,
	updateSensorType,
} from "../../../api";
import { CreateAndEditThingsSchema } from "../../../components/CreateAndEditForms";

export interface SensorTypeFormData {
	name: string;
	channels: { id: string; name: string }[];
}

export const getCreateAndEditSensorTypeSchema = (
	token: string,
): CreateAndEditThingsSchema<SensorTypeFormData> => ({
	async handleCreateSubmit(data) {
		let success = false;
		try {
			await queryClient.executeMutation({
				mutationFn: () => {
					return createSensorType(token, data.name, {
						channels: data.channels,
					});
				},
				onSuccess() {
					queryClient.invalidateQueries("sensor-types");
					success = true;
				},
				onError(error) {
					console.error("Mutation failed:", error);
					success = false;
				},
			});
		} catch {
			return false;
		}

		return success;
	},
	async handleEditSubmit(id, data) {
		let success = false;
		try {
			await queryClient.executeMutation({
				mutationFn: () => {
					return updateSensorType(token, data.name, {
						channels: data.channels,
					});
				},
				onSuccess() {
					queryClient.invalidateQueries("sensor-types");
					success = true;
				},
				onError(error) {
					console.error("Mutation failed:", error);
					success = false;
				},
			});
		} catch {
			return false;
		}

		return success;
	},
	fields: {
		name: {
			label: "Sensor Type Name",
			type: "text",
			placeholder: "Environmental Sensor",
			validate: (state) => {
				const name = state.name.value;
				if (!name || name.length < 2) return false;
				return true;
			},
		},
		channels: {
			label: "Channels",
			type: "text", // We'll override this in the form component
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
			// @ts-expect-error Cooked stuff happening here, dw about it
			default: [{ id: "ehz", name: "Geophone (Counts)" }],
		},
	},
});