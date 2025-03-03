import {
	Alert,
	AppBar,
	Box,
	Button,
	Dialog,
	FormControlLabel,
	IconButton,
	Stack,
	Switch,
	Toolbar,
	Typography,
} from "@mui/material";
import {
	CreateOrEditThingForm,
	useCreateOrEditThingFormFields,
} from "../../../components/CreateAndEditForms";
import { getCreateAndEditMarkerSchema } from "./markerSchema";
import useAuth from "../../../auth/useAuth";
import { useQuery } from "react-query";
import {
	makeFetchChartMarkers,
	deleteMarker as APIDeleteMarker,
	updateMarker as APIUpdateMarker,
	queryClient,
} from "../../../api";
import { useLocation, useNavigate, useParams } from "react-router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { generateTo, NavigateWithQuery } from "../../../components";
import { SlideUpTransition } from "../../../components/SlideUpTransition";
import CloseIcon from "@mui/icons-material/Close";
import { useOnMobile } from "../../../utils";

export function EditChartMarkerPanel() {
	const { user } = useAuth();
	const markersQuery = useQuery(
		"charts/markers",
		makeFetchChartMarkers(user?.token),
	);

	const { markerID: rawMarkerID } = useParams();
	const selectedMarkerID = rawMarkerID && Number(rawMarkerID);
	const navigate = useNavigate();
	const location = useLocation();

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

	const onMobile = useOnMobile();

	function onDialogCLose() {
		navigate(generateTo("/manage/chart-markers", location));
	}

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

	async function deleteMarker() {
		if (!user?.token) {
			return;
		}

		if (!selectedMarker?.id) {
			return;
		}

		if (
			!window.confirm(
				`Are you sure you want to delete marker ${selectedMarker.id}`,
			)
		) {
			return;
		}

		await APIDeleteMarker(user.token, selectedMarker.id);

		queryClient.invalidateQueries("charts/markers");

		navigate(generateTo("/manage/chart-markers", location));
	}

	const readyToSave = readyToSubmit && changesMade && selectedMarker;

	async function saveChanges() {
		await submitEdit(selectedMarker!.id);
	}

	async function onEnabledChange(e: ChangeEvent<HTMLInputElement>) {
		if (!user?.token) {
			return;
		}

		if (!selectedMarker?.id) {
			return;
		}

		await APIUpdateMarker(user.token, selectedMarker.id, {
			enabled: e.target.checked,
		});

		queryClient.invalidateQueries("charts/markers");
	}

	const switchChecked = selectedMarker?.enabled ?? true;

	const layout = (
		<Box p={1}>
			<Stack
				direction="row"
				sx={{ pb: 1 }}
				gap={1}
				justifyContent="flex-end">
				<FormControlLabel
					sx={{ mr: "auto", ml: 0.1 }}
					control={
						<Switch
							disabled={!selectedMarker || markersQuery.isLoading}
							checked={switchChecked}
							onChange={onEnabledChange}
						/>
					}
					label={switchChecked ? "Enabled" : "Disabled"}
				/>
				<Button
					variant="outlined"
					color="error"
					onClick={deleteMarker}
					disabled={!selectedMarker?.id}>
					Delete
				</Button>
				<Button
					variant="contained"
					color="success"
					disabled={!readyToSave}
					onClick={saveChanges}>
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

	if (onMobile) {
		return (
			<Dialog
				fullScreen
				open={onMobile}
				onClose={onDialogCLose}
				TransitionComponent={SlideUpTransition}>
				<AppBar sx={{ position: "relative" }}>
					<Toolbar>
						<IconButton
							edge="start"
							color="inherit"
							onClick={onDialogCLose}
							aria-label="close">
							<CloseIcon />
						</IconButton>
						<Typography
							sx={{ ml: 2, flex: 1 }}
							variant="h6"
							component="div">
							Edit chart marker
						</Typography>
					</Toolbar>
				</AppBar>
				{layout}
			</Dialog>
		);
	}

	return layout;
}
