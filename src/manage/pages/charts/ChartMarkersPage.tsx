import {
	Alert,
	AlertTitle,
	Button,
	GridLegacy as Grid,
	List,
	ListItemButton,
	ListItemText,
	Stack,
} from "@mui/material";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet, useLocation, useParams } from "react-router";
import { makeFetchChartMarkers } from "../../../api";
import useAuth from "../../../auth/useAuth";
import { LinkWithQuery, LoadingSpinner, useNavigateWithQuery } from "../../../components";
import { CreateThingForm } from "../../../components/CreateAndEditForms";
import { useOnMobile, useToolbarHeight } from "../../../utils";
import { useSensorTypes } from "../sensor-types/useSensorTypes";
import { getCreateAndEditMarkerSchema } from "./markerSchema";

export function ChartMarkersPage() {
	const { user } = useAuth();
	const markersQuery = useQuery(
		"charts/markers",
		makeFetchChartMarkers(user?.token),
	);
	const onMobile = useOnMobile();
	const toolbarHeight = useToolbarHeight();
	const location = useLocation();
	const navigateWithQuery = useNavigateWithQuery();

	const [createMakerFormOpen, setCreateMarkerFormOpen] = useState(false);

	function openCreateMarkerForm() {
		setCreateMarkerFormOpen(true);
	}
	function closeCreateMarkerForm() {
		setCreateMarkerFormOpen(false);
	}
	const { markerID: rawMarkerID } = useParams();
	const selectedMarkerID = rawMarkerID && Number(rawMarkerID);
	const sensorTypes = useSensorTypes();

	const schema = getCreateAndEditMarkerSchema(user!.token, sensorTypes);

	const onCreate = () =>
		navigateWithQuery("/manage/chart-markers", location);

	return (
		<Grid
			container
			sx={{
				height: `calc(100vh - ${toolbarHeight}px)`,
				maxHeight: `calc(100vh - ${toolbarHeight}px)`,
				w: "100%",
				flex: "1",
			}}>
			<Grid
				item
				xs={12}
				lg={6}
				sx={{
					height: "100%",
					maxHeight: "100%",
					overflow: "auto",
					borderRight: (theme) =>
						`1px solid ${theme.palette.divider}`,
				}}>
				<Stack>
					<Stack
						direction="row"
						sx={{
							backgroundColor: (theme) =>
								theme.palette.background.default,
							position: "sticky",
							top: 0,
							paddingTop: (theme) => theme.spacing(1),
							zIndex: (theme) => theme.zIndex.appBar - 1,
							borderBottom: (theme) =>
								`1px solid ${theme.palette.divider}`,
						}}
						p={1}>
						<Button
							variant="contained"
							sx={{ ml: "auto" }}
							onClick={openCreateMarkerForm}>
							Create marker
						</Button>
						<CreateThingForm
							title="Create new Marker"
							open={createMakerFormOpen}
							onClose={closeCreateMarkerForm}
							onCreate={onCreate}
							schema={schema}
						/>
					</Stack>
					{markersQuery.data && (
						<List disablePadding>
							{markersQuery.data.map((marker) => (
								<ListItemButton
									component={LinkWithQuery}
									to={`/manage/chart-markers/${marker.id}`}
									key={marker.id}
									selected={marker.id === selectedMarkerID}>
									<ListItemText
										primary={marker.label}
										secondary={`${marker.sensor_type} - ${marker.sensor_channel}`}
									/>
								</ListItemButton>
							))}
						</List>
					)}
					{markersQuery.isLoading && (
						<LoadingSpinner
							addPadding
							message="Loading chart markers"
						/>
					)}
					{markersQuery.isError && (
						<Alert sx={{ borderRadius: 0 }} severity="error">
							<AlertTitle>Error loading chart markers</AlertTitle>
							{markersQuery.error + ""}
						</Alert>
					)}
				</Stack>
			</Grid>
			{onMobile ? (
				<Outlet />
			) : (
				<Grid
					item
					xs={12}
					md={6}
					sx={{
						height: "100%",
						maxHeight: "100%",
						overflow: "auto",
					}}>
					<Outlet />
				</Grid>
			)}
		</Grid>
	);
}
