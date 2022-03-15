import {
	Alert,
	AlertTitle,
	Button,
	List,
	ListItem,
	Stack,
} from "@mui/material";
import { LoadingSpinner, SensorCard } from "../../../components";

import AddIcon from "@mui/icons-material/Add";
import { CreateSensorDialog } from "./CreateSensorDialog";
import { makeFetchSensors } from "../../../api";
import useAuth from "../../../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useState } from "react";

export function SensorsPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const sensorsQuery = useQuery("sensors", makeFetchSensors(user.token));
	const [createSensorDialogOpen, setCreateSensorDialogOpen] = useState(false);

	if (sensorsQuery.isError) {
		return (
			<Alert severity="error" sx={{ m: 2 }}>
				<AlertTitle>An error occured while loading sensors.</AlertTitle>
				{sensorsQuery.error + ""}
			</Alert>
		);
	}

	function onCreateSensorDialogClose() {
		setCreateSensorDialogOpen(false);
	}

	return (
		<Stack sx={{ p: 1 }}>
			<Stack direction="row" sx={{ mb: 1 }}>
				<Button
					startIcon={<AddIcon />}
					variant="contained"
					onClick={() => setCreateSensorDialogOpen(true)}>
					Create sensor
				</Button>
				<CreateSensorDialog
					open={createSensorDialogOpen}
					onClose={onCreateSensorDialogClose}
				/>
			</Stack>
			{sensorsQuery.isLoading ? (
				<LoadingSpinner addPadding message="Loading sensors" />
			) : (
				<List
					disablePadding
					sx={{
						display: "flex",
						flexDirection: "row",
						flexWrap: "wrap",
						gap: 2,
					}}>
					{Object.values(sensorsQuery.data.sensors).map((sensor) => (
						<ListItem
							key={sensor.id}
							disablePadding
							sx={{ flex: "0" }}>
							<SensorCard
								sensor={sensor}
								onDetailsClick={() =>
									navigate(`./${sensor.id}`)
								}
							/>
						</ListItem>
					))}
				</List>
			)}
		</Stack>
	);
}
