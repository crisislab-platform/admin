import { AlertTitle, Button, Grid, List, ListItem, Stack } from "@mui/material";
import { LoadingSpinner, SensorCard } from "../../../components";
import { Outlet, useNavigate } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import { CreateSensorDialog } from "./CreateSensorDialog";
import { SensorsList } from "./SensorsList";
import { makeFetchSensors } from "../../../api";
import useAuth from "../../../auth/useAuth";
import { useQuery } from "react-query";
import { useState } from "react";

export function SensorsPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const sensorsQuery = useQuery(
		"sensors",
		makeFetchSensors(user && user.token),
	);
	const [createSensorDialogOpen, setCreateSensorDialogOpen] = useState(false);

	function onCreateSensorDialogClose() {
		setCreateSensorDialogOpen(false);
	}

	return (
		<Grid container sx={{ w: "100%", h: "100%", flex: "1" }}>
			<Grid item xs={12} md={6}>
				<Stack>
					{!!user &&
						user.roles.find(
							(role) => role.raw === "sensors:write",
						) && (
							<Stack direction="row" sx={{ p: 1 }}>
								<Button
									startIcon={<AddIcon />}
									variant="contained"
									onClick={() =>
										setCreateSensorDialogOpen(true)
									}>
									Create sensor
								</Button>
								<CreateSensorDialog
									open={createSensorDialogOpen}
									onClose={onCreateSensorDialogClose}
								/>
							</Stack>
						)}

					<SensorsList />
				</Stack>
			</Grid>
			<Grid
				item
				xs={12}
				md={6}
				p={1}
				sx={{ maxHeight: "100%", overflow: "auto" }}>
				<Outlet />
			</Grid>
		</Grid>
	);
}
