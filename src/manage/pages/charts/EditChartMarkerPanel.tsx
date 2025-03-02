import { Alert, Box, Button, Stack } from "@mui/material";
import {
	CreateOrEditThingForm,
	useCreateOrEditThingFormFields,
} from "../../../components/CreateAndEditForms";
import { getCreateAndEditMarkerSchema } from "./markerSchema";
import useAuth from "../../../auth/useAuth";
import { useQuery } from "react-query";
import { makeFetchChartMarkers } from "../../../api";
import { useParams } from "react-router";
import { useEffect, useMemo } from "react";

export function EditChartMarkerPanel() {
	const { user } = useAuth();
	const markersQuery = useQuery(
		"charts/markers",
		makeFetchChartMarkers(user?.token),
	);

	const { markerID: rawMarkerID } = useParams();
	const selectedMarkerID = rawMarkerID && Number(rawMarkerID);

	const selectedMarker = markersQuery.data?.find(
		(m) => m.id === selectedMarkerID,
	);

	const schema = getCreateAndEditMarkerSchema(user!.token);
	const {
		submitEdit,
		readyToSubmit,
		resetFormWithNewValues,
		formState,
		...formData
	} = useCreateOrEditThingFormFields(schema, selectedMarker);

	useEffect(() => {
		if (!selectedMarker) return;
		resetFormWithNewValues(selectedMarker);
	}, [selectedMarker]);

	const changesMade = useMemo(() => {
		if (!selectedMarker) return false;
		for (const key in selectedMarker) {
			if (!(key in formState)) {
				continue;
			}
			if (selectedMarker[key] !== formState[key].value) {
				console.log(selectedMarker[key], formState[key].value);

				return true;
			}
		}
		return false;
	}, [selectedMarker, formState]);

	const readyToSave = readyToSubmit && changesMade && selectedMarker;

	return (
		<Box>
			<Stack direction="row" sx={{ pb: 1 }}>
				<Button
					sx={{ ml: "auto" }}
					variant="contained"
					color="warning"
					disabled={!readyToSave}
					onClick={() => submitEdit(selectedMarker!.id)}>
					Save changes
				</Button>
			</Stack>
			{!selectedMarker && (
				<Alert severity="info">
					Please select or create a marker to continue
				</Alert>
			)}
			{selectedMarker && (
				<CreateOrEditThingForm formState={formState} {...formData} />
			)}
		</Box>
	);
}
