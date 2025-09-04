import { createMarker, queryClient, updateMarker } from "../../../api";
import { CreateAndEditThingsSchema } from "../../../components/CreateAndEditForms";
import {
	ChartMarker,
	chartMarkerStyles,
	chartMarkerTypes,
	SensorTypes,
} from "../../../types";

export const getCreateAndEditMarkerSchema = (
	token: string,
	sensorTypes: SensorTypes
): CreateAndEditThingsSchema<ChartMarker> => ({
	async handleCreateSubmit(data) {
		let success = false;
		try {
			await queryClient.executeMutation({
				mutationFn: () => {
					return createMarker(token, data);
				},
				onSuccess() {
					queryClient.invalidateQueries("charts/markers");
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
					return updateMarker(token, id, data);
				},
				onSuccess() {
					queryClient.invalidateQueries("charts/markers");
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
	ignoreProperties: ["id", "enabled"],
	fields: {
		sensor_type: {
			label: "Sensor type",
			type: "select",
			getOptions: () => Object.keys(sensorTypes),
			default: "Raspberry Shake 4D",
			recheckTheseWhenIChange: ["sensor_channel"],
		},
		sensor_channel: {
			label: "Channel",
			type: "select",
			getOptions: (data) => sensorTypes[data.sensor_type.value!],
			requires: "sensor_type",
		},

		label: {
			label: "Marker Label",
			type: "text",
		},
		colour: {
			label: "Colour",
			type: "colour",
			default: "#FF0000",
		},
		style: {
			label: "Style",
			type: "select",
			getOptions: () => chartMarkerStyles,
			default: "solid",
		},
		type: {
			label: "Type",
			type: "select",
			getOptions: () => chartMarkerTypes,
			default: "fixed-value",
		},
		value: {
			label: "Marked value",
			type: "number",
			default: 0,
			optional: true,
			requires(state) {
				if (state.type.value === "24h-max") return true;
				return false;
			},
			validate(state) {
				if (state.type.value === "24h-max") return true;

				return (
					state.value.value !== undefined &&
					!Number.isNaN(state.value.value)
				);
			},
		},
	},
});
