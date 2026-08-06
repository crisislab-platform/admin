import { Button, Stack } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useSnackbar } from "notistack";
import useAuth from "../../../auth/useAuth";
import {
	CreateOrEditThingForm,
	useCreateOrEditThingFormFields,
} from "../../../components/CreateAndEditForms";
import { ConfigurableSensorType } from "../../../types";
import { getCreateAndEditSensorTypeSchema } from "./sensorTypeSchema";

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
	const schema = getCreateAndEditSensorTypeSchema(user!.token, true);
	const {
		submitEdit,
		readyToSubmit,
		resetFormWithNewValues,
		formState,
		updateField,
		loading,
		...formData
	} = useCreateOrEditThingFormFields(schema, activeSensorType);

	useEffect(() => {
		resetFormWithNewValues(activeSensorType);
	}, [activeSensorType]);

	const hasChanges = useMemo(
		() =>
			formState.name.value !== activeSensorType.name ||
			(formState.response.value ?? null) !==
				(activeSensorType.response ?? null) ||
			JSON.stringify(formState.channels.value) !==
				JSON.stringify(activeSensorType.channels),
		[activeSensorType, formState],
	);

	async function saveChanges() {
		const ok = await submitEdit(activeSensorType.name);
		if (ok) {
			enqueueSnackbar("Sensor type updated successfully");
			exitEditMode();
			return;
		}

		enqueueSnackbar("Failed to update sensor type", {
			variant: "error",
		});
	}

	function removeResponse() {
		updateField({
			property: "response",
			schema,
			rawValue: "",
			value: null,
			fileUploadName: "",
		});
	}

	return (
		<Stack gap={3}>
			<CreateOrEditThingForm
				formState={formState}
				updateField={updateField}
				loading={loading}
				{...formData}
			/>
			{formState.response.value && (
				<Button
					variant="outlined"
					color="error"
					onClick={removeResponse}
					disabled={loading}
					sx={{ alignSelf: "flex-start" }}>
					Remove response XML
				</Button>
			)}

			<Stack direction="row" gap={2} justifyContent="flex-end">
				<Button onClick={exitEditMode} disabled={loading}>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={saveChanges}
					disabled={!readyToSubmit || !hasChanges || loading}>
					Save Changes
				</Button>
			</Stack>
		</Stack>
	);
}
