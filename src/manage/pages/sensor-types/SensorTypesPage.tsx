import {
	Alert,
	AlertTitle,
	Button,
	Grid,
	List,
	ListItemButton,
	ListItemText,
	Stack,
} from "@mui/material";
import { useState } from "react";
import { useQuery } from "react-query";
import { Outlet, useLocation, useParams } from "react-router";
import { makeFetchSensorTypes } from "../../../api";
import useAuth from "../../../auth/useAuth";
import { LinkWithQuery, LoadingSpinner, useNavigateWithQuery } from "../../../components";
import { useOnMobile, useToolbarHeight } from "../../../utils";
import { CreateSensorTypeForm } from "./CreateSensorTypeForm";

export function SensorTypesPage() {
	const { user } = useAuth();
	const sensorTypesQuery = useQuery(
		"sensor-types",
		makeFetchSensorTypes(user?.token),
	);
	const onMobile = useOnMobile();
	const toolbarHeight = useToolbarHeight();
	const location = useLocation();
	const navigate = useNavigateWithQuery();

	const [createSensorTypeFormOpen, setCreateSensorTypeFormOpen] = useState(false);

	function openCreateSensorTypeForm() {
		setCreateSensorTypeFormOpen(true);
	}
	function closeCreateSensorTypeForm() {
		setCreateSensorTypeFormOpen(false);
	}
	const { sensorTypeName: rawSensorTypeName } = useParams();
	const selectedSensorTypeName = rawSensorTypeName && decodeURIComponent(rawSensorTypeName);

	const onCreate = () =>
		navigate("/manage/sensor-types");

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
							onClick={openCreateSensorTypeForm}>
							Create sensor type
						</Button>
						<CreateSensorTypeForm
							open={createSensorTypeFormOpen}
							onClose={closeCreateSensorTypeForm}
							onCreate={onCreate}
						/>
					</Stack>
					{sensorTypesQuery.data && (
						<>
							{sensorTypesQuery.data.length === 0 ? (
								<Alert severity="info" sx={{ m: 2 }}>
									<AlertTitle>No sensor types found</AlertTitle>
									{sensorTypesQuery.isError ? (
										"The server may not support sensor types yet, or there was an error loading them."
									) : (
										"No sensor types have been created yet. Create one using the button above."
									)}
								</Alert>
							) : (
								<List disablePadding>
									{sensorTypesQuery.data.map((sensorType) => (
										<ListItemButton
											component={LinkWithQuery}
											to={`./${encodeURIComponent(sensorType.name)}`}
											key={sensorType.name}
											selected={sensorType.name === selectedSensorTypeName}>
											<ListItemText
												primary={sensorType.name}
												secondary={`${sensorType.channels?.length || 0} channels`}
											/>
										</ListItemButton>
									))}
								</List>
							)}
						</>
					)}
					{sensorTypesQuery.isLoading && (
						<LoadingSpinner
							addPadding
							message="Loading sensor types"
						/>
					)}
					{sensorTypesQuery.isError && (
						<Alert sx={{ borderRadius: 0 }} severity="error">
							<AlertTitle>Error loading sensor types</AlertTitle>
							{String(sensorTypesQuery.error).includes("404") || String(sensorTypesQuery.error).includes("not found") ? (
								<>
									This server does not support sensor types management yet. 
									<br />
									Please update the server to the latest version to use this feature.
								</>
							) : (
								String(sensorTypesQuery.error)
							)}
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