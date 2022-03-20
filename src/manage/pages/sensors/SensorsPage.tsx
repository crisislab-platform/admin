import { Button, Grid, Stack } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import { CreateSensorDialog } from "./CreateSensorDialog";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Outlet } from "react-router-dom";
import { Sensor } from "../../../types";
import { SensorsList } from "./SensorsList";
import SortIcon from "@mui/icons-material/Sort";
import useAuth from "../../../auth/useAuth";
import { useState } from "react";

export function SensorsPage() {
	const { user } = useAuth();
	const [createSensorDialogOpen, setCreateSensorDialogOpen] = useState(false);
	const [sortBy, setSortBy] = useState<null | keyof Sensor>(null);

	function onCreateSensorDialogClose() {
		setCreateSensorDialogOpen(false);
	}

	return (
		<Grid container sx={{ w: "100%", h: "100%", flex: "1" }}>
			<Grid item xs={12} md={6}>
				<Stack>
					<Stack
						direction="row"
						sx={{ p: 1 }}
						gap={1}
						alignItems="center">
						{!!user &&
							user.roles.find(
								(role) => role.raw === "sensors:write",
							) && (
								<>
									<Button
										startIcon={<AddIcon />}
										variant="contained"
										size="small"
										onClick={() =>
											setCreateSensorDialogOpen(true)
										}>
										Create sensor
									</Button>
									<CreateSensorDialog
										open={createSensorDialogOpen}
										onClose={onCreateSensorDialogClose}
									/>
								</>
							)}
						<Button startIcon={<SortIcon />} size="small">
							Sort
						</Button>
						<Button startIcon={<FilterListIcon />} size="small">
							Filter
						</Button>
					</Stack>

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
