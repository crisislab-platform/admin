import { useSnackbar } from "notistack";
import useAuth from "../../../auth/useAuth";
import { CreateThingForm } from "../../../components/CreateAndEditForms";
import { getCreateAndEditSensorTypeSchema } from "./sensorTypeSchema";

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
	const schema = getCreateAndEditSensorTypeSchema(user!.token);

	return (
		<CreateThingForm
			key={open ? "open" : "closed"}
			title="Create New Sensor Type"
			submitLabel="Create Sensor Type"
			open={open}
			onClose={onClose}
			onCreate={() => {
				enqueueSnackbar("Sensor type created successfully");
				onCreate?.();
			}}
			onSubmitError={() => {
				enqueueSnackbar("Failed to create sensor type", {
					variant: "error",
				});
			}}
			schema={schema}
		/>
	);
}
