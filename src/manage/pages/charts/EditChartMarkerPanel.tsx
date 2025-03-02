import { Box, Stack } from "@mui/material";
import {
	CreateOrEditThingForm,
	useCreateOrEditThingFormFields,
} from "../../../components/CreateAndEditForms";
import { getCreateAndEditMarkerSchema } from "./markerSchema";
import useAuth from "../../../auth/useAuth";

export function EditChartMarkerPanel() {
	const { user } = useAuth();
	const schema = getCreateAndEditMarkerSchema(user!.token);
	const { submitCreate, readyToSubmit, ...formState } =
		useCreateOrEditThingFormFields(schema);

	return (
		<Box sx={{ flex: 1 }}>
			Edit marker panel
			<CreateOrEditThingForm {...formState} />
		</Box>
	);
}
